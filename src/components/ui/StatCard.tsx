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
  tone?: 'plain' | 'dark' | 'lime'
}) {
  const toneClass =
    tone === 'dark'
      ? 'bg-forest text-white'
      : tone === 'lime'
        ? 'bg-lime text-forest'
        : 'bg-surface text-primary border border-border'

  const up = (delta ?? 0) >= 0
  const deltaColor =
    tone === 'plain'
      ? up
        ? 'text-success'
        : 'text-danger'
      : up
        ? 'text-current'
        : 'text-current opacity-80'

  return (
    <div className={cn('rounded-2xl p-4 shadow-card', toneClass)}>
      <div className="flex items-center justify-between">
        <p className={cn('text-sm', tone === 'plain' ? 'text-secondary' : 'opacity-80')}>{label}</p>
        {icon && (
          <span className={cn('flex h-7 w-7 items-center justify-center rounded-full', tone === 'plain' ? 'bg-surface-muted' : 'bg-white/15')}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {delta !== undefined && (
        <p className={cn('mt-1 flex items-center gap-1 text-xs font-medium', deltaColor)}>
          {up ? '↑' : '↓'} {Math.abs(delta).toFixed(0)}% <span className={cn(tone === 'plain' ? 'text-secondary' : 'opacity-70', 'font-normal')}>{deltaLabel}</span>
        </p>
      )}
    </div>
  )
}

export function Badge({ status, children }: { status?: 'success' | 'warning' | 'danger' | 'neutral'; children: React.ReactNode }) {
  const map = {
    success: 'bg-accent-soft text-accent',
    warning: 'bg-orange-50 text-warning',
    danger: 'bg-red-50 text-danger',
    neutral: 'bg-surface-muted text-secondary',
  }
  const dot = {
    success: 'bg-accent',
    warning: 'bg-warning',
    danger: 'bg-danger',
    neutral: 'bg-secondary',
  }
  const s = status ?? 'neutral'
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', map[s])}>
      <i className={cn('h-1.5 w-1.5 rounded-full', dot[s])} />
      {children}
    </span>
  )
}
