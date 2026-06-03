import { Icon, type IconName } from './Icon'
import { cn } from '@/lib/utils'

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; icon?: IconName }[]
  className?: string
}) {
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1', className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors',
              active ? 'bg-ink text-white' : 'text-secondary hover:text-ink',
            )}
          >
            {o.icon && <Icon name={o.icon} size={14} />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Cari...',
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <Icon name="search" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-sm text-ink placeholder:text-tertiary"
      />
    </div>
  )
}

export function Avatar({
  name,
  size = 32,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')
  const colors = ['bg-lavender text-grape', 'bg-pink text-pink-strong', 'bg-yellow text-yellow-strong', 'bg-blue text-blue-strong', 'bg-mint text-mint-strong']
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold', colors[hash], className)}
    >
      {initials || '?'}
    </div>
  )
}
