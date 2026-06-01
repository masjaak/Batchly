import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecipes } from '@/hooks/useRecipes'
import { useIngredients } from '@/hooks/useIngredients'
import { useSales } from '@/hooks/useSales'
import { useExpenses } from '@/hooks/useExpenses'
import { useReorderSuggestions } from '@/hooks/useReorderSuggestions'
import { useMarginGuard } from '@/hooks/useMarginGuard'
import { calculateRecipeCost, calculateWeeklyComparison, formatCurrency } from '@/lib/calculations'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { PageHeader } from '@/components/ui/EmptyState'
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function hppPerUnit(s: any): number {
  return s.product?.recipe ? calculateRecipeCost(s.product.recipe, s.product.recipe.recipe_items ?? []).perUnitHpp : 0
}
const monthKey = (d: Date) => d.getFullYear() * 12 + d.getMonth()

export default function DashboardPage() {
  const { data: sales } = useSales()
  const { data: ingredients } = useIngredients()
  const { data: recipes } = useRecipes()
  const { data: expenses } = useExpenses()
  const { data: reorder } = useReorderSuggestions()
  const margin = useMarginGuard(30)
  const [period, setPeriod] = useState('year')

  const salesList: any[] = sales ?? []
  const expenseList = expenses ?? []
  const lowStock = ingredients?.filter((i) => i.current_stock <= i.min_stock_level) ?? []

  // Onboarding gate: show checklist until the core setup is done.
  const setupDone = (ingredients?.length ?? 0) > 0 && (recipes?.length ?? 0) > 0 && salesList.length > 0
  if (!setupDone) {
    return (
      <OnboardingChecklist
        hasIngredients={(ingredients?.length ?? 0) > 0}
        hasRecipes={(recipes?.length ?? 0) > 0}
        hasSales={salesList.length > 0}
      />
    )
  }

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
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader
        title="Dashboard"
        subtitle="Ringkasan kinerja usaha kamu."
        action={
          <>
            <Select value={period} onValueChange={setPeriod} className="w-32"
              options={[{ value: 'month', label: 'Bulan Ini' }, { value: 'year', label: 'Tahun Ini' }]} />
            <Link to="/app/sales"><Button>Catat Jual</Button></Link>
            <Link to="/app/expenses"><Button variant="secondary">Catat Biaya</Button></Link>
          </>
        }
      />

      {/* KPI band */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pendapatan" value={formatCurrency(totalRevenue)} delta={revDelta} deltaLabel="vs bln lalu" />
        <StatCard label="Laba Kotor" value={formatCurrency(grossProfit)} />
        <StatCard label="Biaya" value={formatCurrency(totalExpenses)} delta={expDelta} deltaLabel="vs bln lalu" />
        <StatCard label="Laba Bersih" value={formatCurrency(netProfit)} tone="dark" />
      </div>

      {/* Main grid: content + side rail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Profit/Loss chart */}
          <Card className="p-5">
            <CardHeader title="Laba & Biaya" subtitle="Periode berjalan" action={
              <div className="flex items-center gap-3 text-xs text-secondary">
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-ink" />Laba</span>
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-secondary" />Biaya</span>
              </div>
            } />
            <div className="mt-5">
              <Curve data={monthly} axisTop={axisTop} />
            </div>
          </Card>

          {/* Recent activities */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <CardHeader title="Aktivitas Terbaru" />
              <span className="text-xs font-medium text-secondary tnum">
                {weekly.changePct >= 0 ? '+' : '−'}{Math.abs(weekly.changePct).toFixed(1)}% vs minggu lalu
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
                      <th className="pb-2 font-medium">Tanggal</th>
                      <th className="pb-2 text-right font-medium">Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((a, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-3 font-medium text-ink">{a.kind}</td>
                        <td className="py-3 text-secondary">{a.name}</td>
                        <td className="py-3 text-secondary tnum">{String(a.date).slice(0, 10)}</td>
                        <td className="py-3 text-right font-semibold text-ink tnum">
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

        {/* Side rail */}
        <div className="space-y-6">
          {/* Margin Guard teaser — USP hook */}
          <Link to="/app/margin-guard" className="block">
            <div className="rounded-2xl bg-ink p-5 text-white">
              <p className="text-xs uppercase tracking-wider text-white/60">Margin Guard</p>
              <p className="mt-2 text-3xl font-semibold tnum">{margin.score}<span className="text-base font-normal text-white/60">/100</span></p>
              <p className="mt-2 text-xs text-white/70">
                {margin.lossCount > 0
                  ? `${margin.lossCount} produk dijual RUGI. Cek sekarang.`
                  : margin.riskCount > 0
                    ? `${margin.riskCount} produk margin tipis. Lihat saran harga.`
                    : 'Semua produk margin sehat.'}
              </p>
              <span className="mt-3 inline-block text-sm font-medium text-white/90">Buka →</span>
            </div>
          </Link>

          {/* Stock panel */}
          <Card className="p-5">
            <CardHeader title="Stok & Saran Pesan" action={<Link to="/app/inventory" className="text-xs font-medium text-ink underline">Semua</Link>} />
            {lowStock.length === 0 && (!reorder || reorder.length === 0) ? (
              <p className="mt-8 text-center text-sm text-secondary">Semua stok aman</p>
            ) : (
              <div className="mt-4 space-y-2">
                {lowStock.slice(0, 3).map((ing) => (
                  <Link key={ing.id} to={`/app/inventory/${ing.id}`} className="flex items-center justify-between rounded-xl border-l-2 border-ink bg-surface-muted px-3 py-2.5">
                    <span className="text-sm text-ink">{ing.name}</span>
                    <span className="text-xs font-medium text-ink tnum">{ing.current_stock} {ing.unit}</span>
                  </Link>
                ))}
                {reorder?.slice(0, 3).map((s) => (
                  <Link key={s.ingredientId} to={`/app/inventory/stock-in?ingredient=${s.ingredientId}&supplier=${s.lastSupplierId ?? ''}`} className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
                    <div className="min-w-0"><p className="truncate text-sm text-ink">{s.name}</p><p className="text-xs text-secondary tnum">min {s.minStockLevel} {s.unit}</p></div>
                    <span className="text-xs font-medium text-ink">+ Pesan</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function Curve({ data, axisTop }: { data: { m: string; profit: number; loss: number }[]; axisTop: number }) {
  const W = 720, H = 180, PAD = 8
  const n = data.length
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / (n - 1)
  const y = (v: number) => H - PAD - (Math.max(0, v) / axisTop) * (H - PAD * 2)
  // Smooth spline (Catmull-Rom -> cubic Bezier)
  const spline = (key: 'profit' | 'loss') => {
    const pts = data.map((d, i) => [x(i), y(d[key])] as [number, number])
    if (pts.length < 2) return ''
    let dPath = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[i + 2] ?? p2
      const c1x = p1[0] + (p2[0] - p0[0]) / 6
      const c1y = p1[1] + (p2[1] - p0[1]) / 6
      const c2x = p2[0] - (p3[0] - p1[0]) / 6
      const c2y = p2[1] - (p3[1] - p1[1]) / 6
      dPath += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
    }
    return dPath
  }
  const area = (key: 'profit' | 'loss') =>
    `${spline(key)} L ${x(n - 1).toFixed(1)} ${H - PAD} L ${x(0).toFixed(1)} ${H - PAD} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H + 16}`} className="w-full" preserveAspectRatio="none" style={{ height: 196 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const gy = PAD + (i * (H - PAD * 2)) / 4
        return <line key={i} x1={PAD} y1={gy} x2={W - PAD} y2={gy} stroke="#E4E4E4" strokeWidth="1" />
      })}
      <defs>
        <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141414" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#141414" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area('profit')} fill="url(#gProfit)" />
      <path d={spline('profit')} fill="none" stroke="#141414" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <path d={spline('loss')} fill="none" stroke="#6B6B6B" strokeWidth="1.5" strokeDasharray="4 4" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={d.m}>
          {d.profit > 0 && <circle cx={x(i)} cy={y(d.profit)} r="3" fill="#141414" />}
          <text x={x(i)} y={H + 12} textAnchor="middle" fontSize="9" fill="#6B6B6B">{d.m}</text>
        </g>
      ))}
    </svg>
  )
}
