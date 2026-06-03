import { Link } from 'react-router-dom'
import { useMarginGuard } from '@/hooks/useMarginGuard'
import { formatCurrency } from '@/lib/calculations'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/StatCard'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

const TARGET = 30

export default function MarginGuardPage() {
  const { insights, score, lossCount, riskCount } = useMarginGuard(TARGET)
  const scoreLabel = score >= 70 ? 'Sehat' : score >= 40 ? 'Perlu Perhatian' : 'Kritis'
  const scoreTone = score >= 70 ? 'mint' : score >= 40 ? 'yellow' : 'pink'

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Insight</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Margin Guard</h1>
        <p className="mt-1 max-w-2xl text-sm text-secondary">
          Penjaga keuntungan otomatis — tahu produk mana yang diam-diam rugi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center p-8 text-center">
          <div className="relative flex h-36 w-36 items-center justify-center">
            <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#EFE9DC" strokeWidth="12" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EC4899'}
                strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-semibold text-ink tnum">{score}</span>
              <span className="text-xs text-secondary">/ 100</span>
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold text-ink">Skor Kesehatan Profit</p>
          <span className={cn(
            'mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
            scoreTone === 'mint' && 'bg-mint text-mint-strong',
            scoreTone === 'yellow' && 'bg-yellow text-yellow-strong',
            scoreTone === 'pink' && 'bg-pink text-pink-strong',
          )}>
            <Icon name={score >= 70 ? 'check' : 'alert'} size={11} />
            {scoreLabel}
          </span>
        </Card>

        <Card className="flex flex-col justify-center p-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender text-grape">
              <Icon name="shield" size={18} />
            </span>
            <CardHeader title="Ringkasan" subtitle={`Target margin ${TARGET}%`} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-pink bg-pink-soft p-4">
              <p className="text-sm font-semibold text-ink">Jual Rugi</p>
              <p className="mt-1 text-3xl font-semibold text-pink-strong tnum">{lossCount}</p>
              <p className="text-xs text-secondary">produk margin negatif</p>
            </div>
            <div className="rounded-2xl border border-yellow bg-yellow/30 p-4">
              <p className="text-sm font-semibold text-ink">Margin Tipis</p>
              <p className="mt-1 text-3xl font-semibold text-yellow-strong tnum">{riskCount}</p>
              <p className="text-xs text-secondary">produk margin &lt; 30%</p>
            </div>
          </div>
        </Card>
      </div>

      {insights.length > 0 && (() => {
        const top = [...insights].sort((a, b) => b.currentMargin - a.currentMargin).slice(0, 3)
        const best = top[0]
        const worst = insights[0]
        const driftHigh = insights.filter((i) => i.costDriftPct > 10)
        return (
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow text-yellow-strong">
                <Icon name="star" size={18} />
              </span>
              <CardHeader title="Produk Paling Cuan" subtitle="Ranking berdasarkan margin terkini" />
            </div>
            <div className="mt-4 space-y-2">
              {top.map((p, i) => {
                const palette = ['bg-ink text-white', 'bg-lavender text-grape', 'bg-blue text-blue-strong']
                return (
                  <div key={p.productId} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
                    <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold tnum', palette[i])}>
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium text-ink">{p.name}</span>
                    <span className="text-sm font-semibold text-ink tnum">{p.currentMargin.toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-mint bg-mint/30 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-mint text-mint-strong">
                <Icon name="sparkles" size={14} />
              </span>
              <div>
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
            </div>
          </Card>
        )
      })()}

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink text-pink-strong">
            <Icon name="trending-down" size={18} />
          </span>
          <CardHeader title="Analisis Margin per Produk" subtitle={`Target margin ${TARGET}% · HPP dihitung ulang dari harga bahan terkini`} />
        </div>
        {insights.length === 0 ? (
          <p className="mt-6 text-sm text-secondary">
            Belum ada produk dengan resep. <Link to="/app/recipes" className="font-semibold text-ink underline">Buat resep dulu</Link> agar Batchly bisa menghitung HPP & margin.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-secondary">
                  <th className="pb-3 font-semibold">Produk</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Harga Jual</th>
                  <th className="pb-3 text-right font-semibold">HPP Terkini</th>
                  <th className="pb-3 text-right font-semibold">Margin</th>
                  <th className="pb-3 text-right font-semibold">Kenaikan HPP</th>
                  <th className="pb-3 text-right font-semibold">Saran Harga</th>
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
                    <td className={cn('py-3 text-right font-semibold tnum', p.currentMargin < TARGET ? 'text-ink' : 'text-mint-strong')}>
                      {p.currentMargin.toFixed(0)}%
                    </td>
                    <td className={cn('py-3 text-right tnum', p.costDriftPct > 5 ? 'font-semibold text-pink-strong' : 'text-secondary')}>
                      {p.costDriftPct > 0 ? '+' : ''}{p.costDriftPct.toFixed(0)}%
                    </td>
                    <td className="py-3 text-right tnum">
                      {p.suggestedPrice > p.sellingPrice ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-lavender px-2 py-0.5 font-medium text-ink">
                          {formatCurrency(p.suggestedPrice)} →
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-secondary">
                          <Icon name="check" size={11} /> OK
                        </span>
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
