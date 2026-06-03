import { NavLink } from 'react-router-dom'
import { Icon, type IconName } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

const tabs: { to: string; label: string; end?: boolean; icon: IconName }[] = [
  { to: '/app', label: 'Beranda', end: true, icon: 'dashboard' },
  { to: '/app/inventory', label: 'Stok', icon: 'box' },
  { to: '/app/production', label: 'Produksi', icon: 'factory' },
  { to: '/app/sales', label: 'Jual', icon: 'cart' },
  { to: '/app/expenses', label: 'Biaya', icon: 'receipt' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-3 left-3 right-3 z-20 flex h-16 items-center justify-around rounded-2xl border border-border bg-surface px-2 shadow-pop">
      {tabs.map(({ to, label, end, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors',
              isActive ? 'bg-lavender text-ink' : 'text-secondary',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon name={icon} size={18} className={isActive ? 'text-grape' : 'text-secondary'} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
