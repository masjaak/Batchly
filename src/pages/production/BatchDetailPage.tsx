import { useParams } from 'react-router-dom'
import { useProductionBatch } from '@/hooks/useProductionBatches'
import { calculateBatchCostVariance, formatCurrency } from '@/lib/calculations'

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: batch, isLoading } = useProductionBatch(id!)

  if (isLoading) {
    return <div className="h-20 animate-pulse rounded-xl bg-surface-muted border border-border" />
  }

  if (!batch) {
    return <p className="text-sm text-secondary">Batch tidak ditemukan</p>
  }

  const recipeInput = {
    overhead_pct: batch.recipe.overhead_pct ?? 0,
    packaging_cost: batch.recipe.packaging_cost ?? 0,
    selling_price: batch.recipe.selling_price ?? 0,
    yield_amount: batch.recipe.yield_amount,
  }

  const items = (batch.recipe.recipe_items ?? []).map((item: any) => ({
    quantity: item.quantity,
    cost_at_create: item.cost_at_create,
    ingredient_name: item.ingredient?.name ?? '',
  }))

  const variance = calculateBatchCostVariance(
    recipeInput,
    items,
    batch.planned_qty,
    batch.actual_qty,
  )

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{batch.batch_number}</p>
            <p className="text-xs text-secondary">{batch.recipe?.name}</p>
          </div>
          <p className="text-xs text-secondary">{batch.production_date}</p>
        </div>
        <div className="mt-3 flex justify-between text-sm">
          <span className="text-secondary">Direncanakan</span>
          <span className="font-medium">{batch.planned_qty}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary">Aktual</span>
          <span className="font-medium">{batch.actual_qty}</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-2 text-xs font-medium text-secondary uppercase tracking-wider">Varian Biaya</p>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Biaya Rencana</span>
            <span className="font-medium">{formatCurrency(variance.plannedCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Biaya Aktual</span>
            <span className="font-medium">{formatCurrency(variance.actualCost)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1 text-sm">
            <span className="font-medium">Selisih</span>
            <span className={`font-semibold ${variance.variance >= 0 ? 'text-danger' : 'text-success'}`}>
              {variance.variance >= 0 ? '+' : ''}{formatCurrency(variance.variance)} ({variance.variancePct.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {variance.ingredients.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs font-medium text-secondary uppercase tracking-wider">Bahan</p>
          <div className="space-y-2">
            {variance.ingredients.map((ing, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div>
                  <p className="text-primary">{ing.name}</p>
                  <p className="text-xs text-secondary">
                    {ing.plannedQty.toFixed(2)} → {ing.actualQty.toFixed(2)} @ {formatCurrency(ing.costAtCreate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(ing.actualCost)}</p>
                  <p className={`text-xs ${ing.actualCost >= ing.plannedCost ? 'text-danger' : 'text-success'}`}>
                    {ing.actualCost >= ing.plannedCost ? '+' : ''}{formatCurrency(ing.actualCost - ing.plannedCost)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {batch.notes && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-1 text-xs font-medium text-secondary uppercase tracking-wider">Catatan</p>
          <p className="text-sm text-primary">{batch.notes}</p>
        </div>
      )}
    </div>
  )
}
