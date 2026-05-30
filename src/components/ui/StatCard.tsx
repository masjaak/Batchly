import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  tone = 'plain',
}: {
  label: string
  value: string
  delta?: number
  deltaLabel?: string
  icon?: React.ReactNode
  tone?: 'plain' | 'dark' | 'highlight' | 'berry' | 'grape' | 'mint'
}) {
  const toneClass =
    tone === 'dark'
      ? 'bg-ink text-white'
      : tone === 'highlight'
        ? 'bg-highlight text-ink'
        : tone === 'berry'
          ? 'bg-berry text-white'
          : tone === 'grape'
            ? 'bg-grape text-white'
            : tone === 'mint'
              ? 'bg-mint text-white'
              : 'bg-surface text-ink border border-border'

  const up = (delta ?? 0) >= 0

  return (
    <div className={cn('lift rounded-2xl p-4 shadow-card', toneClass)}>
      <div className="flex items-center justify-between">
        <p className={cn('text-sm', tone === 'plain' ? 'text-secondary' : 'opacity-80')}>{label}</p>
        {icon && (
          <span className={cn('flex h-8 w-8 items-center justify-center rounded-full', tone === 'plain' ? 'bg-surface-muted' : 'bg-white/15')}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      {delta !== undefined && (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5',
              tone === 'plain'
                ? up ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'
                : 'bg-white/15',
            )}
          >
            {up ? '↑' : '↓'} {Math.abs(delta).toFixed(0)}%
          </span>
          <span className={cn(tone === 'plain' ? 'text-secondary' : 'opacity-70', 'font-normal')}>{deltaLabel}</span>
        </p>
      )}
    </div>
  )
}

export function Badge({ status, children }: { status?: 'success' | 'warning' | 'danger' | 'neutral'; children: React.ReactNode }) {
  const map = {
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    neutral: 'text-secondary',
  }
  const dot = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    neutral: 'bg-secondary',
  }
  const s = status ?? 'neutral'
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', map[s])}>
      <i className={cn('h-1.5 w-1.5 rounded-full', dot[s])} />
      {children}
    </span>
  )
}
