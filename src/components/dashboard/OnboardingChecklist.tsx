import { Link } from 'react-router-dom'

interface Step {
  done: boolean
  label: string
  desc: string
  to: string
  cta: string
}

export default function OnboardingChecklist({
  hasIngredients,
  hasRecipes,
  hasSales,
}: {
  hasIngredients: boolean
  hasRecipes: boolean
  hasSales: boolean
}) {
  const steps: Step[] = [
    { done: hasIngredients, label: 'Tambah bahan baku', desc: 'Catat bahan & harganya untuk hitung HPP.', to: '/app/inventory/new', cta: 'Tambah Bahan' },
    { done: hasRecipes, label: 'Buat resep pertama', desc: 'Batchly hitung HPP & margin otomatis.', to: '/app/recipes/new', cta: 'Buat Resep' },
    { done: hasSales, label: 'Catat penjualan', desc: 'Lihat laba & produk terlaris langsung.', to: '/app/sales', cta: 'Catat Jual' },
  ]
  const doneCount = steps.filter((s) => s.done).length
  const next = steps.find((s) => !s.done)

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Mulai pakai Batchly</h2>
          <p className="mt-0.5 text-sm text-secondary">Selesaikan 3 langkah ini agar dashboard hidup dengan data.</p>
        </div>
        <span className="text-sm font-semibold text-ink tnum">{doneCount}/3</span>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${(doneCount / 3) * 100}%` }} />
      </div>

      <div className="mt-5 space-y-3">
        {steps.map((s, i) => {
          const isNext = next === s
          return (
            <div key={s.label} className={`flex items-center gap-3 rounded-xl border p-3 ${isNext ? 'border-ink bg-surface-muted' : 'border-border'}`}>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${s.done ? 'bg-ink text-white' : isNext ? 'bg-ink text-white' : 'bg-surface-muted text-secondary'}`}>
                {s.done ? '✓' : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${s.done ? 'text-secondary line-through' : 'text-ink'}`}>{s.label}</p>
                {!s.done && <p className="text-xs text-secondary">{s.desc}</p>}
              </div>
              {!s.done && (
                <Link to={s.to}>
                  <span className="inline-flex items-center rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white">{s.cta} →</span>
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
