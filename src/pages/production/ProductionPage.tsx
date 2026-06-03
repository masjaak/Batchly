import { Link } from 'react-router-dom'
import { useProductionBatches, useDeleteProductionBatch } from '@/hooks/useProductionBatches'
import { toast } from 'sonner'
import { EmptyState, PageHeader } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

export default function ProductionPage() {
  const { data: batches, isLoading } = useProductionBatches()
  const { mutateAsync: deleteBatch } = useDeleteProductionBatch()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operasional"
        title="Produksi"
        subtitle="Catat batch produksi dan pantau selisih biaya."
        action={
          <Link to="/app/production/new">
            <Button><Icon name="plus" size={14} /> Catat Produksi</Button>
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
          {batches.map((batch: any) => {
            const ageHours = (Date.now() - new Date(batch.created_at).getTime()) / (1000 * 60 * 60)
            const canDelete = ageHours <= 24
            const variance = batch.actual_qty - batch.planned_qty
            return (
              <Link
                key={batch.id}
                to={`/app/production/${batch.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-muted"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lavender text-grape">
                  <Icon name="factory" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{batch.batch_number}</p>
                  <p className="mt-0.5 text-xs text-secondary">
                    {batch.recipe?.name} · {batch.production_date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink tnum">{batch.actual_qty} / {batch.planned_qty}</p>
                  <p className={`text-[11px] tnum ${variance < 0 ? 'text-pink-strong' : variance > 0 ? 'text-mint-strong' : 'text-secondary'}`}>
                    {variance > 0 ? '+' : ''}{variance} unit
                  </p>
                </div>
                {canDelete && (
                  <button
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (!window.confirm(`Hapus batch ${batch.batch_number}? Stok bahan akan dikembalikan otomatis.`)) return
                      try {
                        await deleteBatch(batch.id)
                        toast.success('Batch dihapus')
                      } catch {
                        toast.error('Gagal menghapus batch')
                      }
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary opacity-0 transition-all hover:bg-pink hover:text-pink-strong group-hover:opacity-100"
                    aria-label="Hapus"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
