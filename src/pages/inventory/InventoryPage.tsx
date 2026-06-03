import { useIngredients, useDeleteIngredient } from '@/hooks/useIngredients'
import { Link } from 'react-router-dom'
import { exportCSV, downloadCSV } from '@/lib/export'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { EmptyState, PageHeader } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Icon, type IconName } from '@/components/ui/Icon'
import { formatCurrency } from '@/lib/calculations'

const CURATED_UNITS = ['g', 'kg', 'ml', 'L', 'pcs', 'sdt', 'sdm', 'cup']

const ICON_BY_NAME = (n: string): IconName => {
  const k = n.toLowerCase()
  if (k.includes('tepung')) return 'leaf'
  if (k.includes('gula')) return 'sparkles'
  if (k.includes('minyak') || k.includes('oil')) return 'package'
  if (k.includes('susu') || k.includes('dairy')) return 'flame'
  if (k.includes('telur') || k.includes('egg')) return 'star'
  return 'box'
}

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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operasional"
        title="Stok Bahan"
        subtitle="Kelola bahan baku dan pantau stok menipis."
        action={
          <div className="flex gap-2">
            <Link to="/app/inventory/new"><Button variant="secondary"><Icon name="plus" size={14} /> Bahan</Button></Link>
            <button onClick={handleExport} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-ink transition-colors hover:bg-surface-muted">
              <Icon name="arrow-down" size={14} /> CSV
            </button>
            <Link to="/app/inventory/stock-in"><Button><Icon name="arrow-down" size={14} /> Stok Masuk</Button></Link>
          </div>
        }
      />

      {(() => {
        const low = ingredients.filter((i) => i.current_stock <= i.min_stock_level).length
        const totalValue = ingredients.reduce((s, i) => s + i.current_stock * i.latest_price, 0)
        return (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="Total Bahan" value={String(ingredients.length)} icon="box" tone="lavender" />
            <StatCard label="Stok Menipis" value={String(low)} icon="alert" tone={low > 0 ? 'yellow' : 'mint'} />
            <StatCard label="Nilai Stok" value={formatCurrency(totalValue)} icon="wallet" tone="pink" />
          </div>
        )
      })()}

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category}>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-secondary">{category || 'Lainnya'}</h2>
            <span className="text-[11px] text-secondary tnum">{(items as any[]).length} item</span>
          </div>
          <div className="space-y-2">
            {(items as any[]).map((ingredient) => {
              const low = ingredient.current_stock <= ingredient.min_stock_level
              return (
                <Link
                  key={ingredient.id}
                  to={`/app/inventory/${ingredient.id}`}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-muted"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${low ? 'bg-yellow text-yellow-strong' : 'bg-lavender text-grape'}`}>
                    <Icon name={ICON_BY_NAME(ingredient.name)} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{ingredient.name}</p>
                    <p className="mt-0.5 truncate text-xs text-secondary tnum">
                      {formatCurrency(ingredient.latest_price)}/{ingredient.unit}
                      {!CURATED_UNITS.includes(ingredient.unit) && <span className="text-tertiary"> (kustom)</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold tnum ${low ? 'text-warning' : 'text-ink'}`}>
                      {ingredient.current_stock} <span className="text-xs font-normal text-secondary">{ingredient.unit}</span>
                    </p>
                    {low && <p className="text-[11px] font-medium text-warning">Stok menipis</p>}
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
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-secondary opacity-0 transition-all hover:bg-pink hover:text-pink-strong group-hover:opacity-100"
                    aria-label="Hapus"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </Link>
              )
            })}
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
