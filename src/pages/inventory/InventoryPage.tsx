import { useIngredients } from '@/hooks/useIngredients'
import { Link } from 'react-router-dom'
import { exportCSV, downloadCSV } from '@/lib/export'
import { useAuth } from '@/hooks/useAuth'

const CURATED_UNITS = ['g', 'kg', 'ml', 'L', 'pcs', 'sdt', 'sdm', 'cup']

export default function InventoryPage() {
  const { data: ingredients, isLoading, error } = useIngredients()
  const { organization } = useAuth()

  const handleExport = () => {
    if (!ingredients) return
    const headers = ['Nama Bahan', 'Kategori', 'Satuan', 'Stok Saat Ini', 'Stok Minimal', 'Harga Satuan', 'Total Nilai']
    const rows = ingredients.map((i: any) => [
      i.name,
      i.category?.name ?? '',
      i.unit + (!CURATED_UNITS.includes(i.unit) ? ' (kustom)' : ''),
      String(i.current_stock),
      String(i.min_stock_level),
      String(i.latest_price),
      String(i.current_stock * i.latest_price),
    ])
    const csv = exportCSV(headers, rows)
    downloadCSV(csv, `${organization?.slug ?? 'inventory'}-stok-${new Date().toISOString().split('T')[0]}.csv`)
  }

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
      <div className="flex gap-2">
        <Link
          to="/app/inventory/stock-in"
          className="flex h-12 flex-1 items-center justify-center rounded-lg bg-primary text-sm font-medium text-white"
        >
          Stok Masuk
        </Link>
        <Link
          to="/app/inventory/new"
          className="flex h-12 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-primary"
        >
          + Bahan
        </Link>
        <button
          onClick={handleExport}
          className="flex h-12 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-primary"
        >
          CSV
        </button>
      </div>

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
                      {!CURATED_UNITS.includes(ingredient.unit) && <span className="text-secondary"> (kustom)</span>}
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
