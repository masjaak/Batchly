import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReorderSuggestions } from '@/hooks/useReorderSuggestions'
import { Icon } from '@/components/ui/Icon'
import { SearchInput } from '@/components/ui/Controls'

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
  const [panel, setPanel] = useState<null | 'bell'>(null)
  const [q, setQ] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const alerts = lowStock ?? []
  const filtered = QUICK.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()))
  const toggleBell = () => setPanel(panel === 'bell' ? null : 'bell')

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 bg-shell/95 px-4 backdrop-blur lg:px-8">
      <button
        onClick={onMenu}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-ink transition-colors hover:bg-surface-muted lg:hidden"
        aria-label="Buka menu"
      >
        <Icon name="menu" size={18} />
      </button>

      {/* Greeting (visible lg+) */}
      <div className="hidden lg:block">
        <p className="text-xs font-medium uppercase tracking-wider text-secondary">Selamat datang</p>
        <p className="text-sm font-semibold text-ink">Semoga harimu produktif ✨</p>
      </div>

      <div className="flex-1" />

      {/* Search (visible sm+, expanded to input on lg+) */}
      <div className="relative hidden flex-1 max-w-md sm:block">
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Cari menu, produk, bahan..."
        />
        {q && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setQ('')} />
            <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-border bg-surface p-1 shadow-pop">
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-sm text-secondary">Tidak ada hasil</p>
              ) : (
                filtered.map((i) => (
                  <button
                    key={i.to}
                    onClick={() => {
                      navigate(i.to)
                      setQ('')
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-ink hover:bg-surface-muted"
                  >
                    <Icon name="arrow-right" size={14} className="text-secondary" />
                    {i.label}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 sm:flex-none" />

      {/* Mobile search trigger */}
      <button
        onClick={() => setSearchOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-ink transition-colors hover:bg-surface-muted sm:hidden"
        aria-label="Cari"
      >
        <Icon name="search" size={18} />
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={toggleBell}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-ink transition-colors hover:bg-surface-muted"
          aria-label="Notifikasi"
        >
          <Icon name="bell" size={18} />
          {alerts.length > 0 && (
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-strong opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-strong" />
            </span>
          )}
        </button>

        {panel === 'bell' && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setPanel(null)} />
            <div className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-pop">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-ink">Peringatan</p>
                {alerts.length > 0 && (
                  <span className="rounded-full bg-pink px-2 py-0.5 text-[11px] font-semibold text-pink-strong">
                    {alerts.length}
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto p-1">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint text-mint-strong">
                      <Icon name="check" size={18} />
                    </span>
                    <p className="text-sm font-medium text-ink">Stok aman</p>
                    <p className="text-xs text-secondary">Belum ada bahan yang perlu di-restock.</p>
                  </div>
                ) : (
                  alerts.slice(0, 6).map((a) => (
                    <button
                      key={a.ingredientId}
                      onClick={() => {
                        navigate(`/app/inventory/${a.ingredientId}`)
                        setPanel(null)
                      }}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-muted"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow text-yellow-strong">
                        <Icon name="alert" size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{a.name}</span>
                        <span className="block text-xs text-secondary">Stok menipis: {a.currentStock} {a.unit}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
