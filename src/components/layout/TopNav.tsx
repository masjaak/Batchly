import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Search, Bell, CircleAlert, ChevronDown, Croissant } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useReorderSuggestions } from '@/hooks/useReorderSuggestions'

const nav = [
  { to: '/app', label: 'Overview', end: true },
  { to: '/app/margin-guard', label: 'Margin Guard' },
  { to: '/app/inventory', label: 'Stok' },
  { to: '/app/production', label: 'Produksi' },
  { to: '/app/recipes', label: 'Resep' },
  { to: '/app/products', label: 'Produk' },
  { to: '/app/sales', label: 'Penjualan' },
  { to: '/app/expenses', label: 'Biaya' },
]

const QUICK = [
  { label: 'Dashboard', to: '/app' },
  { label: 'Margin Guard', to: '/app/margin-guard' },
  { label: 'Catat Penjualan', to: '/app/sales' },
  { label: 'Catat Biaya', to: '/app/expenses' },
  { label: 'Stok Masuk', to: '/app/inventory/stock-in' },
  { label: 'Buat Resep', to: '/app/recipes/new' },
  { label: 'Pengaturan', to: '/app/settings' },
]

export default function TopNav() {
  const { organization } = useAuth()
  const { data: lowStock } = useReorderSuggestions()
  const navigate = useNavigate()
  const [panel, setPanel] = useState<null | 'search' | 'bell' | 'info'>(null)
  const [q, setQ] = useState('')

  const alerts = lowStock ?? []
  const filtered = QUICK.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()))

  const toggle = (p: 'search' | 'bell' | 'info') => setPanel(panel === p ? null : p)

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 bg-shell px-4 lg:px-6">
      <Link to="/app" className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
          <Croissant className="h-5 w-5 text-white" />
        </span>
        <span className="text-lg font-bold text-ink">Batchly</span>
      </Link>

      <nav className="hidden items-center gap-1 lg:flex">
        {nav.map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-ink text-white' : 'text-secondary hover:text-ink'}`}>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <div className="relative hidden items-center rounded-full border border-border bg-surface lg:flex">
          <button onClick={() => toggle('search')} className="flex h-9 w-9 items-center justify-center text-secondary hover:text-ink"><Search className="h-4 w-4" /></button>
          <button onClick={() => toggle('bell')} className="relative flex h-9 w-9 items-center justify-center text-secondary hover:text-ink">
            <Bell className="h-4 w-4" />
            {alerts.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />}
          </button>
          <button onClick={() => toggle('info')} className="flex h-9 w-9 items-center justify-center text-secondary hover:text-ink"><CircleAlert className="h-4 w-4" /></button>

          {panel && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setPanel(null)} />
              <div className="absolute right-0 top-11 z-20 w-80 rounded-2xl border border-border bg-surface p-2 shadow-card">
                {panel === 'search' && (
                  <div>
                    <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari menu atau aksi…"
                      className="mb-1 h-10 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-accent" />
                    <div className="max-h-64 overflow-y-auto">
                      {filtered.length === 0 ? <p className="px-3 py-3 text-sm text-secondary">Tidak ada hasil</p> :
                        filtered.map((i) => (
                          <button key={i.to} onClick={() => { navigate(i.to); setPanel(null); setQ('') }}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-surface-muted">{i.label}</button>
                        ))}
                    </div>
                  </div>
                )}
                {panel === 'bell' && (
                  <div>
                    <p className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-secondary">Notifikasi</p>
                    {alerts.length === 0 ? <p className="px-3 py-3 text-sm text-secondary">Tidak ada peringatan. Stok aman 🎉</p> :
                      alerts.slice(0, 6).map((a) => (
                        <button key={a.ingredientId} onClick={() => { navigate(`/app/inventory/${a.ingredientId}`); setPanel(null) }}
                          className="block w-full rounded-lg px-3 py-2 text-left hover:bg-surface-muted">
                          <span className="text-sm font-medium text-ink">{a.name}</span>
                          <span className="block text-xs text-warning">Stok menipis: {a.currentStock} {a.unit}</span>
                        </button>
                      ))}
                  </div>
                )}
                {panel === 'info' && (
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-ink">Bantuan</p>
                    <p className="mt-1 text-xs text-secondary">Batchly bantu hitung HPP, margin, dan keuntungan bisnis F&B Anda.</p>
                    <Link to="/app/margin-guard" onClick={() => setPanel(null)} className="mt-2 inline-block text-xs font-medium text-accent">Pelajari Margin Guard →</Link>
                  </div>
                )}
              </div>
            </>
          )}
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
