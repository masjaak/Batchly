import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIngredients } from '@/hooks/useIngredients'
import { useStockIn } from '@/hooks/useInventoryTransactions'
import { useAuth } from '@/hooks/useAuth'
import { saveOpnameCount, getOpnameCounts, clearOpnameCounts } from '@/lib/offline'
import { toast } from 'sonner'
import VoiceInput from '@/components/opname/VoiceInput'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'

interface OpnameEntry {
  ingredientId: string
  name: string
  unit: string
  systemQty: number
  physicalQty: number
}

export default function StockOpnamePage() {
  const navigate = useNavigate()
  const { organization } = useAuth()
  const { data: ingredients, isLoading } = useIngredients()
  const { mutateAsync: stockIn } = useStockIn()

  const [entries, setEntries] = useState<OpnameEntry[]>([])
  const [confirmed, setConfirmed] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingCounts, setPendingCounts] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!ingredients || entries.length > 0) return
    const init = async () => {
      const saved = await getOpnameCounts()
      const offlineCount = Object.keys(saved).length
      setPendingCounts(offlineCount)

      setEntries(
        ingredients.map((i) => ({
          ingredientId: i.id,
          name: i.name,
          unit: i.unit,
          systemQty: i.current_stock,
          physicalQty: saved[i.id] ?? i.current_stock,
        })),
      )
    }
    init()
  }, [ingredients])

  const differences = entries.filter((e) => e.systemQty !== e.physicalQty)

  const updatePhysical = (ingredientId: string, value: number) => {
    setEntries((prev) =>
      prev.map((e) => (e.ingredientId === ingredientId ? { ...e, physicalQty: value } : e)),
    )
    saveOpnameCount(ingredientId, value)
  }

  const handleConfirm = async () => {
    if (!organization) return

    if (!isOnline) {
      toast.info('Data tersimpan offline. Sinkronkan saat online.')
      setConfirmed(true)
      return
    }

    setConfirmed(true)
    try {
      for (const entry of differences) {
        const diff = entry.physicalQty - entry.systemQty
        if (diff !== 0) {
          const currentIngredient = ingredients?.find((i) => i.id === entry.ingredientId)
          if (currentIngredient && currentIngredient.current_stock !== entry.systemQty) {
            toast.warning(`Stok ${entry.name} berubah sejak dimuat. Periksa kembali.`)
          }

          await stockIn({
            organization_id: organization.id,
            ingredient_id: entry.ingredientId,
            quantity: diff,
            unit_price: 0,
            notes: `Penyesuaian opname: ${entry.systemQty} → ${entry.physicalQty} ${entry.unit}`,
            transaction_date: new Date().toISOString().split('T')[0],
          })
        }
      }
      await clearOpnameCounts()
      toast.success(`Opname selesai. ${differences.length} bahan disesuaikan.`)
      navigate('/app/inventory')
    } catch {
      toast.error('Gagal menyimpan opname')
      setConfirmed(false)
    }
  }

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-2xl bg-surface-muted border border-border" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Stok"
        title="Stock Opname"
        subtitle="Catat jumlah fisik bahan — sistem akan hitung selisih otomatis."
        action={
          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
            isOnline ? 'bg-mint text-mint-strong' : 'bg-yellow text-yellow-strong',
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', isOnline ? 'bg-mint-strong' : 'bg-yellow-strong')} />
            {isOnline ? 'Online' : 'Offline'}
          </span>
        }
      />

      {pendingCounts > 0 && isOnline && (
        <div className="flex items-center gap-3 rounded-2xl border border-yellow bg-yellow/20 p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow text-yellow-strong">
            <Icon name="info" size={14} />
          </span>
          <p className="text-sm text-ink">
            <span className="font-semibold">{pendingCounts} data opname</span> tersimpan offline. Konfirmasi untuk menyinkronkan.
          </p>
        </div>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender text-grape">
              <Icon name="check" size={18} />
            </span>
            <CardHeader title="Progress" subtitle={`${entries.length} bahan, ${differences.length} selisih`} />
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        {entries.map((entry) => {
          const diff = entry.physicalQty - entry.systemQty
          const match = diff === 0
          return (
            <div key={entry.ingredientId} className={cn(
              'rounded-2xl border bg-surface p-4 transition-colors',
              match ? 'border-border' : 'border-pink',
            )}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{entry.name}</p>
                  <p className="mt-0.5 text-xs text-secondary tnum">Sistem: {entry.systemQty} {entry.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <VoiceInput onResult={(value) => updatePhysical(entry.ingredientId, value)} disabled={confirmed} />
                  <input
                    type="number"
                    value={entry.physicalQty}
                    onChange={(e) => updatePhysical(entry.ingredientId, Number(e.target.value))}
                    className="h-10 w-24 rounded-xl border border-border bg-surface px-3 text-right text-sm tnum outline-none focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
                    disabled={confirmed}
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-secondary">{entry.unit}</span>
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tnum',
                  match ? 'bg-mint text-mint-strong' : 'bg-pink text-pink-strong',
                )}>
                  <Icon name={match ? 'check' : diff > 0 ? 'trending-up' : 'trending-down'} size={11} />
                  {match ? 'Cocok' : `Selisih ${diff > 0 ? '+' : ''}${diff}`}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="sticky bottom-20 lg:bottom-4">
        <Button
          onClick={handleConfirm}
          disabled={confirmed || differences.length === 0}
          className="w-full shadow-pop"
          size="lg"
        >
          {confirmed
            ? (isOnline ? 'Tersimpan' : 'Tersimpan (offline)')
            : (isOnline ? `Konfirmasi Opname (${differences.length} selisih)` : 'Simpan Offline')
          }
        </Button>
      </div>
    </div>
  )
}
