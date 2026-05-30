import { NavLink, Link } from 'react-router-dom'
import { Search, Bell, Factory } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const nav = [
  { to: '/app', label: 'Overview', end: true },
  { to: '/app/inventory', label: 'Stok' },
  { to: '/app/production', label: 'Produksi' },
  { to: '/app/recipes', label: 'Resep' },
  { to: '/app/products', label: 'Produk' },
  { to: '/app/sales', label: 'Penjualan' },
  { to: '/app/expenses', label: 'Biaya' },
]

export default function TopNav() {
  const { organization } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        {/* Brand */}
        <Link to="/app" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
            <Factory className="h-4 w-4 text-white" />
          </span>
          <span className="text-lg font-bold text-primary">Batchly</span>
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-1 rounded-full bg-surface-muted p-1 lg:flex">
          {nav.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  isActive ? 'bg-primary text-white' : 'text-secondary hover:text-primary'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button className="hidden h-9 w-9 items-center justify-center rounded-full border border-border text-secondary lg:flex">
            <Search className="h-4 w-4" />
          </button>
          <button className="hidden h-9 w-9 items-center justify-center rounded-full border border-border text-secondary lg:flex">
            <Bell className="h-4 w-4" />
          </button>
          <Link to="/app/settings" className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-xs font-semibold text-white">
              {(organization?.name ?? 'B').charAt(0).toUpperCase()}
            </span>
            <span className="hidden text-sm font-medium text-primary sm:block">{organization?.name ?? 'Batchly'}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
