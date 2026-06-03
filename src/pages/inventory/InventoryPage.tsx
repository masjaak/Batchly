import { useIngredients, useDeleteIngredient } from '@/hooks/useIngredients'
import { Link } from 'react-router-dom'
import { exportCSV, downloadCSV } from '@/lib/export'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { EmptyState, PageHeader } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { formatCurrency } from '@/lib/calculations'

const CURATED_UNITS = ['g', 'kg', 'ml', 'L', 'pcs', 'sdt', 'sdm', 'cup']

export default function InventoryPage() {
  const { data: ingredients, isLoading, error } = useIngredients()
  const { organization } = useAuth()
  const { mutateAsync: deleteIngredient } = useDeleteIngredient()

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
          <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-muted border border-border" />
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
      <EmptyState
        title="Belum ada bahan baku"
        description="Tambahkan bahan dan catat stok masuk. Harga bahan dipakai untuk menghitung HPP resep secara otomatis."
        ctaLabel="Tambah Stok Masuk"
        ctaTo="/app/inventory/stock-in"
      />
    )
  }

  const grouped = groupBy(ingredients, 'category?.name' as any)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Stok Bahan"
        subtitle="Kelola bahan baku dan pantau stok menipis."
        action={
          <div className="flex gap-2">
            <Link to="/app/inventory/new"><Button variant="secondary">+ Bahan</Button></Link>
            <button onClick={handleExport} className="h-10 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-muted">CSV</button>
            <Link to="/app/inventory/stock-in"><Button>Stok Masuk</Button></Link>
          </div>
        }
      />

      {(() => {
        const low = ingredients.filter((i) => i.current_stock <= i.min_stock_level).length
        const totalValue = ingredients.reduce((s, i) => s + i.current_stock * i.latest_price, 0)
        return (
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total Bahan" value={String(ingredients.length)} />
            <StatCard label="Stok Menipis" value={String(low)} tone={low > 0 ? 'dark' : 'plain'} />
            <StatCard label="Nilai Stok" value={formatCurrency(totalValue)} />
          </div>
        )
      })()}

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
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
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
                  <button
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (!window.confirm(`Hapus bahan "${ingredient.name}"? Riwayat transaksi tetap tersimpan.`)) return
                      try {
                        await deleteIngredient(ingredient.id)
                        toast.success('Bahan dihapus')
                      } catch {
                        toast.error('Gagal menghapus bahan')
                      }
                    }}
                    className="shrink-0 text-xs font-medium text-secondary hover:text-ink"
                    aria-label="Hapus"
                  >
                    Hapus
                  </button>
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
