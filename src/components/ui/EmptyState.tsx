import { Link } from 'react-router-dom'
import { Button } from './Button'

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaTo,
}: {
  icon?: unknown // accepted for back-compat; ignored (no icons)
  title: string
  description?: string
  ctaLabel?: string
  ctaTo?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
      <p className="text-base font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-secondary">{description}</p>}
      {ctaLabel && ctaTo && (
        <Link to={ctaTo} className="mt-5">
          <Button>{ctaLabel}</Button>
        </Link>
      )}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-secondary">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}
