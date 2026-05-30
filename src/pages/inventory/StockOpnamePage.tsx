import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIngredients } from '@/hooks/useIngredients'
import { useStockIn } from '@/hooks/useInventoryTransactions'
import { useAuth } from '@/hooks/useAuth'
import { saveOpnameCount, getOpnameCounts, clearOpnameCounts } from '@/lib/offline'
import { toast } from 'sonner'
import VoiceInput from '@/components/opname/VoiceInput'

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
          // Check for conflict: has stock changed since we loaded?
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
    return <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary">
          Catat jumlah fisik bahan. Sistem menghitung selisih.
        </p>
        <span className={`flex items-center gap-1 text-xs font-medium ${isOnline ? 'text-success' : 'text-warning'}`}>
          <span className={`inline-block h-2 w-2 rounded-full ${isOnline ? 'bg-success' : 'bg-warning'}`} />
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {pendingCounts > 0 && isOnline && (
        <div className="rounded-xl border border-warning/30 bg-orange-50 p-3">
          <p className="text-sm font-medium text-warning">
            {pendingCounts} data opname tersimpan offline. Konfirmasi untuk menyinkronkan.
          </p>
        </div>
      )}

      {entries.map((entry) => (
        <div key={entry.ingredientId} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">{entry.name}</p>
              <p className="text-xs text-secondary">Sistem: {entry.systemQty} {entry.unit}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <VoiceInput
                  onResult={(value) => updatePhysical(entry.ingredientId, value)}
                  disabled={confirmed}
                />
                <input
                  type="number"
                  value={entry.physicalQty}
                  onChange={(e) => updatePhysical(entry.ingredientId, Number(e.target.value))}
                  className="h-10 w-24 rounded-lg border border-border bg-surface px-3 text-right text-base outline-none focus:border-primary"
                  disabled={confirmed}
                />
              </div>
            </div>
          </div>
          <div className="mt-2 text-right">
            <span className={`text-xs font-medium ${
              entry.systemQty === entry.physicalQty
                ? 'text-success'
                : 'text-warning'
            }`}>
              {entry.systemQty === entry.physicalQty
                ? '✓ Cocok'
                : `Selisih: ${(entry.physicalQty - entry.systemQty) > 0 ? '+' : ''}${(entry.physicalQty - entry.systemQty)} ${entry.unit}`
              }
            </span>
          </div>
        </div>
      ))}

      {entries.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-secondary">
            {entries.length} bahan diperiksa, {differences.length} perlu penyesuaian
          </p>
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={confirmed || differences.length === 0}
        className="h-12 w-full rounded-lg bg-primary text-base font-medium text-white disabled:opacity-50"
      >
        {confirmed
          ? (isOnline ? 'Tersimpan' : 'Tersimpan (offline)')
          : (isOnline ? 'Konfirmasi Opname' : 'Simpan Offline')
        }
      </button>
    </div>
  )
}
