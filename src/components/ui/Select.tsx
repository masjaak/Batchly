import * as RS from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Pilih...',
  className,
  required,
}: {
  value: string
  onValueChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  required?: boolean
}) {
  return (
    <RS.Root value={value || undefined} onValueChange={onValueChange} required={required}>
      <RS.Trigger
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none transition-colors data-[placeholder]:text-secondary focus:border-accent focus:ring-2 focus:ring-accent/20',
          className,
        )}
      >
        <RS.Value placeholder={placeholder} />
        <RS.Icon>
          <ChevronDown className="h-4 w-4 text-secondary" />
        </RS.Icon>
      </RS.Trigger>
      <RS.Portal>
        <RS.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-72 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border bg-surface shadow-card"
        >
          <RS.Viewport className="p-1">
            {options.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-secondary">Belum ada data</div>
            ) : (
              options.map((o) => (
                <RS.Item
                  key={o.value}
                  value={o.value}
                  className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm text-ink outline-none data-[highlighted]:bg-surface-muted data-[state=checked]:font-medium"
                >
                  <RS.ItemText>{o.label}</RS.ItemText>
                  <RS.ItemIndicator>
                    <Check className="h-4 w-4 text-accent" />
                  </RS.ItemIndicator>
                </RS.Item>
              ))
            )}
          </RS.Viewport>
        </RS.Content>
      </RS.Portal>
    </RS.Root>
  )
}
