import { cn } from '@/lib/utils'

export function Card({ hover, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn('rounded-2xl border border-border bg-surface shadow-card', hover && 'lift', className)}
      {...props}
    />
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-primary">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-secondary">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
