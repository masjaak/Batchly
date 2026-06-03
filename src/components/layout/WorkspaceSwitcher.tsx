import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

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

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-xl border border-border bg-surface px-2.5 py-2 text-left hover:bg-surface-muted"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-xs font-semibold text-white">{initial}</span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">{organization?.name ?? 'Batchly'}</span>
              <span className="block text-[11px] text-secondary">Ganti usaha</span>
            </span>
            <span className="text-secondary">▾</span>
          </>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setCreating(false) }} />
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-border bg-surface p-1 shadow-card">
            {organizations.map((o) => (
              <button
                key={o.id}
                disabled={busy}
                onClick={() => handleSwitch(o.id)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-surface-muted"
              >
                <span className="truncate">{o.name}</span>
                {o.id === organization?.id && <span className="text-ink">✓</span>}
              </button>
            ))}

            <div className="my-1 border-t border-border" />

            {!creating ? (
              <button
                onClick={() => setCreating(true)}
                className="w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium text-ink hover:bg-surface-muted"
              >
                + Buat usaha baru
              </button>
            ) : (
              <form onSubmit={handleCreate} className="p-1">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama usaha (cth. Pastry)"
                  className="mb-1 h-9 w-full rounded-lg border border-border px-2.5 text-sm outline-none focus:border-ink"
                />
                <button type="submit" disabled={busy} className="h-9 w-full rounded-lg bg-ink text-sm font-medium text-white disabled:opacity-50">
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
