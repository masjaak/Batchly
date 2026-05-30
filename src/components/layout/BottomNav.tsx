import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, Factory, ShoppingCart, Wallet } from 'lucide-react'

const tabs = [
  { to: '/app', label: 'Beranda', icon: LayoutDashboard, end: true },
  { to: '/app/inventory', label: 'Stok', icon: Package },
  { to: '/app/production', label: 'Produksi', icon: Factory },
  { to: '/app/sales', label: 'Jual', icon: ShoppingCart },
  { to: '/app/expenses', label: 'Biaya', icon: Wallet },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-center justify-around border-t border-border bg-surface pb-safe">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${
              isActive ? 'text-accent' : 'text-secondary'
            }`
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
