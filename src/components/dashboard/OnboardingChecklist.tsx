import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'

interface Step {
  done: boolean
  label: string
  desc: string
  to: string
  cta: string
  icon: any
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
    { done: hasIngredients, label: 'Tambah bahan baku', desc: 'Catat bahan & harganya untuk hitung HPP.', to: '/app/inventory/new', cta: 'Tambah Bahan', icon: 'box' },
    { done: hasRecipes, label: 'Buat resep pertama', desc: 'Batchly hitung HPP & margin otomatis.', to: '/app/recipes/new', cta: 'Buat Resep', icon: 'chef' },
    { done: hasSales, label: 'Catat penjualan', desc: 'Lihat laba & produk terlaris langsung.', to: '/app/sales', cta: 'Catat Jual', icon: 'cart' },
  ]
  const doneCount = steps.filter((s) => s.done).length
  const next = steps.find((s) => !s.done)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Selamat datang</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Mulai pakai Batchly</h1>
        <p className="mt-1 text-sm text-secondary">Selesaikan 3 langkah ini agar dashboard hidup dengan data.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {steps.map((s, i) => {
          const isNext = next === s
          return (
            <div
              key={s.label}
              className={`relative flex flex-col rounded-2xl border p-5 transition-colors ${isNext ? 'border-ink bg-surface shadow-card' : 'border-border bg-surface'}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    s.done ? 'bg-mint text-mint-strong' : isNext ? 'bg-lavender text-grape' : 'bg-surface-muted text-secondary'
                  }`}
                >
                  <Icon name={s.icon} size={18} />
                </span>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                    s.done ? 'bg-ink text-white' : isNext ? 'bg-ink text-white' : 'bg-surface-muted text-secondary'
                  }`}
                >
                  {s.done ? '✓' : i + 1}
                </span>
              </div>
              <h3 className={`mt-4 text-base font-semibold ${s.done ? 'text-secondary line-through' : 'text-ink'}`}>
                {s.label}
              </h3>
              {!s.done && <p className="mt-1 text-sm text-secondary">{s.desc}</p>}
              {!s.done && (
                <Link to={s.to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  {s.cta} <Icon name="arrow-right" size={14} />
                </Link>
              )}
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between text-sm">
          <p className="font-medium text-ink">Progress onboarding</p>
          <p className="font-semibold text-ink tnum">{doneCount}/3</p>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${(doneCount / 3) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}
