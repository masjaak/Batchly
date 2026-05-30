import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftRight, Send, Wallet, Receipt, Coins, PiggyBank, ShoppingBag } from 'lucide-react'
import { useRecipes } from '@/hooks/useRecipes'
import { useIngredients } from '@/hooks/useIngredients'
import { useSales } from '@/hooks/useSales'
import { useExpenses } from '@/hooks/useExpenses'
import { useReorderSuggestions } from '@/hooks/useReorderSuggestions'
import { calculateRecipeCost, calculateWeeklyComparison, formatCurrency } from '@/lib/calculations'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function hppPerUnit(s: any): number {
  return s.product?.recipe ? calculateRecipeCost(s.product.recipe, s.product.recipe.recipe_items ?? []).perUnitHpp : 0
}
const monthKey = (d: Date) => d.getFullYear() * 12 + d.getMonth()

export default function DashboardPage() {
  const { data: sales } = useSales()
  const { data: ingredients } = useIngredients()
  useRecipes()
  const { data: expenses } = useExpenses()
  const { data: reorder } = useReorderSuggestions()
  const [period, setPeriod] = useState('year')

  const salesList: any[] = sales ?? []
  const expenseList = expenses ?? []
  const lowStock = ingredients?.filter((i) => i.current_stock <= i.min_stock_level) ?? []

  const totalRevenue = salesList.reduce((s, x) => s + x.quantity * x.unit_price, 0)
  const totalHpp = salesList.reduce((s, x) => s + hppPerUnit(x) * x.quantity, 0)
  const totalExpenses = expenseList.reduce((s, e) => s + Number(e.amount), 0)
  const grossProfit = totalRevenue - totalHpp
  const netProfit = grossProfit - totalExpenses
  const weekly = calculateWeeklyComparison(salesList)

  const thisM = monthKey(new Date())
  const sumBy = (arr: any[], k: number, val: (x: any) => number, df: string) =>
    arr.filter((x) => monthKey(new Date(x[df])) === k).reduce((s, x) => s + val(x), 0)
  const pct = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : cur > 0 ? 100 : 0)
  const revDelta = pct(sumBy(salesList, thisM, (s) => s.quantity * s.unit_price, 'sale_date'), sumBy(salesList, thisM - 1, (s) => s.quantity * s.unit_price, 'sale_date'))
  const expDelta = pct(sumBy(expenseList, thisM, (e) => Number(e.amount), 'expense_date'), sumBy(expenseList, thisM - 1, (e) => Number(e.amount), 'expense_date'))

  const monthly = MONTHS.map((m) => ({ m, profit: 0, loss: 0 }))
  salesList.forEach((s) => { const i = new Date(s.sale_date).getMonth(); if (monthly[i]) monthly[i].profit += s.quantity * s.unit_price - hppPerUnit(s) * s.quantity })
  expenseList.forEach((e) => { const i = new Date(e.expense_date).getMonth(); if (monthly[i]) monthly[i].loss += Number(e.amount) })
  const maxBar = Math.max(1, ...monthly.map((d) => d.profit + d.loss))
  const axisTop = Math.ceil(maxBar / 4) * 4 || 4

  const recent = [
    ...salesList.map((s) => ({ kind: 'Penjualan', name: s.product?.name ?? '-', date: s.sale_date, amount: s.quantity * s.unit_price, status: 'success' as const, statusLabel: 'Selesai' })),
    ...expenseList.map((e) => ({ kind: 'Biaya', name: e.category + (e.description ? ` · ${e.description}` : ''), date: e.expense_date, amount: -Number(e.amount), status: 'neutral' as const, statusLabel: 'Tercatat' })),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6)

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* Hero balance */}
      <Card className="p-5 lg:col-span-4">
        <div className="flex items-start justify-between">
          <p className="text-sm text-secondary">Total Pendapatan</p>
          <Select value={period} onValueChange={setPeriod} className="h-8 w-28 text-xs"
            options={[{ value: 'month', label: 'Bulan Ini' }, { value: 'year', label: 'Tahun Ini' }]} />
        </div>
        <p className="mt-3 text-3xl font-bold text-ink">{formatCurrency(totalRevenue)}</p>
        <p className="mt-1 text-xs text-secondary">
          <span className={revDelta >= 0 ? 'text-success' : 'text-danger'}>{revDelta >= 0 ? '↑' : '↓'} {Math.abs(revDelta).toFixed(0)}%</span> dari bulan lalu
        </p>
        <div className="mt-4 flex gap-2">
          <Link to="/app/sales" className="flex-1"><Button variant="lime" className="w-full"><ArrowLeftRight className="h-4 w-4" /> Catat Jual</Button></Link>
          <Link to="/app/expenses" className="flex-1"><Button variant="outline" className="w-full"><Send className="h-4 w-4" /> Catat Biaya</Button></Link>
        </div>
        {/* mini net-profit strip */}
        <div className="mt-4 rounded-xl border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-secondary"><PiggyBank className="h-4 w-4" /> Laba Bersih</span>
            <span className={`text-sm font-semibold ${netProfit >= 0 ? 'text-ink' : 'text-danger'}`}>{formatCurrency(netProfit)}</span>
          </div>
        </div>
      </Card>

      {/* 2x2 stat grid */}
      <div className="grid grid-cols-2 gap-4 lg:col-span-4">
        <StatCard label="Laba Kotor" value={formatCurrency(grossProfit)} delta={revDelta} deltaLabel="bln ini" tone="dark" icon={<Coins className="h-4 w-4" />} />
        <StatCard label="Biaya" value={formatCurrency(totalExpenses)} delta={expDelta} deltaLabel="bln ini" icon={<Wallet className="h-4 w-4 text-secondary" />} />
        <StatCard label="Total HPP" value={formatCurrency(totalHpp)} icon={<Receipt className="h-4 w-4 text-secondary" />} />
        <StatCard label="Pendapatan" value={formatCurrency(totalRevenue)} icon={<ShoppingBag className="h-4 w-4 text-secondary" />} />
      </div>

      {/* Profit/Loss chart */}
      <Card className="p-5 lg:col-span-4">
        <CardHeader title="Laba & Biaya" subtitle="Periode berjalan" action={
          <div className="flex items-center gap-3 text-xs text-secondary">
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-highlight" />Laba</span>
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-ink" />Biaya</span>
          </div>
        } />
        <div className="mt-5 flex gap-2">
          <div className="flex flex-col justify-between py-1 text-[10px] text-secondary" style={{ height: '160px' }}>
            {[4, 3, 2, 1, 0].map((i) => <span key={i}>{Math.round((axisTop / 4) * i / 1000)}k</span>)}
          </div>
          <div className="flex flex-1 items-end justify-between gap-1.5" style={{ height: '160px' }}>
            {monthly.map((d) => (
              <div key={d.m} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 flex-col justify-end overflow-hidden rounded-md">
                  <div className="w-full bg-highlight" style={{ height: `${(d.profit / axisTop) * 100}%` }} />
                  <div className="w-full bg-ink" style={{ height: `${(d.loss / axisTop) * 100}%` }} />
                </div>
                <span className="text-[10px] text-secondary">{d.m}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Stock panel */}
      <Card className="p-5 lg:col-span-4">
        <CardHeader title="Stok & Saran Pesan" action={<Link to="/app/inventory" className="text-xs font-medium text-accent">Semua</Link>} />
        {lowStock.length === 0 && (!reorder || reorder.length === 0) ? (
          <p className="mt-8 text-center text-sm text-secondary">Semua stok aman</p>
        ) : (
          <div className="mt-4 space-y-2">
            {lowStock.slice(0, 3).map((ing) => (
              <Link key={ing.id} to={`/app/inventory/${ing.id}`} className="flex items-center justify-between rounded-xl bg-accent-soft px-3 py-2.5">
                <span className="text-sm text-ink">{ing.name}</span>
                <span className="text-xs font-medium text-accent">{ing.current_stock} {ing.unit}</span>
              </Link>
            ))}
            {reorder?.slice(0, 3).map((s) => (
              <Link key={s.ingredientId} to={`/app/inventory/stock-in?ingredient=${s.ingredientId}&supplier=${s.lastSupplierId ?? ''}`} className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
                <div className="min-w-0"><p className="truncate text-sm text-ink">{s.name}</p><p className="text-xs text-secondary">min {s.minStockLevel} {s.unit}</p></div>
                <span className="text-xs font-medium text-accent">+ Pesan</span>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Recent activities */}
      <Card className="p-5 lg:col-span-8">
        <div className="flex items-center justify-between">
          <CardHeader title="Aktivitas Terbaru" />
          <span className={`text-xs font-medium ${weekly.changePct >= 0 ? 'text-success' : 'text-danger'}`}>
            {weekly.changePct >= 0 ? '↑' : '↓'} {Math.abs(weekly.changePct).toFixed(1)}% vs minggu lalu
          </span>
        </div>
        {recent.length === 0 ? (
          <p className="mt-6 text-sm text-secondary">Belum ada aktivitas. Mulai dengan mencatat penjualan atau biaya.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-secondary">
                  <th className="pb-2 font-medium">Jenis</th>
                  <th className="pb-2 font-medium">Keterangan</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Tanggal</th>
                  <th className="pb-2 text-right font-medium">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium text-ink">{a.kind}</td>
                    <td className="py-3 text-secondary">{a.name}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${a.status === 'success' ? 'text-success' : 'text-secondary'}`}>
                        <i className={`h-1.5 w-1.5 rounded-full ${a.status === 'success' ? 'bg-success' : 'bg-secondary'}`} />
                        {a.statusLabel}
                      </span>
                    </td>
                    <td className="py-3 text-secondary">{String(a.date).slice(0, 10)}</td>
                    <td className={`py-3 text-right font-semibold ${a.amount >= 0 ? 'text-ink' : 'text-danger'}`}>
                      {a.amount >= 0 ? '+' : '−'}{formatCurrency(Math.abs(a.amount))}
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
