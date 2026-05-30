import { NavLink, Link } from 'react-router-dom'
import { Search, Bell, CircleAlert, ChevronDown, Croissant } from 'lucide-react'
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
    <header className="flex h-20 items-center justify-between gap-4 px-4 lg:px-6">
      {/* Brand */}
      <Link to="/app" className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
          <Croissant className="h-5 w-5 text-white" />
        </span>
        <span className="text-lg font-bold text-ink">Batchly</span>
      </Link>

      {/* Center pill nav */}
      <nav className="hidden items-center gap-1 lg:flex">
        {nav.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive ? 'bg-ink text-white' : 'text-secondary hover:text-ink'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Right */}
      <div className="flex items-center gap-2">
        <div className="hidden items-center rounded-full border border-border bg-surface lg:flex">
          <button className="flex h-9 w-9 items-center justify-center text-secondary hover:text-ink"><Search className="h-4 w-4" /></button>
          <button className="flex h-9 w-9 items-center justify-center text-secondary hover:text-ink"><Bell className="h-4 w-4" /></button>
          <button className="flex h-9 w-9 items-center justify-center text-secondary hover:text-ink"><CircleAlert className="h-4 w-4" /></button>
        </div>
        <Link to="/app/settings" className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
            {(organization?.name ?? 'B').charAt(0).toUpperCase()}
          </span>
          <span className="hidden text-sm font-medium text-ink sm:block">{organization?.name ?? 'Batchly'}</span>
          <ChevronDown className="h-4 w-4 text-secondary" />
        </Link>
      </div>
    </header>
  )
}
