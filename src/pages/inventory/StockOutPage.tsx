import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStockOut } from '@/hooks/useInventoryTransactions'
import { useIngredients } from '@/hooks/useIngredients'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

const reasons = [
  { value: 'used', label: 'Terpakai', icon: 'arrow-up' as const, bg: 'bg-lavender', text: 'text-grape' },
  { value: 'expired', label: 'Kadaluarsa', icon: 'clock' as const, bg: 'bg-pink', text: 'text-pink-strong' },
  { value: 'damaged', label: 'Rusak', icon: 'alert' as const, bg: 'bg-yellow', text: 'text-yellow-strong' },
  { value: 'adjustment', label: 'Penyesuaian', icon: 'gear' as const, bg: 'bg-blue', text: 'text-blue-strong' },
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
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink text-pink-strong">
          <Icon name="arrow-up" size={18} />
        </span>
        <CardHeader title="Stok Keluar" subtitle="Kurangi stok bahan (terpakai, kadaluarsa, atau rusak)." />
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-secondary">Bahan</label>
          <Select
            value={ingredientId}
            onValueChange={setIngredientId}
            placeholder="Pilih bahan..."
            options={(ingredients ?? []).map((ing) => ({ value: ing.id, label: `${ing.name} (${ing.current_stock} ${ing.unit})` }))}
          />
        </div>

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
          {selectedIngredient && (
            <p className="mt-1 text-xs text-secondary">Stok saat ini: {selectedIngredient.current_stock} {selectedIngredient.unit}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-secondary">Alasan</label>
          <div className="grid grid-cols-2 gap-2">
            {reasons.map((r) => {
              const active = reason === r.value
              return (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-2xl border p-3 transition-colors ${active ? 'border-ink bg-surface-muted' : 'border-border bg-surface hover:bg-surface-muted'}`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={active}
                    onChange={(e) => setReason(e.target.value)}
                    className="sr-only"
                  />
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${r.bg} ${r.text}`}>
                    <Icon name={r.icon} size={14} />
                  </span>
                  <span className="text-sm font-medium text-ink">{r.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-secondary">Catatan (opsional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
            placeholder="cth. Terpakai untuk catering hari ini"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? 'Menyimpan...' : 'Simpan Stok Keluar'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/app/inventory')}>Batal</Button>
        </div>
      </form>
    </Card>
  )
}
