import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  tone = 'plain',
}: {
  label: string
  value: string
  delta?: number
  deltaLabel?: string
  icon?: React.ReactNode // accepted for back-compat; ignored (no icons)
  tone?: 'plain' | 'dark' | 'highlight' | 'berry' | 'grape' | 'mint'
}) {
  // Only two surfaces remain: dark (solid ink) or plain (bordered). All the old
  // color tones collapse to plain — emphasis comes from one dark card per view.
  const dark = tone === 'dark'
  const up = (delta ?? 0) >= 0

  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        dark ? 'border-ink bg-ink text-white' : 'border-border bg-surface text-ink',
      )}
    >
      <p className={cn('text-sm', dark ? 'opacity-80' : 'text-secondary')}>{label}</p>
      <p className="mt-3 text-2xl font-semibold tnum">{value}</p>
      {delta !== undefined && (
        <p className={cn('mt-1 text-xs', dark ? 'opacity-80' : 'text-secondary')}>
          <span className="font-medium tnum">{up ? '+' : '−'}{Math.abs(delta).toFixed(0)}%</span>{' '}
          {deltaLabel}
        </p>
      )}
    </div>
  )
}

export function Badge({
  status,
  children,
}: {
  status?: 'success' | 'warning' | 'danger' | 'neutral'
  children: React.ReactNode
}) {
  // Monochrome: danger/success carry weight (semibold); meaning is in the text.
  const strong = status === 'danger' || status === 'success'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs',
        strong ? 'font-semibold text-ink' : 'font-medium text-secondary',
      )}
    >
      <i className={cn('h-1.5 w-1.5 rounded-full', strong ? 'bg-ink' : 'bg-secondary')} />
      {children}
    </span>
  )
}
