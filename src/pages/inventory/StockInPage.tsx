import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStockIn } from '@/hooks/useInventoryTransactions'
import { useIngredients } from '@/hooks/useIngredients'
import { useSuppliers } from '@/hooks/useSuppliers'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { formatCurrency } from '@/lib/calculations'

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
  const total = (Number(quantity) || 0) * (Number(unitPrice) || 0)

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
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-mint-strong">
            <Icon name="arrow-down" size={18} />
          </span>
          <CardHeader title="Stok Masuk" subtitle="Tambah stok bahan dan catat harga beli terbaru." />
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary">Bahan</label>
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
            {ingredients && ingredients.length === 0 ? (
              <p className="mt-1.5 text-xs text-secondary">
                Belum ada bahan.{' '}
                <Link to="/app/inventory/new" className="font-semibold text-ink underline">Tambah bahan baru</Link> dulu.
              </p>
            ) : (
              <Link to="/app/inventory/new" className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-ink">
                <Icon name="plus" size={12} /> Bahan baru
              </Link>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary">Jumlah</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
              />
              {selectedIngredient && <p className="mt-1 text-xs text-secondary">Satuan: {selectedIngredient.unit}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary">Harga Satuan (Rp)</label>
              <input
                type="number"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                required
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary">Pemasok (opsional)</label>
            <Select
              value={supplierId}
              onValueChange={setSupplierId}
              placeholder="Pilih pemasok..."
              options={(suppliers ?? []).map((sup) => ({ value: sup.id, label: sup.name }))}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary">Catatan (opsional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
              placeholder="cth. Beli di pasar, kondisi baik"
            />
          </div>

          {total > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted px-4 py-3">
              <p className="text-sm text-secondary">Total</p>
              <p className="text-lg font-semibold text-ink tnum">{formatCurrency(total)}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? 'Menyimpan...' : 'Simpan Stok Masuk'}
            </Button>
            <Link to="/app/inventory"><Button type="button" variant="secondary">Batal</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
