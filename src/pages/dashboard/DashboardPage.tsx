import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftRight, Send, Wallet, Receipt, Coins, PiggyBank, ShoppingBag } from 'lucide-react'
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
import { ShieldCheck, ArrowRight } from 'lucide-react'
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
    <div className="space-y-5">
      {/* Margin Guard teaser — USP hook */}
      <Link to="/app/margin-guard" className="block">
        <div className="lift flex items-center justify-between gap-4 rounded-2xl bg-ink p-4 text-white shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
              <ShieldCheck className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="text-sm font-semibold">Margin Guard · Skor {margin.score}/100</p>
              <p className="text-xs text-white/70">
                {margin.lossCount > 0
                  ? `${margin.lossCount} produk dijual RUGI karena harga bahan naik. Cek sekarang.`
                  : margin.riskCount > 0
                    ? `${margin.riskCount} produk margin tipis. Lihat saran harga.`
                    : 'Semua produk margin sehat. Pantau terus keuntunganmu.'}
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-1 text-sm font-medium text-accent sm:flex">
            Buka <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>

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
        <StatCard label="Biaya" value={formatCurrency(totalExpenses)} delta={expDelta} deltaLabel="bln ini" tone="berry" icon={<Wallet className="h-4 w-4" />} />
        <StatCard label="Total HPP" value={formatCurrency(totalHpp)} tone="grape" icon={<Receipt className="h-4 w-4" />} />
        <StatCard label="Pendapatan" value={formatCurrency(totalRevenue)} tone="mint" icon={<ShoppingBag className="h-4 w-4" />} />
      </div>

      {/* Profit/Loss chart */}
      <Card className="p-5 lg:col-span-4">
        <CardHeader title="Laba & Biaya" subtitle="Periode berjalan" action={
          <div className="flex items-center gap-3 text-xs text-secondary">
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-highlight" />Laba</span>
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-ink" />Biaya</span>
          </div>
        } />
        <div className="mt-5">
          <Curve data={monthly} axisTop={axisTop} />
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
        return <line key={i} x1={PAD} y1={gy} x2={W - PAD} y2={gy} stroke="#ECE9E3" strokeWidth="1" />
      })}
      <defs>
        <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD24A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFD24A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area('profit')} fill="url(#gProfit)" />
      <path d={spline('profit')} fill="none" stroke="#F2782C" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d={spline('loss')} fill="none" stroke="#24201B" strokeWidth="2" strokeDasharray="4 4" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={d.m}>
          {d.profit > 0 && <circle cx={x(i)} cy={y(d.profit)} r="3" fill="#F2782C" />}
          <text x={x(i)} y={H + 12} textAnchor="middle" fontSize="9" fill="#8A8276">{d.m}</text>
        </g>
      ))}
    </svg>
  )
}
