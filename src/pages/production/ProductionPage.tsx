import { Link } from 'react-router-dom'
import { useProductionBatches } from '@/hooks/useProductionBatches'
import { EmptyState, PageHeader } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export default function ProductionPage() {
  const { data: batches, isLoading } = useProductionBatches()

  return (
    <div className="space-y-4">
      <PageHeader
        title="Produksi"
        subtitle="Catat batch produksi dan pantau selisih biaya."
        action={
          <Link to="/app/production/new">
            <Button>+ Catat Produksi</Button>
          </Link>
        }
      />
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-muted border border-border" />
          ))}
        </div>
      ) : !batches || batches.length === 0 ? (
        <EmptyState
          title="Belum ada produksi"
          description="Catat batch produksi untuk memotong stok bahan otomatis dan melacak selisih biaya (variance)."
          ctaLabel="Catat Produksi"
          ctaTo="/app/production/new"
        />
      ) : (
        <div className="space-y-2">
          {batches.map((batch: any) => (
            <Link key={batch.id} to={`/app/production/${batch.id}`}>
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">{batch.batch_number}</p>
                    <p className="text-xs text-secondary">{batch.recipe?.name} · {batch.production_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-primary">{batch.actual_qty} / {batch.planned_qty}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
