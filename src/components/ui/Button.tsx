import { cn } from '@/lib/utils'

// All buttons share ONE height (40px). Role is shown by style, not size/color.
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-white hover:bg-ink/90',
  secondary: 'border border-ink bg-transparent text-ink hover:bg-surface-muted',
  ghost: 'text-secondary hover:bg-surface-muted hover:text-ink',
  danger: 'border border-ink bg-transparent font-semibold text-ink hover:bg-surface-muted',
}

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className, ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex h-10 min-w-[88px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
