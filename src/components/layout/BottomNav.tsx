import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/app', label: 'Beranda', end: true },
  { to: '/app/inventory', label: 'Stok' },
  { to: '/app/production', label: 'Produksi' },
  { to: '/app/sales', label: 'Jual' },
  { to: '/app/expenses', label: 'Biaya' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-center justify-around border-t border-border bg-surface pb-safe">
      {tabs.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center justify-center px-3 text-xs font-medium ${
              isActive ? 'text-ink' : 'text-secondary'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
