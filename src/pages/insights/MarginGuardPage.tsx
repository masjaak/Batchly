import { Link } from 'react-router-dom'
import { useMarginGuard } from '@/hooks/useMarginGuard'
import { formatCurrency } from '@/lib/calculations'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/StatCard'

const TARGET = 30

export default function MarginGuardPage() {
  const { insights, score, lossCount, riskCount } = useMarginGuard(TARGET)

  const scoreLabel = score >= 70 ? 'Sehat' : score >= 40 ? 'Perlu Perhatian' : 'Kritis'

  return (
    <div className="space-y-5">
      {/* Hero: health score + alerts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#F4F4F4" strokeWidth="12" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke="#141414"
                strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-semibold text-ink tnum">{score}</span>
              <span className="text-[10px] text-secondary">/ 100</span>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold text-ink">Skor Kesehatan Profit</p>
          <p className="text-xs font-medium text-secondary">{scoreLabel}</p>
        </Card>

        <Card className="flex flex-col justify-center p-6 lg:col-span-2">
          <CardHeader title="Margin Guard" subtitle="Penjaga keuntungan otomatis — tahu produk mana yang diam-diam rugi." />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold text-ink">Jual Rugi</p>
              <p className="mt-1 text-2xl font-semibold text-ink tnum">{lossCount} <span className="text-sm font-normal text-secondary">produk</span></p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold text-ink">Margin Tipis</p>
              <p className="mt-1 text-2xl font-semibold text-ink tnum">{riskCount} <span className="text-sm font-normal text-secondary">produk</span></p>
            </div>
          </div>
        </Card>
      </div>

      {/* Top-profit ranking + insight */}
      {insights.length > 0 && (() => {
        const top = [...insights].sort((a, b) => b.currentMargin - a.currentMargin).slice(0, 3)
        const best = top[0]
        const worst = insights[0] // sorted ascending in hook
        const driftHigh = insights.filter((i) => i.costDriftPct > 10)
        return (
          <Card className="p-5">
            <CardHeader title="Produk Paling Cuan" subtitle="Ranking berdasarkan margin terkini." />
            <div className="mt-4 space-y-2">
              {top.map((p, i) => (
                <div key={p.productId} className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
                  <span className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-semibold tnum ${i === 0 ? 'bg-ink text-white' : 'bg-surface-muted text-secondary'}`}>{i + 1}</span>
                    <span className="text-sm font-medium text-ink">{p.name}</span>
                  </span>
                  <span className="text-sm font-semibold text-ink tnum">{p.currentMargin.toFixed(0)}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-border bg-surface-muted p-3">
              <p className="text-xs font-semibold text-ink">Insight</p>
              <p className="mt-1 text-sm text-ink">
                {best && `"${best.name}" produk paling menguntungkan (margin ${best.currentMargin.toFixed(0)}%). `}
                {driftHigh.length > 0
                  ? `${driftHigh.length} produk HPP-nya naik >10% sejak resep dibuat — pertimbangkan naikkan harga.`
                  : worst && worst.currentMargin < TARGET
                    ? `Margin "${worst.name}" paling tipis (${worst.currentMargin.toFixed(0)}%) — cek saran harga di bawah.`
                    : 'Semua produk margin sehat. Pertahankan.'}
              </p>
            </div>
          </Card>
        )
      })()}

      {/* Product table */}
      <Card className="p-5">
        <CardHeader title="Analisis Margin per Produk" subtitle={`Target margin ${TARGET}% · HPP dihitung ulang dari harga bahan terkini`} />
        {insights.length === 0 ? (
          <p className="mt-6 text-sm text-secondary">
            Belum ada produk dengan resep. <Link to="/app/recipes" className="text-ink underline">Buat resep dulu</Link> agar Batchly bisa menghitung HPP & margin.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-secondary">
                  <th className="pb-2 font-medium">Produk</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 text-right font-medium">Harga Jual</th>
                  <th className="pb-2 text-right font-medium">HPP Terkini</th>
                  <th className="pb-2 text-right font-medium">Margin</th>
                  <th className="pb-2 text-right font-medium">Kenaikan HPP</th>
                  <th className="pb-2 text-right font-medium">Saran Harga</th>
                </tr>
              </thead>
              <tbody>
                {insights.map((p) => (
                  <tr key={p.productId} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium text-ink">{p.name}</td>
                    <td className="py-3">
                      {p.status === 'loss' ? <Badge status="danger">Rugi</Badge>
                        : p.status === 'risk' ? <Badge status="warning">Tipis</Badge>
                        : <Badge status="success">Sehat</Badge>}
                    </td>
                    <td className="py-3 text-right text-secondary tnum">{formatCurrency(p.sellingPrice)}</td>
                    <td className="py-3 text-right text-secondary tnum">{formatCurrency(p.currentHpp)}</td>
                    <td className={`py-3 text-right font-semibold tnum ${p.currentMargin < TARGET ? 'text-ink' : 'text-secondary'}`}>
                      {p.currentMargin.toFixed(0)}%
                    </td>
                    <td className={`py-3 text-right tnum ${p.costDriftPct > 5 ? 'font-semibold text-ink' : 'text-secondary'}`}>
                      {p.costDriftPct > 0 ? '+' : ''}{p.costDriftPct.toFixed(0)}%
                    </td>
                    <td className="py-3 text-right tnum">
                      {p.suggestedPrice > p.sellingPrice ? (
                        <span className="font-medium text-ink">{formatCurrency(p.suggestedPrice)} →</span>
                      ) : (
                        <span className="text-secondary">OK</span>
                      )}
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
