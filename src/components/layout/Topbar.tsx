import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReorderSuggestions } from '@/hooks/useReorderSuggestions'

const QUICK = [
  { label: 'Dashboard', to: '/app' },
  { label: 'Margin Guard', to: '/app/margin-guard' },
  { label: 'Catat Penjualan', to: '/app/sales' },
  { label: 'Catat Biaya', to: '/app/expenses' },
  { label: 'Stok Masuk', to: '/app/inventory/stock-in' },
  { label: 'Buat Resep', to: '/app/recipes/new' },
  { label: 'Pengaturan', to: '/app/settings' },
]

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const { data: lowStock } = useReorderSuggestions()
  const navigate = useNavigate()
  const [panel, setPanel] = useState<null | 'search' | 'bell'>(null)
  const [q, setQ] = useState('')

  const alerts = lowStock ?? []
  const filtered = QUICK.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()))
  const toggle = (p: 'search' | 'bell') => setPanel(panel === p ? null : p)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-shell px-4 lg:px-8">
      <button onClick={onMenu} className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-ink lg:hidden">Menu</button>

      <div className="flex-1" />

      <div className="relative flex items-center gap-1">
        <button onClick={() => toggle('search')} className="rounded-lg px-3 py-1.5 text-sm text-secondary hover:bg-surface-muted hover:text-ink">Cari</button>
        <button onClick={() => toggle('bell')} className="relative rounded-lg px-3 py-1.5 text-sm text-secondary hover:bg-surface-muted hover:text-ink">
          Notif
          {alerts.length > 0 && <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-ink" />}
        </button>

        {panel && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setPanel(null)} />
            <div className="absolute right-0 top-11 z-20 w-80 rounded-xl border border-border bg-surface p-2 shadow-card">
              {panel === 'search' && (
                <div>
                  <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari menu atau aksi…"
                    className="mb-1 h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-ink" />
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
                  {alerts.length === 0 ? <p className="px-3 py-3 text-sm text-secondary">Tidak ada peringatan. Stok aman.</p> :
                    alerts.slice(0, 6).map((a) => (
                      <button key={a.ingredientId} onClick={() => { navigate(`/app/inventory/${a.ingredientId}`); setPanel(null) }}
                        className="block w-full rounded-lg px-3 py-2 text-left hover:bg-surface-muted">
                        <span className="text-sm font-medium text-ink">{a.name}</span>
                        <span className="block text-xs text-secondary">Stok menipis: {a.currentStock} {a.unit}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  )
}
