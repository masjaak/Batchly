import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStockIn } from '@/hooks/useInventoryTransactions'
import { useIngredients } from '@/hooks/useIngredients'
import { useSuppliers } from '@/hooks/useSuppliers'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Select } from '@/components/ui/Select'

export default function StockInPage() {
  const navigate = useNavigate()
  const { organization } = useAuth()
  const { mutateAsync: stockIn, isPending } = useStockIn()
  const { data: ingredients } = useIngredients()
  const { data: suppliers } = useSuppliers()

  const [ingredientId, setIngredientId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [notes, setNotes] = useState('')

  const selectedIngredient = ingredients?.find((i) => i.id === ingredientId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization || !ingredientId || !quantity || !unitPrice) return

    try {
      await stockIn({
        organization_id: organization.id,
        ingredient_id: ingredientId,
        quantity: Number(quantity),
        unit_price: Number(unitPrice),
        supplier_id: supplierId || undefined,
        notes: notes || undefined,
        transaction_date: new Date().toISOString().split('T')[0],
      })
      toast.success('Stok berhasil ditambahkan')
      navigate('/app/inventory')
    } catch {
      toast.error('Gagal menambahkan stok')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-secondary">Bahan</label>
        <Select
          value={ingredientId}
          onValueChange={(v) => {
            setIngredientId(v)
            const ing = ingredients?.find((i) => i.id === v)
            if (ing && ing.latest_price > 0 && !unitPrice) {
              setUnitPrice(String(ing.latest_price))
            }
          }}
          placeholder="Pilih bahan..."
          options={(ingredients ?? []).map((ing) => ({ value: ing.id, label: `${ing.name} (${ing.current_stock} ${ing.unit})` }))}
        />
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
          className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {selectedIngredient && (
          <p className="mt-1 text-xs text-secondary">Satuan: {selectedIngredient.unit}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-secondary">Harga Satuan (Rp)</label>
        <input
          type="number"
          min="0"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          required
          className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-secondary">Pemasok (opsional)</label>
        <Select
          value={supplierId}
          onValueChange={setSupplierId}
          placeholder="Pilih pemasok..."
          options={(suppliers ?? []).map((sup) => ({ value: sup.id, label: sup.name }))}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-secondary">Catatan (opsional)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {quantity && unitPrice && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-secondary">Total: <span className="font-semibold text-primary">Rp {(Number(quantity) * Number(unitPrice)).toLocaleString('id-ID')}</span></p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-xl bg-ink text-base font-medium text-white disabled:opacity-50"
      >
        {isPending ? 'Menyimpan...' : 'Simpan Stok Masuk'}
      </button>
    </form>
  )
}
