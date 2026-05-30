import { Link } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { calculateRecipeCost } from '@/lib/calculations'

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts()

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-secondary">Belum ada produk</p>
          <Link to="/app/recipes" className="mt-4 inline-block text-sm font-medium text-primary underline">
            Buat resep terlebih dahulu
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product: any) => {
            const cost = product.recipe
              ? calculateRecipeCost(product.recipe, product.recipe.recipe_items ?? [])
              : { perUnitHpp: 0, totalHpp: 0, margin: 0 }
            return (
              <Link key={product.id} to={`/app/products/${product.id}`}>
                <div className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary">{product.name}</p>
                      <p className="text-xs text-secondary">SKU: {product.sku ?? '-'} · {product.recipe?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">
                        Rp {product.default_price.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-secondary">
                        HPP: Rp {cost.perUnitHpp.toLocaleString('id-ID')}
                      </p>
                      <p className={`text-xs font-medium ${
                        cost.margin >= 30 ? 'text-success' : cost.margin >= 10 ? 'text-warning' : 'text-danger'
                      }`}>
                        {cost.margin.toFixed(0)}%
                      </p>
                    </div>
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
