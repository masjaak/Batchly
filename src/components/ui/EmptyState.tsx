import { Link } from 'react-router-dom'
import { Button } from './Button'

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaTo,
  action,
}: {
  icon?: unknown
  title: string
  description?: string
  ctaLabel?: string
  ctaTo?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <p className="text-base font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-secondary">{description}</p>}
      {ctaLabel && ctaTo && (
        <Link to={ctaTo} className="mt-5">
          <Button>{ctaLabel}</Button>
        </Link>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
  eyebrow,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  eyebrow?: string
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-secondary">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}
