import { Link } from 'react-router-dom'
import { useProductionBatches } from '@/hooks/useProductionBatches'

export default function ProductionPage() {
  const { data: batches, isLoading } = useProductionBatches()

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : !batches || batches.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-secondary">Belum ada produksi tercatat</p>
          <Link to="/app/production/new" className="mt-4 inline-block text-sm font-medium text-primary underline">
            Catat produksi pertama
          </Link>
        </div>
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

      <Link
        to="/app/production/new"
        className="fixed bottom-20 left-4 right-4 z-10 h-12 rounded-lg bg-primary text-sm font-medium text-white flex items-center justify-center"
      >
        Catat Produksi
      </Link>
    </div>
  )
}
