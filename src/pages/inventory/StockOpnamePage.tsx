import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIngredients, useUpdateIngredient } from '@/hooks/useIngredients'
import { useStockIn } from '@/hooks/useInventoryTransactions'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

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
  const { data: ingredients } = useIngredients()
  const { mutateAsync: stockIn } = useStockIn()

  const [entries, setEntries] = useState<OpnameEntry[]>([])
  const [confirmed, setConfirmed] = useState(false)

  if (ingredients && entries.length === 0) {
    setEntries(
      ingredients.map((i) => ({
        ingredientId: i.id,
        name: i.name,
        unit: i.unit,
        systemQty: i.current_stock,
        physicalQty: i.current_stock,
      })),
    )
  }

  const differences = entries.filter((e) => e.systemQty !== e.physicalQty)

  const updatePhysical = (ingredientId: string, value: number) => {
    setEntries((prev) =>
      prev.map((e) => (e.ingredientId === ingredientId ? { ...e, physicalQty: value } : e)),
    )
  }

  const handleConfirm = async () => {
    if (!organization) return
    setConfirmed(true)

    try {
      for (const entry of differences) {
        const diff = entry.physicalQty - entry.systemQty
        if (diff !== 0) {
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
      toast.success(`Opname selesai. ${differences.length} bahan disesuaikan.`)
      navigate('/app/inventory')
    } catch {
      toast.error('Gagal menyimpan opname')
      setConfirmed(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">
        Catat jumlah fisik bahan Anda. Sistem akan menghitung selisih.
      </p>

      {entries.map((entry) => (
        <div key={entry.ingredientId} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">{entry.name}</p>
              <p className="text-xs text-secondary">Sistem: {entry.systemQty} {entry.unit}</p>
            </div>
            <div className="text-right">
              <input
                type="number"
                value={entry.physicalQty}
                onChange={(e) => updatePhysical(entry.ingredientId, Number(e.target.value))}
                className="h-10 w-24 rounded-lg border border-border bg-surface px-3 text-right text-base outline-none focus:border-primary"
                disabled={confirmed}
              />
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
        {confirmed ? 'Tersimpan' : 'Konfirmasi Opname'}
      </button>
    </div>
  )
}
