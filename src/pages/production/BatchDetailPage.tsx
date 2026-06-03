import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProductionBatch, useDeleteProductionBatch } from '@/hooks/useProductionBatches'
import { calculateBatchCostVariance, formatCurrency } from '@/lib/calculations'
import { toast } from 'sonner'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { StatCard } from '@/components/ui/StatCard'
import { cn } from '@/lib/utils'

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: batch, isLoading } = useProductionBatch(id!)
  const { mutateAsync: deleteBatch } = useDeleteProductionBatch()

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-2xl bg-surface-muted border border-border" />
  }

  if (!batch) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-secondary">Batch tidak ditemukan</p>
        <Link to="/app/production" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink underline">
          <Icon name="chevron-left" size={14} /> Kembali
        </Link>
      </div>
    )
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

  const variance = calculateBatchCostVariance(recipeInput, items, batch.planned_qty, batch.actual_qty)
  const ageHours = (Date.now() - new Date(batch.created_at).getTime()) / (1000 * 60 * 60)
  const canDelete = ageHours <= 24
  const variancePctAbs = Math.abs(variance.variancePct)
  const varianceOver = variance.variance > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/app/production" className="inline-flex items-center gap-1 text-sm font-semibold text-secondary transition-colors hover:text-ink">
          <Icon name="chevron-left" size={14} /> Kembali ke Produksi
        </Link>
        {canDelete && (
          <Button
            variant="secondary"
            onClick={async () => {
              if (!window.confirm(`Hapus batch ${batch.batch_number}? Stok bahan akan dikembalikan otomatis.`)) return
              try {
                await deleteBatch(batch.id)
                toast.success('Batch dihapus')
                navigate('/app/production')
              } catch {
                toast.error('Gagal menghapus batch')
              }
            }}
          >
            <Icon name="trash" size={14} /> Hapus
          </Button>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary">{batch.production_date}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{batch.batch_number}</h1>
        <p className="mt-1 text-sm text-secondary">{batch.recipe?.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Direncanakan" value={String(batch.planned_qty)} icon="calendar" tone="lavender" />
        <StatCard label="Aktual" value={String(batch.actual_qty)} icon="factory" tone="pink" />
        <StatCard label="Selisih" value={`${varianceOver ? '+' : ''}${(batch.actual_qty - batch.planned_qty).toFixed(0)}`} icon={varianceOver ? 'trending-up' : 'trending-down'} tone={varianceOver ? 'yellow' : 'mint'} />
        <StatCard label="Varian Biaya" value={`${varianceOver ? '+' : '−'}${formatCurrency(Math.abs(variance.variance))}`} icon="wallet" tone={varianceOver ? 'pink' : 'mint'} />
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow text-yellow-strong">
            <Icon name="wallet" size={18} />
          </span>
          <CardHeader title="Varian Biaya" subtitle="Selisih antara biaya rencana dan aktual" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted px-4 py-3">
            <span className="text-sm text-secondary">Biaya Rencana</span>
            <span className="text-sm font-semibold text-ink tnum">{formatCurrency(variance.plannedCost)}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted px-4 py-3">
            <span className="text-sm text-secondary">Biaya Aktual</span>
            <span className="text-sm font-semibold text-ink tnum">{formatCurrency(variance.actualCost)}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
            <span className="text-sm font-semibold text-ink">Selisih</span>
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold tnum',
              varianceOver ? 'bg-pink text-pink-strong' : 'bg-mint text-mint-strong',
            )}>
              <Icon name={varianceOver ? 'trending-up' : 'trending-down'} size={12} />
              {varianceOver ? '+' : '−'}{formatCurrency(Math.abs(variance.variance))} ({variancePctAbs.toFixed(1)}%)
            </span>
          </div>
        </div>
      </Card>

      {variance.ingredients.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender text-grape">
              <Icon name="box" size={18} />
            </span>
            <CardHeader title="Bahan Terpakai" subtitle="Penggunaan bahan aktual per item" />
          </div>
          <div className="mt-4 space-y-2">
            {variance.ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink text-pink-strong">
                  <Icon name="leaf" size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{ing.name}</p>
                  <p className="text-xs text-secondary tnum">
                    {ing.plannedQty.toFixed(2)} → {ing.actualQty.toFixed(2)} @ {formatCurrency(ing.costAtCreate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink tnum">{formatCurrency(ing.actualCost)}</p>
                  <p className={cn(
                    'text-[11px] font-semibold tnum',
                    ing.actualCost >= ing.plannedCost ? 'text-pink-strong' : 'text-mint-strong',
                  )}>
                    {ing.actualCost >= ing.plannedCost ? '+' : '−'}{formatCurrency(Math.abs(ing.actualCost - ing.plannedCost))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {batch.notes && (
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue text-blue-strong">
              <Icon name="info" size={18} />
            </span>
            <CardHeader title="Catatan" />
          </div>
          <p className="mt-3 text-sm text-ink">{batch.notes}</p>
        </Card>
      )}

      {!canDelete && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-yellow bg-yellow/20 p-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow text-yellow-strong">
            <Icon name="clock" size={12} />
          </span>
          <p className="text-sm text-ink">Batch ini sudah lebih dari 24 jam dan tidak bisa dihapus.</p>
        </div>
      )}
    </div>
  )
}
