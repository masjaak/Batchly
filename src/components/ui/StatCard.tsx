import { cn } from '@/lib/utils'
import { Icon, type IconName } from './Icon'

export type StatTone = 'plain' | 'pink' | 'lavender' | 'yellow' | 'mint' | 'blue' | 'dark'

const toneStyles: Record<StatTone, { iconBg: string; iconColor: string }> = {
  plain: { iconBg: 'bg-surface-muted', iconColor: 'text-ink' },
  pink: { iconBg: 'bg-pink', iconColor: 'text-pink-strong' },
  lavender: { iconBg: 'bg-lavender', iconColor: 'text-grape' },
  yellow: { iconBg: 'bg-yellow', iconColor: 'text-yellow-strong' },
  mint: { iconBg: 'bg-mint', iconColor: 'text-mint-strong' },
  blue: { iconBg: 'bg-blue', iconColor: 'text-blue-strong' },
  dark: { iconBg: 'bg-white/10', iconColor: 'text-white' },
}

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  tone = 'plain',
  className,
}: {
  label: string
  value: string
  delta?: number
  deltaLabel?: string
  icon?: IconName
  tone?: StatTone
  className?: string
}) {
  const up = (delta ?? 0) >= 0
  const dark = tone === 'dark'
  const styles = toneStyles[tone]

  return (
    <div
      className={cn(
        'rounded-2xl border p-5',
        dark ? 'border-ink bg-ink text-white' : 'border-border bg-surface text-ink',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={cn('text-sm font-medium', dark ? 'text-white/70' : 'text-secondary')}>{label}</p>
        {icon && (
          <span
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl',
              styles.iconBg,
              styles.iconColor,
            )}
          >
            <Icon name={icon} size={18} />
          </span>
        )}
      </div>
      <p className="mt-4 text-[28px] font-semibold leading-none tracking-tight tnum">{value}</p>
      {delta !== undefined && (
        <div className={cn('mt-3 flex items-center gap-1.5 text-xs', dark ? 'text-white/70' : 'text-secondary')}>
          <span
            className={cn(
              'inline-flex h-5 items-center gap-0.5 rounded-full px-1.5 text-[11px] font-semibold tnum',
              up ? (dark ? 'bg-white/15 text-white' : 'bg-mint text-mint-strong') : (dark ? 'bg-white/15 text-white' : 'bg-yellow text-yellow-strong'),
            )}
          >
            <Icon name={up ? 'arrow-up' : 'arrow-down'} size={10} strokeWidth={2.5} />
            {Math.abs(delta).toFixed(0)}%
          </span>
          {deltaLabel && <span>{deltaLabel}</span>}
        </div>
      )}
    </div>
  )
}

export function Badge({
  status,
  children,
  className,
}: {
  status?: 'success' | 'warning' | 'danger' | 'neutral' | 'pink' | 'lavender' | 'yellow' | 'mint'
  children: React.ReactNode
  className?: string
}) {
  const styles: Record<string, string> = {
    success: 'bg-mint text-mint-strong',
    warning: 'bg-yellow text-yellow-strong',
    danger: 'bg-pink text-pink-strong',
    neutral: 'bg-surface-muted text-secondary',
    pink: 'bg-pink text-pink-strong',
    lavender: 'bg-lavender text-grape',
    yellow: 'bg-yellow text-yellow-strong',
    mint: 'bg-mint text-mint-strong',
  }
  const tone = styles[status ?? 'neutral']
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', tone, className)}>
      {children}
    </span>
  )
}
