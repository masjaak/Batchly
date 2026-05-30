import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Factory,
  BookOpen,
  Boxes,
  ShoppingCart,
  Truck,
  Settings,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const mainMenu = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/inventory', label: 'Stok', icon: Package },
  { to: '/app/production', label: 'Produksi', icon: Factory },
  { to: '/app/recipes', label: 'Resep', icon: BookOpen },
  { to: '/app/products', label: 'Produk', icon: Boxes },
  { to: '/app/sales', label: 'Penjualan', icon: ShoppingCart },
  { to: '/app/suppliers', label: 'Pemasok', icon: Truck },
]

export default function Sidebar() {
  const { organization } = useAuth()

  return (
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 flex-col border-r border-border bg-surface px-4 py-5">
      <div className="flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9be066]">
          <Factory className="h-4 w-4 text-[#14301f]" />
        </div>
        <span className="text-lg font-bold text-primary">Batchly</span>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-border p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-sm font-semibold text-primary">
          {(organization?.name ?? 'B').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-primary">{organization?.name ?? 'Batchly'}</p>
          <p className="text-xs text-secondary">Akun Bisnis</p>
        </div>
      </div>

      <p className="mt-6 px-2 text-xs font-medium uppercase tracking-wide text-secondary">Menu Utama</p>
      <nav className="mt-2 space-y-1">
        {mainMenu.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-background text-primary' : 'text-secondary hover:bg-background hover:text-primary'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <p className="mt-6 px-2 text-xs font-medium uppercase tracking-wide text-secondary">Preferensi</p>
      <nav className="mt-2 space-y-1">
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
              isActive ? 'bg-background text-primary' : 'text-secondary hover:bg-background hover:text-primary'
            }`
          }
        >
          <Settings className="h-4 w-4" />
          Pengaturan
        </NavLink>
      </nav>

      <div className="mt-auto rounded-xl bg-[#14301f] p-4 text-center">
        <Sparkles className="mx-auto h-5 w-5 text-[#9be066]" />
        <p className="mt-2 text-sm font-semibold text-white">Batchly Pro</p>
        <p className="mt-1 text-xs text-white/70">Buka insight & laporan lengkap.</p>
        <button className="mt-3 w-full rounded-lg bg-[#9be066] py-2 text-sm font-medium text-[#14301f]">
          Upgrade
        </button>
      </div>
    </aside>
  )
}
