import { Link } from 'react-router-dom'
import { useProducts, useDeleteProduct } from '@/hooks/useProducts'
import { calculateRecipeCost, formatCurrency } from '@/lib/calculations'
import { toast } from 'sonner'
import { EmptyState, PageHeader } from '@/components/ui/EmptyState'
import { StatCard } from '@/components/ui/StatCard'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts()
  const { mutateAsync: deleteProduct } = useDeleteProduct()

  const withCost = (products ?? []).map((p: any) => ({
    p,
    cost: p.recipe ? calculateRecipeCost(p.recipe, p.recipe.recipe_items ?? []) : { perUnitHpp: 0, margin: 0 },
  }))
  const avgMargin = withCost.length ? withCost.reduce((s, x) => s + x.cost.margin, 0) / withCost.length : 0
  const atRisk = withCost.filter((x) => x.cost.margin < 30).length

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operasional"
        title="Produk"
        subtitle="Daftar produk jadi beserta HPP dan margin terkini."
      />

      {products && products.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Produk" value={String(products.length)} icon="tag" tone="lavender" />
          <StatCard label="Rata-rata Margin" value={`${avgMargin.toFixed(0)}%`} icon="trending-up" tone="mint" />
          <StatCard label="Margin Tipis" value={String(atRisk)} icon="alert" tone={atRisk > 0 ? 'yellow' : 'mint'} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-muted border border-border" />
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <EmptyState
          title="Belum ada produk"
          description="Produk dibuat dari resep. Buat resep dulu, lalu jadikan produk untuk mulai mencatat penjualan."
          ctaLabel="Buat Resep"
          ctaTo="/app/recipes"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product: any) => {
            const cost = product.recipe
              ? calculateRecipeCost(product.recipe, product.recipe.recipe_items ?? [])
              : { perUnitHpp: 0, totalHpp: 0, margin: 0 }
            const healthy = cost.margin >= 30
            const ok = cost.margin >= 10
            return (
              <Link
                key={product.id}
                to={`/app/products/${product.id}`}
                className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-all hover:border-ink/20 hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink text-pink-strong">
                      <Icon name="tag" size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{product.name}</p>
                      <p className="text-xs text-secondary tnum">SKU: {product.sku ?? '—'}</p>
                    </div>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (!window.confirm(`Hapus produk "${product.name}"?`)) return
                      try {
                        await deleteProduct(product.id)
                        toast.success('Produk dihapus')
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : 'Gagal menghapus produk')
                      }
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-secondary opacity-0 transition-all hover:bg-pink hover:text-pink-strong group-hover:opacity-100"
                    aria-label="Hapus"
                  >
                    <Icon name="trash" size={12} />
                  </button>
                </div>

                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-secondary">Harga Jual</p>
                    <p className="mt-0.5 text-lg font-semibold tnum text-ink">
                      {formatCurrency(product.default_price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-secondary">HPP</p>
                    <p className="mt-0.5 text-sm font-semibold tnum text-secondary">
                      {formatCurrency(cost.perUnitHpp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-secondary">Margin</span>
                  <span className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tnum',
                    healthy ? 'bg-mint text-mint-strong' : ok ? 'bg-yellow text-yellow-strong' : 'bg-pink text-pink-strong',
                  )}>
                    <Icon name={healthy ? 'trending-up' : 'trending-down'} size={11} />
                    {cost.margin.toFixed(0)}%
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
