import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useRecipes } from '@/hooks/useRecipes'
import { useCreateProductionBatch } from '@/hooks/useProductionBatches'
import { toast } from 'sonner'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'

export default function NewBatchPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: recipes } = useRecipes()
  const { mutateAsync: createBatch, isPending } = useCreateProductionBatch()

  const [recipeId, setRecipeId] = useState(searchParams.get('recipe') ?? '')
  const [plannedQty, setPlannedQty] = useState('')
  const [actualQty, setActualQty] = useState('')
  const [productionDate, setProductionDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const selectedRecipe = recipes?.find((r: any) => r.id === recipeId)

  useEffect(() => {
    if (selectedRecipe && !plannedQty) {
      setPlannedQty(String(selectedRecipe.yield_amount))
    }
  }, [selectedRecipe])

  const scaleFactor = selectedRecipe && Number(actualQty) > 0
    ? Number(actualQty) / (selectedRecipe.yield_amount || 1)
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipeId || !actualQty || Number(actualQty) <= 0) return

    try {
      const batch = await createBatch({
        recipe_id: recipeId,
        planned_qty: Number(plannedQty) || 0,
        actual_qty: Number(actualQty),
        production_date: productionDate,
        notes: notes || undefined,
      })
      toast.success('Produksi tercatat. Stok bahan berkurang.')
      navigate(`/app/production/${batch.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Gagal mencatat produksi')
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender text-grape">
          <Icon name="factory" size={18} />
        </span>
        <CardHeader title="Catat Produksi" subtitle="Pilih resep & jumlah yang dibuat." />
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-secondary">Resep</label>
          <Select
            value={recipeId}
            onValueChange={(v) => {
              setRecipeId(v)
              const r = recipes?.find((rec: any) => rec.id === v)
              if (r) setPlannedQty(String(r.yield_amount))
            }}
            placeholder="Pilih resep..."
            options={(recipes ?? []).map((r: any) => ({ value: r.id, label: `${r.name} (${r.yield_amount} ${r.yield_unit})` }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary">Jumlah Direncanakan</label>
            <Input type="number" value={plannedQty} onChange={(e) => setPlannedQty(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary">Jumlah Aktual *</label>
            <Input type="number" value={actualQty} onChange={(e) => setActualQty(e.target.value)} required min={1} placeholder="0" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-secondary">Tanggal Produksi</label>
          <Input type="date" value={productionDate} onChange={(e) => setProductionDate(e.target.value)} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-secondary">Catatan (opsional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="cth. Ada bahan yang hampir kadaluarsa"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
          />
        </div>

        {selectedRecipe && Number(actualQty) > 0 && (
          <div className="rounded-2xl border border-border bg-surface-muted p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-secondary">Pratinjau Pengurangan Stok</p>
            {selectedRecipe.recipe_items && selectedRecipe.recipe_items.length > 0 ? (
              <div className="space-y-1.5">
                {selectedRecipe.recipe_items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm">
                    <span className="text-ink">{item.ingredient?.name}</span>
                    <span className="font-semibold text-pink-strong tnum">
                      −{(item.quantity * scaleFactor).toFixed(2)} {item.unit}
                    </span>
                  </div>
                ))}
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-yellow/30 px-3 py-2 text-xs text-warning">
                  <Icon name="info" size={12} /> Stok bahan akan otomatis dikurangi saat disimpan.
                </div>
              </div>
            ) : (
              <p className="text-sm text-secondary">Resep tidak memiliki bahan (tidak ada pengurangan stok)</p>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? 'Menyimpan...' : 'Simpan & Kurangi Stok'}
          </Button>
          <Link to="/app/production"><Button type="button" variant="secondary">Batal</Button></Link>
        </div>
      </form>
    </Card>
  )
}
