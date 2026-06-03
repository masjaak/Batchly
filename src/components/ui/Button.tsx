import { cn } from '@/lib/utils'

// All buttons share ONE height. Role is shown by style, not size.
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-white hover:bg-ink/90 active:bg-ink/95 shadow-card',
  dark: 'bg-ink text-white hover:bg-ink/90 active:bg-ink/95 shadow-card',
  secondary: 'border border-border bg-surface text-ink hover:bg-surface-muted',
  ghost: 'text-secondary hover:bg-surface-muted hover:text-ink',
  danger: 'border border-border bg-surface font-semibold text-danger hover:bg-pink/60',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
}

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
}

export function Button({ variant = 'primary', size = 'md', block, className, ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        sizes[size],
        variants[variant],
        block && 'w-full',
        className,
      )}
      {...props}
    />
  )
}

export function IconButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
