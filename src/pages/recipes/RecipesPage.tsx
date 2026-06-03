import { Link } from 'react-router-dom'
import { useRecipes, useDeleteRecipe } from '@/hooks/useRecipes'
import { calculateRecipeCost, formatCurrency } from '@/lib/calculations'
import { toast } from 'sonner'
import { EmptyState, PageHeader } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

export default function RecipesPage() {
  const { data: recipes, isLoading } = useRecipes()
  const { mutateAsync: deleteRecipe } = useDeleteRecipe()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operasional"
        title="Resep"
        subtitle="Kelola resep dan hitung HPP otomatis."
        action={
          <Link to="/app/recipes/new">
            <Button><Icon name="plus" size={14} /> Resep Baru</Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-muted border border-border" />
          ))}
        </div>
      ) : !recipes || recipes.length === 0 ? (
        <EmptyState
          title="Belum ada resep"
          description="Resep adalah inti Batchly — dari sini HPP, margin, dan harga jual dihitung otomatis."
          ctaLabel="Buat Resep Pertama"
          ctaTo="/app/recipes/new"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe) => {
            const cost = calculateRecipeCost(recipe, [])
            const healthy = cost.margin >= 30
            const ok = cost.margin >= 10
            return (
              <Link
                key={recipe.id}
                to={`/app/recipes/${recipe.id}`}
                className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-all hover:border-ink/20 hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender text-grape">
                      <Icon name="chef" size={18} />
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{recipe.name}</p>
                      <p className="text-xs text-secondary tnum">Hasil: {recipe.yield_amount} {recipe.yield_unit}</p>
                    </div>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (!window.confirm(`Hapus resep "${recipe.name}"? Bahan resep juga akan terhapus.`)) return
                      try {
                        await deleteRecipe(recipe.id)
                        toast.success('Resep dihapus')
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : 'Gagal menghapus resep')
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
                    <p className="text-[11px] font-medium uppercase tracking-wider text-secondary">HPP / unit</p>
                    <p className="mt-0.5 text-xl font-semibold tnum text-ink">
                      {formatCurrency(cost.perUnitHpp)}
                    </p>
                  </div>
                  {recipe.selling_price > 0 && (
                    <div className="text-right">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-secondary">Jual</p>
                      <p className="mt-0.5 text-sm font-semibold tnum text-ink">
                        {formatCurrency(recipe.selling_price)}
                      </p>
                    </div>
                  )}
                </div>

                {recipe.selling_price > 0 && (
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
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
