import { Link } from 'react-router-dom'
import { useRecipes } from '@/hooks/useRecipes'
import { calculateRecipeCost } from '@/lib/calculations'
import { EmptyState, PageHeader } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export default function RecipesPage() {
  const { data: recipes, isLoading } = useRecipes()

  return (
    <div className="space-y-4">
      <PageHeader
        title="Resep"
        subtitle="Kelola resep dan hitung HPP otomatis."
        action={
          <Link to="/app/recipes/new">
            <Button>+ Resep Baru</Button>
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
        <div className="space-y-2">
          {recipes.map((recipe) => {
            const cost = calculateRecipeCost(recipe, [])
            return (
              <Link
                key={recipe.id}
                to={`/app/recipes/${recipe.id}`}
                className="block rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">{recipe.name}</p>
                    <p className="mt-0.5 text-xs text-secondary">
                      Hasil: {recipe.yield_amount} {recipe.yield_unit}
                    </p>
                  </div>
                  <div className="text-right">
                    {recipe.selling_price > 0 && (
                      <>
                        <p className="text-sm font-semibold text-primary">
                          Rp {recipe.selling_price.toLocaleString('id-ID')}
                        </p>
                        <p className={`text-xs ${
                          cost.margin >= 30 ? 'text-success' : cost.margin >= 10 ? 'text-warning' : 'text-danger'
                        }`}>
                          {cost.margin.toFixed(0)}%
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
