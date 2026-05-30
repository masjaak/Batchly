import { useRecipes } from '@/hooks/useRecipes'
import { useIngredients } from '@/hooks/useIngredients'
import { useSales } from '@/hooks/useSales'
import { useReorderSuggestions } from '@/hooks/useReorderSuggestions'
import { calculateSaleProfit, calculateRecipeCost, calculateWeeklyComparison } from '@/lib/calculations'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { data: recipes } = useRecipes()
  const { data: ingredients } = useIngredients()
  const { data: sales } = useSales()
  const { data: reorderSuggestions } = useReorderSuggestions()

  const lowStock = ingredients?.filter((i) => i.current_stock <= i.min_stock_level) ?? []
  const totalRevenue = sales?.reduce((sum: number, s: any) => sum + s.quantity * s.unit_price, 0) ?? 0
  let totalHpp = 0
  sales?.forEach((s: any) => {
    const cost = s.product?.recipe
      ? calculateRecipeCost(s.product.recipe, s.product.recipe.recipe_items ?? [])
      : { perUnitHpp: 0 }
    totalHpp += cost.perUnitHpp * s.quantity
  })
  const grossProfit = totalRevenue - totalHpp
  const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  const recentActivity = [
    ...(sales?.slice(0, 5).map((s: any) => ({
      type: 'sale' as const,
      date: s.sale_date,
      label: `Penjualan: ${s.product?.name} (${s.quantity})`,
      value: `Rp ${(s.quantity * s.unit_price).toLocaleString('id-ID')}`,
    })) ?? []),
    ...(ingredients?.filter(i => i.current_stock > 0).slice(0, 5).map(i => ({
      type: 'stock' as const,
      date: '',
      label: `${i.name}: ${i.current_stock} ${i.unit}`,
      value: `Rp ${i.latest_price.toLocaleString('id-ID')}/${i.unit}`,
    })) ?? []),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-xs text-secondary">Resep</p>
          <p className="mt-1 text-2xl font-semibold">{recipes?.length ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-xs text-secondary">Bahan</p>
          <p className="mt-1 text-2xl font-semibold">
            {ingredients?.length ?? 0}
            {lowStock.length > 0 && <span className="ml-1 text-sm font-medium text-warning">⚠️{lowStock.length}</span>}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-xs text-secondary">Laba</p>
          <p className={`mt-1 text-2xl font-semibold ${grossProfit >= 0 ? 'text-success' : 'text-danger'}`}>
            Rp {grossProfit.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex justify-between text-sm">
          <span className="text-secondary">Pendapatan</span>
          <span className="font-medium">Rp {totalRevenue.toLocaleString('id-ID')}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-secondary">HPP</span>
          <span className="font-medium">Rp {totalHpp.toLocaleString('id-ID')}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm border-t border-border pt-1">
          <span className="font-medium">Margin</span>
          <span className={`font-semibold ${margin >= 30 ? 'text-success' : margin >= 10 ? 'text-warning' : 'text-danger'}`}>
            {margin.toFixed(1)}%
          </span>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-orange-50 p-4">
          <h2 className="mb-2 text-sm font-medium text-warning">Stok Menipis</h2>
          <div className="space-y-1">
            {lowStock.slice(0, 5).map((ing) => (
              <Link key={ing.id} to={`/app/inventory/${ing.id}`} className="flex justify-between text-sm">
                <span className="text-primary">{ing.name}</span>
                <span className="text-warning">{ing.current_stock} {ing.unit}</span>
              </Link>
            ))}
          </div>
          {lowStock.length > 5 && (
            <Link to="/app/inventory" className="mt-2 block text-xs text-primary underline">
              Lihat semua
            </Link>
          )}
        </div>
      )}

      {reorderSuggestions && reorderSuggestions.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 text-sm font-medium text-primary">Pesan Stok</h2>
          <div className="space-y-2">
            {reorderSuggestions.slice(0, 5).map((s) => (
              <Link
                key={s.ingredientId}
                to={`/app/inventory/stock-in?ingredient=${s.ingredientId}&supplier=${s.lastSupplierId ?? ''}`}
                className="block rounded-lg border border-border bg-surface p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">{s.name}</p>
                    <p className="text-xs text-secondary">
                      Stok: {s.currentStock} {s.unit} (min {s.minStockLevel})
                    </p>
                    {s.lastSupplierName && (
                      <p className="text-xs text-secondary">
                        {s.lastSupplierName} · Rp {s.lastPrice.toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-primary underline">+ Stok</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-medium text-primary">Aktivitas Terbaru</h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-secondary">Belum ada aktivitas. Mulai dengan mencatat stok masuk.</p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((a, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-primary">{a.label}</p>
                  <p className={`text-xs font-medium ${a.type === 'sale' ? 'text-success' : 'text-secondary'}`}>
                    {a.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
