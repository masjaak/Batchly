import { useIngredients } from '@/hooks/useIngredients'
import { Link } from 'react-router-dom'

export default function InventoryPage() {
  const { data: ingredients, isLoading, error } = useIngredients()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <p className="text-sm text-danger">Gagal memuat data bahan</p>
      </div>
    )
  }

  if (!ingredients || ingredients.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-secondary">Belum ada bahan baku</p>
        <Link
          to="/app/inventory/stock-in"
          className="mt-4 inline-flex h-12 items-center rounded-lg bg-primary px-6 text-sm font-medium text-white"
        >
          Tambah Stok Masuk
        </Link>
      </div>
    )
  }

  const grouped = groupBy(ingredients, 'category?.name' as any)

  return (
    <div className="space-y-6">
      <Link
        to="/app/inventory/stock-in"
        className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-white"
      >
        Stok Masuk
      </Link>

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category}>
          <h2 className="mb-2 text-xs font-medium uppercase text-secondary">{category || 'Lainnya'}</h2>
          <div className="space-y-1">
            {(items as any[]).map((ingredient) => (
              <Link
                key={ingredient.id}
                to={`/app/inventory/${ingredient.id}`}
                className="block rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">{ingredient.name}</p>
                    <p className="mt-0.5 text-xs text-secondary">
                      Rp {ingredient.latest_price.toLocaleString('id-ID')}/{ingredient.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      ingredient.current_stock <= ingredient.min_stock_level
                        ? 'text-warning'
                        : 'text-primary'
                    }`}>
                      {ingredient.current_stock} {ingredient.unit}
                    </p>
                    {ingredient.current_stock <= ingredient.min_stock_level && (
                      <p className="text-xs text-warning">Stok menipis</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function groupBy<T>(arr: T[], key: keyof T | string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String((item as any)[(key as string).replace('?.', '')] ?? 'Lainnya')
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {} as Record<string, T[]>)
}
