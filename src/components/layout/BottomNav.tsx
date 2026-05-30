import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/app', label: 'Dashboard' },
  { to: '/app/inventory', label: 'Stok' },
  { to: '/app/production', label: 'Produksi' },
  { to: '/app/recipes', label: 'Resep' },
  { to: '/app/sales', label: 'Jual' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex h-16 items-center justify-around border-t border-border bg-surface pb-safe">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/app'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center text-xs font-medium ${
              isActive ? 'text-primary' : 'text-secondary'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
