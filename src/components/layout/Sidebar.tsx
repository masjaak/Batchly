import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import { Icon, type IconName } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

const groups: {
  label: string
  items: { to: string; label: string; end?: boolean; icon: IconName }[]
}[] = [
  {
    label: 'Ringkasan',
    items: [
      { to: '/app', label: 'Dashboard', end: true, icon: 'dashboard' },
      { to: '/app/margin-guard', label: 'Margin Guard', icon: 'shield' },
    ],
  },
  {
    label: 'Operasional',
    items: [
      { to: '/app/inventory', label: 'Stok Bahan', icon: 'box' },
      { to: '/app/suppliers', label: 'Pemasok', icon: 'users' },
      { to: '/app/recipes', label: 'Resep', icon: 'chef' },
      { to: '/app/products', label: 'Produk', icon: 'tag' },
      { to: '/app/production', label: 'Produksi', icon: 'factory' },
    ],
  },
  {
    label: 'Keuangan',
    items: [
      { to: '/app/sales', label: 'Penjualan', icon: 'cart' },
      { to: '/app/expenses', label: 'Biaya', icon: 'receipt' },
    ],
  },
]

const itemColors: IconName[] = ['dashboard', 'shield', 'box', 'users', 'chef', 'tag', 'factory', 'cart', 'receipt']
const palettes: { bg: string; text: string }[] = [
  { bg: 'bg-lavender', text: 'text-grape' },
  { bg: 'bg-pink', text: 'text-pink-strong' },
  { bg: 'bg-yellow', text: 'text-yellow-strong' },
  { bg: 'bg-mint', text: 'text-mint-strong' },
  { bg: 'bg-blue', text: 'text-blue-strong' },
  { bg: 'bg-purple', text: 'text-purple-strong' },
]

export default function Sidebar() {
  const { user, organization } = useAuth()

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-shell">
      {/* Brand */}
      <Link to="/app" className="flex h-[72px] items-center gap-2.5 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-base font-semibold text-white shadow-card">
          B
        </span>
        <span className="text-lg font-semibold tracking-tight text-ink">Batchly</span>
      </Link>

      {/* Workspace switcher */}
      <div className="px-3 pb-3">
        <WorkspaceSwitcher />
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {groups.map((g) => (
          <div key={g.label} className="mb-5">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">
              {g.label}
            </p>
            <div className="space-y-1">
              {g.items.map((it) => {
                const colorIdx = itemColors.indexOf(it.icon) % palettes.length
                return (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.end}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                        isActive
                          ? 'bg-lavender font-semibold text-ink'
                          : 'text-secondary hover:bg-surface-muted hover:text-ink',
                      )
                    }
                  >
                    {({ isActive }) => {
                      const palette = palettes[colorIdx]
                      return (
                        <>
                          <span
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                              isActive ? `${palette.bg} ${palette.text}` : 'bg-surface text-secondary group-hover:text-ink',
                            )}
                          >
                            <Icon name={it.icon} size={16} />
                          </span>
                          <span>{it.label}</span>
                        </>
                      )
                    }}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Account */}
      <Link
        to="/app/settings"
        className="m-3 flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-3 transition-colors hover:bg-surface-muted"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lavender text-sm font-semibold text-grape">
          {(organization?.name ?? 'B').charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">Pengaturan</span>
          <span className="block truncate text-[11px] text-secondary">{user?.email ?? ''}</span>
        </span>
        <Icon name="chevron-right" size={14} className="text-secondary" />
      </Link>
    </aside>
  )
}
