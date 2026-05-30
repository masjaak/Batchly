import { Link } from 'react-router-dom'
import { ShieldCheck, TrendingDown, AlertTriangle, ArrowRight } from 'lucide-react'
import { useMarginGuard } from '@/hooks/useMarginGuard'
import { formatCurrency } from '@/lib/calculations'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/StatCard'

const TARGET = 30

export default function MarginGuardPage() {
  const { insights, score, lossCount, riskCount } = useMarginGuard(TARGET)

  const scoreColor = score >= 70 ? 'text-success' : score >= 40 ? 'text-warning' : 'text-danger'
  const scoreLabel = score >= 70 ? 'Sehat' : score >= 40 ? 'Perlu Perhatian' : 'Kritis'

  return (
    <div className="space-y-5">
      {/* Hero: health score + alerts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#F4F4F5" strokeWidth="12" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={score >= 70 ? '#2E9E5B' : score >= 40 ? '#B45309' : '#DC2626'}
                strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
              <span className="text-[10px] text-secondary">/ 100</span>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <ShieldCheck className="h-4 w-4 text-accent" /> Skor Kesehatan Profit
          </p>
          <p className={`text-xs font-medium ${scoreColor}`}>{scoreLabel}</p>
        </Card>

        <Card className="flex flex-col justify-center p-6 lg:col-span-2">
          <CardHeader title="Margin Guard" subtitle="Penjaga keuntungan otomatis — tahu produk mana yang diam-diam rugi." />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-red-50 p-4">
              <p className="flex items-center gap-1.5 text-sm font-medium text-danger"><TrendingDown className="h-4 w-4" /> Jual Rugi</p>
              <p className="mt-1 text-2xl font-bold text-danger">{lossCount} <span className="text-sm font-normal">produk</span></p>
            </div>
            <div className="rounded-xl bg-accent-soft p-4">
              <p className="flex items-center gap-1.5 text-sm font-medium text-accent"><AlertTriangle className="h-4 w-4" /> Margin Tipis</p>
              <p className="mt-1 text-2xl font-bold text-accent">{riskCount} <span className="text-sm font-normal">produk</span></p>
            </div>
          </div>
        </Card>
      </div>

      {/* Product table */}
      <Card className="p-5">
        <CardHeader title="Analisis Margin per Produk" subtitle={`Target margin ${TARGET}% · HPP dihitung ulang dari harga bahan terkini`} />
        {insights.length === 0 ? (
          <p className="mt-6 text-sm text-secondary">
            Belum ada produk dengan resep. <Link to="/app/recipes" className="text-accent underline">Buat resep dulu</Link> agar Batchly bisa menghitung HPP & margin.
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
                    <td className="py-3 text-right text-secondary">{formatCurrency(p.sellingPrice)}</td>
                    <td className="py-3 text-right text-secondary">{formatCurrency(p.currentHpp)}</td>
                    <td className={`py-3 text-right font-semibold ${p.currentMargin < 0 ? 'text-danger' : p.currentMargin < TARGET ? 'text-warning' : 'text-success'}`}>
                      {p.currentMargin.toFixed(0)}%
                    </td>
                    <td className={`py-3 text-right ${p.costDriftPct > 5 ? 'text-danger' : 'text-secondary'}`}>
                      {p.costDriftPct > 0 ? '↑' : ''}{p.costDriftPct.toFixed(0)}%
                    </td>
                    <td className="py-3 text-right">
                      {p.suggestedPrice > p.sellingPrice ? (
                        <span className="inline-flex items-center gap-1 font-medium text-accent">
                          {formatCurrency(p.suggestedPrice)} <ArrowRight className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="text-success">OK</span>
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
