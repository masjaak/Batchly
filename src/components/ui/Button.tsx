import { cn } from '@/lib/utils'

type Variant = 'primary' | 'lime' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-white hover:bg-ink/90',
  lime: 'bg-highlight text-ink hover:brightness-95',
  outline: 'border border-border bg-surface text-ink hover:bg-surface-muted',
  ghost: 'text-secondary hover:bg-surface-muted hover:text-ink',
  danger: 'bg-danger text-white hover:bg-danger/90',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
}

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
