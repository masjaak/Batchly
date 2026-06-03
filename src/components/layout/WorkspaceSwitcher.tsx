import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

// Workspace (usaha) switcher. Lives in the sidebar. Switching the active org
// changes what RLS returns, so we clear the query cache to refetch fresh data.
export default function WorkspaceSwitcher({ collapsed }: { collapsed?: boolean }) {
  const { organization, organizations, switchOrganization, createBusiness } = useAuth()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSwitch = async (id: string) => {
    if (id === organization?.id) { setOpen(false); return }
    setBusy(true)
    const err = await switchOrganization(id)
    setBusy(false)
    if (err) { toast.error(err.message); return }
    qc.clear()
    setOpen(false)
    toast.success('Usaha aktif diganti')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const err = await createBusiness(name)
    setBusy(false)
    if (err) { toast.error(err.message); return }
    qc.clear()
    setName('')
    setCreating(false)
    setOpen(false)
    toast.success('Usaha baru dibuat')
  }

  const initial = (organization?.name ?? 'B').charAt(0).toUpperCase()
  const palette = ['bg-lavender text-grape', 'bg-pink text-pink-strong', 'bg-yellow text-yellow-strong', 'bg-blue text-blue-strong', 'bg-mint text-mint-strong']
  const hash = [...(organization?.name ?? 'B')].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length
  const colors = palette[hash]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-muted',
        )}
      >
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold', colors)}>
          {initial}
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{organization?.name ?? 'Batchly'}</span>
              <span className="block truncate text-[11px] text-secondary">Ganti usaha</span>
            </span>
            <Icon name="chevron-down" size={14} className="text-secondary" />
          </>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setCreating(false) }} />
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-border bg-surface p-1 shadow-pop">
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-secondary">Usaha</p>
            {organizations.map((o) => {
              const isActive = o.id === organization?.id
              return (
                <button
                  key={o.id}
                  disabled={busy}
                  onClick={() => handleSwitch(o.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                    isActive ? 'bg-lavender font-semibold text-ink' : 'text-ink hover:bg-surface-muted',
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold', palette[([...o.name].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length)])}>
                      {o.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate">{o.name}</span>
                  </span>
                  {isActive && <Icon name="check" size={14} className="text-grape" />}
                </button>
              )
            })}

            <div className="my-1 border-t border-border" />

            {!creating ? (
              <button
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-surface-muted"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-muted text-secondary">
                  <Icon name="plus" size={14} />
                </span>
                Buat usaha baru
              </button>
            ) : (
              <form onSubmit={handleCreate} className="space-y-2 p-2">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama usaha (cth. Pastry)"
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
                />
                <button
                  type="submit"
                  disabled={busy || !name.trim()}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-medium text-white transition-colors hover:bg-ink/90 disabled:opacity-50"
                >
                  {busy ? 'Membuat…' : 'Buat & pakai'}
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  )
}
