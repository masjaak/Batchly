import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useRecipes } from '@/hooks/useRecipes'
import { useCreateProductionBatch } from '@/hooks/useProductionBatches'
import { calculateBatchCostVariance } from '@/lib/calculations'
import { toast } from 'sonner'

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        value={recipeId}
        onChange={(e) => {
          setRecipeId(e.target.value)
          const r = recipes?.find((rec: any) => rec.id === e.target.value)
          if (r) setPlannedQty(String(r.yield_amount))
        }}
        required
        className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
      >
        <option value="">Pilih resep...</option>
        {recipes?.map((r: any) => (
          <option key={r.id} value={r.id}>
            {r.name} ({r.yield_amount} {r.yield_unit})
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Jumlah direncanakan"
          value={plannedQty}
          onChange={(e) => setPlannedQty(e.target.value)}
          className="h-12 flex-1 rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
        />
        <input
          type="number"
          placeholder="Jumlah aktual *"
          value={actualQty}
          onChange={(e) => setActualQty(e.target.value)}
          required
          min="1"
          className="h-12 flex-1 rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
        />
      </div>

      <input
        type="date"
        value={productionDate}
        onChange={(e) => setProductionDate(e.target.value)}
        className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
      />

      <textarea
        placeholder="Catatan (opsional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-base outline-none focus:border-primary"
      />

      {selectedRecipe && Number(actualQty) > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs font-medium text-secondary uppercase tracking-wider">
            Pratinjau Pengurangan Stok
          </p>
          {selectedRecipe.recipe_items && selectedRecipe.recipe_items.length > 0 ? (
            <div className="space-y-1">
              {selectedRecipe.recipe_items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-primary">{item.ingredient?.name}</span>
                  <span className="text-secondary">
                    -{(item.quantity * scaleFactor).toFixed(2)} {item.unit}
                  </span>
                </div>
              ))}
              <p className="mt-2 text-xs text-warning">Stok bahan akan otomatis dikurangi saat disimpan</p>
            </div>
          ) : (
            <p className="text-sm text-secondary">Resep tidak memiliki bahan (tidak ada pengurangan stok)</p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-lg bg-primary text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? 'Menyimpan...' : 'Simpan & Kurangi Stok'}
      </button>
    </form>
  )
}
