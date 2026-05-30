import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStockOut } from '@/hooks/useInventoryTransactions'
import { useIngredients } from '@/hooks/useIngredients'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

const reasons = [
  { value: 'used', label: 'Terpakai' },
  { value: 'expired', label: 'Kadaluarsa' },
  { value: 'damaged', label: 'Rusak' },
  { value: 'adjustment', label: 'Penyesuaian' },
]

export default function StockOutPage() {
  const navigate = useNavigate()
  const { organization } = useAuth()
  const { mutateAsync: stockOut, isPending } = useStockOut()
  const { data: ingredients } = useIngredients()

  const [ingredientId, setIngredientId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('used')
  const [notes, setNotes] = useState('')

  const selectedIngredient = ingredients?.find((i) => i.id === ingredientId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization || !ingredientId || !quantity) return

    try {
      await stockOut({
        organization_id: organization.id,
        ingredient_id: ingredientId,
        quantity: -Math.abs(Number(quantity)),
        reason,
        notes: notes || undefined,
        transaction_date: new Date().toISOString().split('T')[0],
      })
      toast.success('Stok berhasil dikeluarkan')
      navigate('/app/inventory')
    } catch {
      toast.error('Gagal mengeluarkan stok')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-secondary">Bahan</label>
        <select
          value={ingredientId}
          onChange={(e) => setIngredientId(e.target.value)}
          required
          className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
        >
          <option value="">Pilih bahan...</option>
          {ingredients?.map((ing) => (
            <option key={ing.id} value={ing.id}>
              {ing.name} ({ing.current_stock} {ing.unit})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-secondary">Jumlah</label>
        <input
          type="number"
          min="0"
          step="0.1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
        />
        {selectedIngredient && (
          <p className="mt-1 text-xs text-secondary">Stok saat ini: {selectedIngredient.current_stock} {selectedIngredient.unit}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-secondary">Alasan</label>
        <div className="space-y-2">
          {reasons.map((r) => (
            <label key={r.value} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={(e) => setReason(e.target.value)}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm text-primary">{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-secondary">Catatan (opsional)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-lg bg-primary text-base font-medium text-white disabled:opacity-50"
      >
        {isPending ? 'Menyimpan...' : 'Simpan Stok Keluar'}
      </button>
    </form>
  )
}
