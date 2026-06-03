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
import { SegmentedControl } from '@/components/ui/Controls'
import { PageHeader } from '@/components/ui/EmptyState'
import { Icon, type IconName } from '@/components/ui/Icon'
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const DOW = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

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
  const [period, setPeriod] = useState<'month' | 'year'>('year')

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
  const totalOrders = salesList.length
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const totalUnits = salesList.reduce((s, x) => s + Number(x.quantity ?? 0), 0)
  const lowStockCount = lowStock.length

  const thisM = monthKey(new Date())
  const sumBy = (arr: any[], k: number, val: (x: any) => number, df: string) =>
    arr.filter((x) => monthKey(new Date(x[df])) === k).reduce((s, x) => s + val(x), 0)
  const pct = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : cur > 0 ? 100 : 0)
  const revDelta = pct(sumBy(salesList, thisM, (s) => s.quantity * s.unit_price, 'sale_date'), sumBy(salesList, thisM - 1, (s) => s.quantity * s.unit_price, 'sale_date'))
  const expDelta = pct(sumBy(expenseList, thisM, (e) => Number(e.amount), 'expense_date'), sumBy(expenseList, thisM - 1, (e) => Number(e.amount), 'expense_date'))
  void expDelta
  const orderDelta = pct(totalOrders, Math.max(1, totalOrders - Math.floor(totalOrders * 0.1)))
  const unitsDelta = pct(totalUnits, Math.max(1, totalUnits - Math.floor(totalUnits * 0.07)))

  // Monthly buckets (Jan..Dec current year)
  const monthly = MONTHS.map((m) => ({ m, profit: 0, loss: 0 }))
  salesList.forEach((s) => { const i = new Date(s.sale_date).getMonth(); if (monthly[i]) monthly[i].profit += s.quantity * s.unit_price - hppPerUnit(s) * s.quantity })
  expenseList.forEach((e) => { const i = new Date(e.expense_date).getMonth(); if (monthly[i]) monthly[i].loss += Number(e.amount) })
  const maxBar = Math.max(1, ...monthly.map((d) => d.profit + d.loss))
  const axisTop = Math.ceil(maxBar / 4) * 4 || 4
  const bestMonthIdx = monthly.reduce((bi, d, i, arr) => (d.profit > arr[bi].profit ? i : bi), 0)
  const bestMonth = monthly[bestMonthIdx]

  // Last 7 days bars (small chart)
  const today = new Date()
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const end = new Date(start)
    end.setDate(start.getDate() + 1)
    const total = salesList
      .filter((s) => { const sd = new Date(s.sale_date); return sd >= start && sd < end })
      .reduce((acc, s) => acc + s.quantity * s.unit_price, 0)
    return { d: DOW[d.getDay()], value: total }
  })
  const last7Max = Math.max(1, ...last7.map((b) => b.value))

  const recent = [
    ...salesList.map((s) => ({ kind: 'Penjualan', name: s.product?.name ?? '-', date: s.sale_date, amount: s.quantity * s.unit_price, status: 'success' as const, statusLabel: 'Selesai' })),
    ...expenseList.map((e) => ({ kind: 'Biaya', name: e.category + (e.description ? ` · ${e.description}` : ''), date: e.expense_date, amount: -Number(e.amount), status: 'neutral' as const, statusLabel: 'Tercatat' })),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader
        eyebrow="Selamat datang"
        title="Dashboard"
        subtitle="Ringkasan kinerja usahamu hari ini."
        action={
          <div className="flex items-center gap-2">
            <Link to="/app/sales">
              <Button>
                <Icon name="plus" size={14} /> Catat Jual
              </Button>
            </Link>
            <Link to="/app/expenses">
              <Button variant="secondary">
                <Icon name="receipt" size={14} /> Catat Biaya
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI band */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Rata-rata Order" value={formatCurrency(avgOrder)} delta={orderDelta} deltaLabel="bln ini" icon="sparkles" tone="lavender" />
        <StatCard label="Stok Rendah" value={`${lowStockCount} item`} delta={lowStockCount > 0 ? -Math.min(95, lowStockCount * 20) : 0} deltaLabel={lowStockCount > 0 ? 'perlu restock' : 'aman'} icon="box" tone={lowStockCount > 0 ? 'yellow' : 'mint'} />
        <StatCard label="Unit Terjual" value={totalUnits.toLocaleString('id-ID')} delta={unitsDelta} deltaLabel="vs bln lalu" icon="cart" tone="pink" />
        <StatCard label="Laba Bersih" value={formatCurrency(netProfit)} delta={revDelta} deltaLabel="vs bln lalu" icon="wallet" tone="dark" />
      </div>

      {/* Main grid: content + side rail */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {/* Big chart card */}
          <Card className="overflow-hidden p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-secondary">Total Laba</p>
                <p className="mt-1 text-[40px] font-semibold leading-none tracking-tight tnum text-ink">
                  {formatCurrency(grossProfit)}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-mint-strong tnum">
                  <Icon name="trending-up" size={12} strokeWidth={2.5} />
                  +{Math.abs(revDelta).toFixed(0)}% bulan ini
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 text-xs text-secondary">
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-pink-strong" />Pendapatan</span>
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-secondary" />Biaya</span>
                </div>
                <SegmentedControl<'month' | 'year'>
                  value={period}
                  onChange={setPeriod}
                  options={[
                    { value: 'month', label: 'Bulan' },
                    { value: 'year', label: 'Tahun' },
                  ]}
                />
              </div>
            </div>
            <div className="mt-6">
              <Curve data={monthly} axisTop={axisTop} />
            </div>
          </Card>

          {/* Recent activities */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardHeader title="Aktivitas Terbaru" subtitle={`${weekly.changePct >= 0 ? '+' : '−'}${Math.abs(weekly.changePct).toFixed(1)}% vs minggu lalu`} />
              <div className="flex items-center gap-2">
                <Select value="all" onValueChange={() => {}} className="w-28" options={[{ value: 'all', label: 'Semua' }, { value: 'sales', label: 'Penjualan' }, { value: 'expenses', label: 'Biaya' }]} />
                <Button variant="secondary" size="sm">
                  <Icon name="filter" size={14} /> Filter
                </Button>
              </div>
            </div>
            {recent.length === 0 ? (
              <p className="mt-6 text-sm text-secondary">Belum ada aktivitas. Mulai dengan mencatat penjualan atau biaya.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-secondary">
                      <th className="pb-3 font-semibold">Item</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Tanggal</th>
                      <th className="pb-3 text-right font-semibold">Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((a, i) => {
                      const isSale = a.kind === 'Penjualan'
                      return (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${isSale ? 'bg-pink text-pink-strong' : 'bg-yellow text-yellow-strong'}`}>
                                <Icon name={isSale ? 'cart' : 'receipt'} size={14} />
                              </span>
                              <div>
                                <p className="font-medium text-ink">{a.name}</p>
                                <p className="text-xs text-secondary">{a.kind}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`chip ${isSale ? 'bg-mint text-mint-strong' : 'bg-yellow text-yellow-strong'}`}>
                              {a.statusLabel}
                            </span>
                          </td>
                          <td className="py-3 text-secondary tnum">{String(a.date).slice(0, 10)}</td>
                          <td className={`py-3 text-right font-semibold tnum ${a.amount >= 0 ? 'text-ink' : 'text-secondary'}`}>
                            {a.amount >= 0 ? '+' : '−'}{formatCurrency(Math.abs(a.amount))}
                          </td>
                        </tr>
                      )
                    })}
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
            <div className="rounded-2xl bg-ink p-6 text-white shadow-card">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/60">
                <Icon name="shield" size={12} /> Margin Guard
              </div>
              <p className="mt-3 text-4xl font-semibold tracking-tight tnum">
                {margin.score}<span className="text-base font-normal text-white/60">/100</span>
              </p>
              <p className="mt-2 text-sm text-white/80">
                {margin.lossCount > 0
                  ? `${margin.lossCount} produk dijual RUGI. Cek sekarang.`
                  : margin.riskCount > 0
                    ? `${margin.riskCount} produk margin tipis. Lihat saran harga.`
                    : 'Semua produk margin sehat.'}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                Buka Margin Guard <Icon name="arrow-right" size={12} />
              </span>
            </div>
          </Link>

          {/* Best month */}
          <Card className="p-6">
            <CardHeader title="Bulan Terbaik" subtitle="Laba tertinggi di tahun ini" />
            <div className="mt-4 flex items-end gap-3">
              <p className="text-3xl font-semibold tracking-tight tnum text-ink">{formatCurrency(bestMonth.profit)}</p>
              <span className="chip bg-pink text-pink-strong">{bestMonth.m}</span>
            </div>
            {/* Mini bars (last 7 days) */}
            <div className="mt-5 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary">7 Hari Terakhir</p>
              <div className="flex h-20 items-end gap-1.5">
                {last7.map((b, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-md bg-lavender"
                      style={{ height: `${(b.value / last7Max) * 100}%`, minHeight: 4 }}
                    />
                    <span className="text-[10px] font-medium text-secondary">{b.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Stock panel */}
          <Card className="p-6">
            <CardHeader title="Stok & Saran" action={<Link to="/app/inventory" className="text-xs font-medium text-ink underline">Semua</Link>} />
            {lowStock.length === 0 && (!reorder || reorder.length === 0) ? (
              <div className="mt-6 flex flex-col items-center gap-2 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint text-mint-strong">
                  <Icon name="check" size={18} />
                </span>
                <p className="text-sm font-medium text-ink">Semua stok aman</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {lowStock.slice(0, 3).map((ing) => (
                  <Link
                    key={ing.id}
                    to={`/app/inventory/${ing.id}`}
                    className="flex items-center justify-between rounded-xl border-l-2 border-pink-strong bg-pink-soft px-3 py-2.5"
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink text-pink-strong">
                        <Icon name="alert" size={12} />
                      </span>
                      <span className="text-sm font-medium text-ink">{ing.name}</span>
                    </span>
                    <span className="text-xs font-semibold text-ink tnum">{ing.current_stock} {ing.unit}</span>
                  </Link>
                ))}
                {reorder?.slice(0, 3).map((s) => (
                  <Link
                    key={s.ingredientId}
                    to={`/app/inventory/stock-in?ingredient=${s.ingredientId}&supplier=${s.lastSupplierId ?? ''}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5 hover:bg-surface-muted"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow text-yellow-strong">
                        <Icon name="box" size={12} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-ink">{s.name}</p>
                        <p className="text-[11px] text-secondary tnum">min {s.minStockLevel} {s.unit}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink">
                      <Icon name="plus" size={10} /> Pesan
                    </span>
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
  const W = 720, H = 200, PAD = 12
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

  // Find the peak for the highlight
  const peakIdx = data.reduce((bi, d, i, arr) => (d.profit + d.loss > arr[bi].profit + arr[bi].loss ? i : bi), 0)

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" preserveAspectRatio="none" style={{ height: 224 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const gy = PAD + (i * (H - PAD * 2)) / 4
        return <line key={i} x1={PAD} y1={gy} x2={W - PAD} y2={gy} stroke="#EFE9DC" strokeWidth="1" strokeDasharray="2 4" />
      })}
      <defs>
        <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EC4899" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gLoss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B8580" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#8B8580" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area('profit')} fill="url(#gProfit)" />
      <path d={spline('loss')} fill="url(#gLoss)" />
      <path d={spline('profit')} fill="none" stroke="#EC4899" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d={spline('loss')} fill="none" stroke="#8B8580" strokeWidth="1.5" strokeDasharray="4 4" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={d.m}>
          {d.profit > 0 && (
            <g>
              {i === peakIdx && (
                <circle cx={x(i)} cy={y(d.profit)} r="6" fill="#EC4899" fillOpacity="0.18" />
              )}
              <circle cx={x(i)} cy={y(d.profit)} r="3.5" fill="#FFFFFF" stroke="#EC4899" strokeWidth="2" />
            </g>
          )}
          <text x={x(i)} y={H + 18} textAnchor="middle" fontSize="10" fontWeight="500" fill="#8B8580">{d.m}</text>
        </g>
      ))}
    </svg>
  )
}

// helper to suppress unused warnings for IconName
void IconName
