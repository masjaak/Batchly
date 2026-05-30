import { Link } from 'react-router-dom'
import { Plus, ArrowUpRight, Wallet, Receipt, TrendingUp, PiggyBank, Boxes } from 'lucide-react'
import { useRecipes } from '@/hooks/useRecipes'
import { useIngredients } from '@/hooks/useIngredients'
import { useSales } from '@/hooks/useSales'
import { useExpenses } from '@/hooks/useExpenses'
import { useReorderSuggestions } from '@/hooks/useReorderSuggestions'
import { calculateRecipeCost, calculateWeeklyComparison, formatCurrency } from '@/lib/calculations'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard, Badge } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function hppPerUnit(s: any): number {
  return s.product?.recipe
    ? calculateRecipeCost(s.product.recipe, s.product.recipe.recipe_items ?? []).perUnitHpp
    : 0
}

function monthKey(d: Date) {
  return d.getFullYear() * 12 + d.getMonth()
}

export default function DashboardPage() {
  const { data: sales } = useSales()
  const { data: ingredients } = useIngredients()
  const { data: recipes } = useRecipes()
  const { data: expenses } = useExpenses()
  const { data: reorder } = useReorderSuggestions()

  const salesList: any[] = sales ?? []
  const expenseList = expenses ?? []
  const lowStock = ingredients?.filter((i) => i.current_stock <= i.min_stock_level) ?? []

  const totalRevenue = salesList.reduce((sum, s) => sum + s.quantity * s.unit_price, 0)
  const totalHpp = salesList.reduce((sum, s) => sum + hppPerUnit(s) * s.quantity, 0)
  const totalExpenses = expenseList.reduce((sum, e) => sum + Number(e.amount), 0)
  const grossProfit = totalRevenue - totalHpp
  const netProfit = grossProfit - totalExpenses
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
  const weekly = calculateWeeklyComparison(salesList)

  // This-month vs last-month deltas
  const thisM = monthKey(new Date())
  const sumBy = (arr: any[], key: number, val: (x: any) => number, dateField: string) =>
    arr.filter((x) => monthKey(new Date(x[dateField])) === key).reduce((s, x) => s + val(x), 0)
  const revThis = sumBy(salesList, thisM, (s) => s.quantity * s.unit_price, 'sale_date')
  const revLast = sumBy(salesList, thisM - 1, (s) => s.quantity * s.unit_price, 'sale_date')
  const expThis = sumBy(expenseList, thisM, (e) => Number(e.amount), 'expense_date')
  const expLast = sumBy(expenseList, thisM - 1, (e) => Number(e.amount), 'expense_date')
  const pct = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : cur > 0 ? 100 : 0)

  // Monthly profit/loss chart (profit = revenue-hpp per month; loss bar = expenses)
  const monthly = MONTHS.map((m) => ({ m, profit: 0, expense: 0 }))
  salesList.forEach((s) => {
    const idx = new Date(s.sale_date).getMonth()
    if (monthly[idx]) monthly[idx].profit += s.quantity * s.unit_price - hppPerUnit(s) * s.quantity
  })
  expenseList.forEach((e) => {
    const idx = new Date(e.expense_date).getMonth()
    if (monthly[idx]) monthly[idx].expense += Number(e.amount)
  })
  const maxBar = Math.max(1, ...monthly.map((d) => Math.max(d.profit, d.expense)))

  const recent = [
    ...salesList.map((s) => ({
      kind: 'Penjualan',
      name: s.product?.name ?? '-',
      date: s.sale_date,
      amount: s.quantity * s.unit_price,
      positive: true,
    })),
    ...expenseList.map((e) => ({
      kind: 'Biaya',
      name: e.category + (e.description ? ` · ${e.description}` : ''),
      date: e.expense_date,
      amount: -Number(e.amount),
      positive: false,
    })),
  ]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 7)

  return (
    <div className="space-y-5">
      {/* Row 1: hero balance + stat grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Hero */}
        <div className="rounded-2xl bg-lime p-6 text-forest shadow-card">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium">Laba Bersih (Net Profit)</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest/15">
              <PiggyBank className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold">{formatCurrency(netProfit)}</p>
          <p className="mt-1 text-xs text-forest/70">
            Pendapatan − HPP − Biaya · margin {margin.toFixed(1)}%
          </p>
          <div className="mt-5 flex gap-2">
            <Link to="/app/sales" className="flex-1">
              <Button variant="primary" className="w-full">Catat Jual <ArrowUpRight className="h-4 w-4" /></Button>
            </Link>
            <Link to="/app/expenses" className="flex-1">
              <Button variant="outline" className="w-full border-forest/20 bg-white/40 text-forest">
                <Plus className="h-4 w-4" /> Biaya
              </Button>
            </Link>
          </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <StatCard
            label="Pendapatan"
            value={formatCurrency(totalRevenue)}
            delta={pct(revThis, revLast)}
            deltaLabel="bln ini"
            tone="dark"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatCard
            label="Laba Kotor"
            value={formatCurrency(grossProfit)}
            tone="lime"
            icon={<Boxes className="h-4 w-4" />}
          />
          <StatCard
            label="Biaya Operasional"
            value={formatCurrency(totalExpenses)}
            delta={pct(expThis, expLast)}
            deltaLabel="bln ini"
            icon={<Wallet className="h-4 w-4 text-secondary" />}
          />
          <StatCard
            label="Total HPP"
            value={formatCurrency(totalHpp)}
            icon={<Receipt className="h-4 w-4 text-secondary" />}
          />
        </div>
      </div>

      {/* Row 2: chart + stock */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardHeader
            title="Laba & Biaya"
            subtitle="Perbandingan laba kotor dan biaya operasional per bulan"
            action={
              <div className="flex items-center gap-3 text-xs text-secondary">
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-lime" />Laba</span>
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-forest" />Biaya</span>
              </div>
            }
          />
          <div className="mt-6 flex h-48 items-end justify-between gap-2">
            {monthly.map((d) => (
              <div key={d.m} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-40 w-full items-end justify-center gap-1">
                  <div className="w-1/2 rounded-t bg-lime" style={{ height: `${(Math.max(0, d.profit) / maxBar) * 100}%` }} />
                  <div className="w-1/2 rounded-t bg-forest" style={{ height: `${(d.expense / maxBar) * 100}%` }} />
                </div>
                <span className="text-[10px] text-secondary">{d.m}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Stok & Saran Pesan" action={<Link to="/app/inventory" className="text-xs font-medium text-accent">Semua</Link>} />
          {lowStock.length === 0 && (!reorder || reorder.length === 0) ? (
            <p className="mt-8 text-center text-sm text-secondary">Semua stok aman 🎉</p>
          ) : (
            <div className="mt-4 space-y-2">
              {lowStock.slice(0, 3).map((ing) => (
                <Link key={ing.id} to={`/app/inventory/${ing.id}`} className="flex items-center justify-between rounded-xl bg-orange-50 px-3 py-2.5">
                  <span className="text-sm text-warning">{ing.name}</span>
                  <Badge status="warning">{ing.current_stock} {ing.unit}</Badge>
                </Link>
              ))}
              {reorder?.slice(0, 3).map((s) => (
                <Link
                  key={s.ingredientId}
                  to={`/app/inventory/stock-in?ingredient=${s.ingredientId}&supplier=${s.lastSupplierId ?? ''}`}
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-primary">{s.name}</p>
                    <p className="text-xs text-secondary">min {s.minStockLevel} {s.unit}</p>
                  </div>
                  <span className="text-xs font-medium text-accent">+ Pesan</span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Row 3: recent activities */}
      <Card className="p-5">
        <CardHeader
          title="Aktivitas Terbaru"
          action={
            <Badge status={weekly.changePct >= 0 ? 'success' : 'danger'}>
              {weekly.changePct >= 0 ? '↑' : '↓'} {Math.abs(weekly.changePct).toFixed(1)}% vs minggu lalu
            </Badge>
          }
        />
        {recent.length === 0 ? (
          <p className="mt-6 text-sm text-secondary">Belum ada aktivitas. Mulai dengan mencatat penjualan atau biaya.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-secondary">
                  <th className="pb-2 font-medium">Jenis</th>
                  <th className="pb-2 font-medium">Keterangan</th>
                  <th className="pb-2 font-medium">Tanggal</th>
                  <th className="pb-2 text-right font-medium">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2.5">
                      <Badge status={a.positive ? 'success' : 'neutral'}>{a.kind}</Badge>
                    </td>
                    <td className="py-2.5 text-primary">{a.name}</td>
                    <td className="py-2.5 text-secondary">{String(a.date).slice(0, 10)}</td>
                    <td className={`py-2.5 text-right font-semibold ${a.positive ? 'text-success' : 'text-danger'}`}>
                      {a.positive ? '+' : '−'}{formatCurrency(Math.abs(a.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
