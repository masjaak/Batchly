import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import WorkspaceSwitcher from './WorkspaceSwitcher'

const groups: { label: string; items: { to: string; label: string; end?: boolean }[] }[] = [
  {
    label: 'Ringkasan',
    items: [
      { to: '/app', label: 'Dashboard', end: true },
      { to: '/app/margin-guard', label: 'Margin Guard' },
    ],
  },
  {
    label: 'Operasional',
    items: [
      { to: '/app/inventory', label: 'Stok Bahan' },
      { to: '/app/suppliers', label: 'Pemasok' },
      { to: '/app/recipes', label: 'Resep' },
      { to: '/app/products', label: 'Produk' },
      { to: '/app/production', label: 'Produksi' },
    ],
  },
  {
    label: 'Keuangan',
    items: [
      { to: '/app/sales', label: 'Penjualan' },
      { to: '/app/expenses', label: 'Biaya' },
    ],
  },
]

export default function Sidebar() {
  const { user, organization } = useAuth()

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-shell">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-sm font-semibold text-white">B</span>
        <span className="text-base font-semibold text-ink">Batchly</span>
      </div>

      {/* Workspace switcher */}
      <div className="px-3 pb-2">
        <WorkspaceSwitcher />
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {groups.map((g) => (
          <div key={g.label} className="mb-4">
            <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-secondary">{g.label}</p>
            <div className="space-y-0.5">
              {g.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  className={({ isActive }) =>
                    `block rounded-lg px-2.5 py-2 text-sm transition-colors ${
                      isActive ? 'bg-ink font-medium text-white' : 'text-secondary hover:bg-surface-muted hover:text-ink'
                    }`
                  }
                >
                  {it.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Account */}
      <Link to="/app/settings" className="flex items-center gap-2 border-t border-border px-4 py-3 hover:bg-surface-muted">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-xs font-semibold text-ink">
          {(organization?.name ?? 'B').charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">Pengaturan</span>
          <span className="block truncate text-[11px] text-secondary">{user?.email ?? ''}</span>
        </span>
      </Link>
    </aside>
  )
}
