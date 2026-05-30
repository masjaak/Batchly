import { Link } from 'react-router-dom'
import { useRecipes } from '@/hooks/useRecipes'
import { calculateRecipeCost } from '@/lib/calculations'

export default function RecipesPage() {
  const { data: recipes, isLoading } = useRecipes()

  return (
    <div className="space-y-4">
      <Link
        to="/app/recipes/new"
        className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-white"
      >
        Buat Resep Baru
      </Link>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-muted border border-border" />
          ))}
        </div>
      ) : !recipes || recipes.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-secondary">Belum ada resep</p>
          <Link
            to="/app/recipes/new"
            className="mt-4 inline-block text-sm font-medium text-primary underline"
          >
            Buat resep pertama
          </Link>
        </div>
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
