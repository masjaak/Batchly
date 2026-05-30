import { Link } from 'react-router-dom'
import { Plus, ArrowUpRight, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { useRecipes } from '@/hooks/useRecipes'
import { useIngredients } from '@/hooks/useIngredients'
import { useSales } from '@/hooks/useSales'
import { useReorderSuggestions } from '@/hooks/useReorderSuggestions'
import { calculateRecipeCost, calculateWeeklyComparison, formatCurrency } from '@/lib/calculations'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const DONUT = ['#14301f', '#3f7d4e', '#6db36f', '#9be066', '#c7eea1', '#e3f5cf']

function hpp(s: any): number {
  return s.product?.recipe
    ? calculateRecipeCost(s.product.recipe, s.product.recipe.recipe_items ?? []).perUnitHpp
    : 0
}

export default function DashboardPage() {
  const { data: recipes } = useRecipes()
  const { data: ingredients } = useIngredients()
  const { data: sales } = useSales()
  const { data: reorder } = useReorderSuggestions()

  const salesList: any[] = sales ?? []
  const lowStock = ingredients?.filter((i) => i.current_stock <= i.min_stock_level) ?? []

  const totalRevenue = salesList.reduce((sum, s) => sum + s.quantity * s.unit_price, 0)
  const totalHpp = salesList.reduce((sum, s) => sum + hpp(s) * s.quantity, 0)
  const grossProfit = totalRevenue - totalHpp
  const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
  const weekly = calculateWeeklyComparison(salesList)

  // Monthly revenue vs HPP
  const monthly = MONTHS.map((m) => ({ m, rev: 0, hpp: 0 }))
  salesList.forEach((s) => {
    const idx = new Date(s.sale_date).getMonth()
    if (monthly[idx]) {
      monthly[idx].rev += s.quantity * s.unit_price
      monthly[idx].hpp += hpp(s) * s.quantity
    }
  })
  const maxMonthly = Math.max(1, ...monthly.map((d) => Math.max(d.rev, d.hpp)))

  // Revenue per product (donut)
  const byProduct = new Map<string, number>()
  salesList.forEach((s) => {
    const name = s.product?.name ?? 'Lainnya'
    byProduct.set(name, (byProduct.get(name) ?? 0) + s.quantity * s.unit_price)
  })
  const products = [...byProduct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  const productTotal = products.reduce((sum, [, v]) => sum + v, 0) || 1

  const recentSales = [...salesList]
    .sort((a, b) => String(b.sale_date).localeCompare(String(a.sale_date)))
    .slice(0, 6)

  return (
    <div className="space-y-5">
      {/* Top row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#9be066] to-[#6db36f] p-5 text-[#14301f]">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium">Total Pendapatan</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/40">
              <Plus className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
          <p className="mt-1 text-xs text-[#14301f]/70">Laba kotor {formatCurrency(grossProfit)}</p>
          <div className="mt-4 flex gap-2">
            <Link to="/app/sales" className="flex-1 rounded-lg bg-white/70 py-2 text-center text-sm font-medium">
              Catat Jual
            </Link>
            <Link to="/app/inventory/stock-in" className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#14301f] py-2 text-center text-sm font-medium text-white">
              Stok Masuk <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border bg-surface p-4 lg:col-span-1">
          <Kpi label="Pendapatan" value={formatCurrency(totalRevenue)} />
          <Kpi label="HPP" value={formatCurrency(totalHpp)} />
          <Kpi label="Laba Kotor" value={formatCurrency(grossProfit)} accent={grossProfit >= 0} />
        </div>

        {/* Margin score */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm font-semibold text-primary">Skor Margin</p>
          <p className="mt-3 text-xs text-secondary">Kualitas margin</p>
          <div className="mt-1 flex items-end justify-between">
            <p className="text-2xl font-bold text-primary">
              {margin >= 30 ? 'Sangat Baik' : margin >= 15 ? 'Cukup' : 'Tipis'}
            </p>
            <p className="text-2xl font-bold text-primary">{margin.toFixed(0)}%</p>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-[#9be066]"
              style={{ width: `${Math.max(0, Math.min(100, margin))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Cashflow chart */}
        <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Pendapatan vs HPP</p>
              <p className="mt-1 text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-secondary">
              <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-[#14301f]" />Pendapatan</span>
              <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-[#9be066]" />HPP</span>
            </div>
          </div>
          <div className="mt-5 flex h-48 items-end justify-between gap-2">
            {monthly.map((d) => (
              <div key={d.m} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-40 w-full items-end justify-center gap-0.5">
                  <div className="w-1/2 rounded-t bg-[#14301f]" style={{ height: `${(d.rev / maxMonthly) * 100}%` }} />
                  <div className="w-1/2 rounded-t bg-[#9be066]" style={{ height: `${(d.hpp / maxMonthly) * 100}%` }} />
                </div>
                <span className="text-[10px] text-secondary">{d.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stock alerts / reorder */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-primary">Stok & Saran Pesan</p>
            <Link to="/app/inventory" className="text-xs font-medium text-secondary underline">Semua</Link>
          </div>
          {lowStock.length === 0 && (!reorder || reorder.length === 0) ? (
            <p className="mt-6 text-center text-sm text-secondary">Semua stok aman 🎉</p>
          ) : (
            <div className="mt-4 space-y-2">
              {lowStock.slice(0, 3).map((ing) => (
                <Link key={ing.id} to={`/app/inventory/${ing.id}`} className="flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2">
                  <span className="flex items-center gap-2 text-sm text-warning">
                    <AlertTriangle className="h-4 w-4" /> {ing.name}
                  </span>
                  <span className="text-xs font-medium text-warning">{ing.current_stock} {ing.unit}</span>
                </Link>
              ))}
              {reorder?.slice(0, 3).map((s) => (
                <Link
                  key={s.ingredientId}
                  to={`/app/inventory/stock-in?ingredient=${s.ingredientId}&supplier=${s.lastSupplierId ?? ''}`}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-primary">{s.name}</p>
                    <p className="text-xs text-secondary">min {s.minStockLevel} {s.unit}</p>
                  </div>
                  <span className="text-xs font-medium text-primary underline">+ Pesan</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Recent sales */}
        <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-primary">Penjualan Terbaru</p>
            <span className={`flex items-center gap-1 text-xs font-medium ${weekly.changePct >= 0 ? 'text-success' : 'text-danger'}`}>
              {weekly.changePct >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {Math.abs(weekly.changePct).toFixed(1)}% vs minggu lalu
            </span>
          </div>
          {recentSales.length === 0 ? (
            <p className="mt-6 text-sm text-secondary">Belum ada penjualan. Mulai catat penjualan pertama Anda.</p>
          ) : (
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-secondary">
                  <th className="pb-2 font-medium">Produk</th>
                  <th className="pb-2 font-medium">Tanggal</th>
                  <th className="pb-2 text-right font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2 text-primary">{s.product?.name ?? '-'}</td>
                    <td className="py-2 text-secondary">{String(s.sale_date).slice(0, 10)}</td>
                    <td className="py-2 text-right text-secondary">{s.quantity}</td>
                    <td className="py-2 text-right font-medium text-primary">{formatCurrency(s.quantity * s.unit_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Revenue per product donut */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm font-semibold text-primary">Penjualan per Produk</p>
          {products.length === 0 ? (
            <p className="mt-6 text-center text-sm text-secondary">Belum ada data</p>
          ) : (
            <>
              <div className="mt-4 flex justify-center">
                <Donut data={products.map(([, v]) => v)} total={productTotal} />
              </div>
              <div className="mt-4 space-y-1">
                {products.map(([name, v], i) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-secondary">
                      <i className="h-2.5 w-2.5 rounded-full" style={{ background: DONUT[i % DONUT.length] }} />
                      {name}
                    </span>
                    <span className="font-medium text-primary">{Math.round((v / productTotal) * 100)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs text-secondary">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${accent === false ? 'text-danger' : 'text-primary'}`}>{value}</p>
    </div>
  )
}

function Donut({ data, total }: { data: number[]; total: number }) {
  const r = 42
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <svg viewBox="0 0 110 110" className="h-36 w-36 -rotate-90">
      <circle cx="55" cy="55" r={r} fill="none" stroke="#F1F1EF" strokeWidth="14" />
      {data.map((v, i) => {
        const frac = v / total
        const dash = frac * c
        const seg = (
          <circle
            key={i}
            cx="55"
            cy="55"
            r={r}
            fill="none"
            stroke={DONUT[i % DONUT.length]}
            strokeWidth="14"
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={-offset}
          />
        )
        offset += dash
        return seg
      })}
    </svg>
  )
}
