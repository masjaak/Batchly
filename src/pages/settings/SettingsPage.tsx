import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, organization, signOut } = useAuth()

  const [name, setName] = useState(organization?.name ?? '')
  const [savingOrg, setSavingOrg] = useState(false)
  const [savingUser, setSavingUser] = useState(false)

  const handleSaveOrg = async () => {
    if (!organization || !name.trim()) return
    setSavingOrg(true)
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name: name.trim() })
        .eq('id', organization.id)
      if (error) throw error
      toast.success('Nama bisnis diperbarui')
    } catch {
      toast.error('Gagal memperbarui nama bisnis')
    } finally {
      setSavingOrg(false)
    }
  }

  const handleSaveUser = async () => {
    if (!user) return
    setSavingUser(true)
    try {
      const { error } = await supabase.auth.updateUser({ data: { display_name: name } })
      if (error) throw error
      toast.success('Profil diperbarui')
    } catch {
      toast.error('Gagal memperbarui profil')
    } finally {
      setSavingUser(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-medium text-primary">Bisnis</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama bisnis"
          className="mb-3 h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <button
          onClick={handleSaveOrg}
          disabled={savingOrg}
          className="h-10 rounded-xl bg-ink px-6 text-sm font-medium text-white disabled:opacity-50"
        >
          {savingOrg ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-medium text-primary">Akun</h2>
        <p className="mb-1 text-sm text-secondary">Email</p>
        <p className="mb-3 text-sm font-medium text-primary">{user?.email}</p>
        <button
          onClick={handleSaveUser}
          disabled={savingUser}
          className="h-10 rounded-xl border border-border bg-surface px-6 text-sm font-medium text-primary disabled:opacity-50"
        >
          Perbarui Profil
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-medium text-primary">Tentang</h2>
        <p className="text-sm text-secondary">Batchly v2.0.0</p>
        <p className="mt-1 text-xs text-secondary">Operational workspace for F&B micro-businesses</p>
      </div>

      <button
        onClick={signOut}
        className="h-11 w-full rounded-xl border border-danger text-sm font-medium text-danger"
      >
        Keluar
      </button>
    </div>
  )
}
