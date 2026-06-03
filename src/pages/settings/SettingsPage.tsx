import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, FormField } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'

export default function SettingsPage() {
  const { user, organization, signOut } = useAuth()
  const [name, setName] = useState(organization?.name ?? '')
  const [savingOrg, setSavingOrg] = useState(false)

  const handleSaveOrg = async () => {
    if (!organization || !name.trim()) return
    setSavingOrg(true)
    try {
      const { error } = await supabase.from('organizations').update({ name: name.trim() }).eq('id', organization.id)
      if (error) throw error
      toast.success('Nama bisnis diperbarui')
    } catch {
      toast.error('Gagal memperbarui nama bisnis')
    } finally {
      setSavingOrg(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Akun" title="Pengaturan" subtitle="Kelola profil bisnis dan akun Anda." />

      <Card className="flex items-center gap-4 p-6">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lavender text-2xl font-semibold text-grape">
          {(organization?.name ?? 'B').charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-ink">{organization?.name ?? 'Batchly'}</p>
          <p className="text-sm text-secondary">{user?.email ?? 'Belum login'}</p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-[11px] font-semibold text-mint-strong">
            <Icon name="check" size={10} strokeWidth={3} /> Akun Bisnis
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender text-grape">
              <Icon name="factory" size={18} />
            </span>
            <CardHeader title="Profil Bisnis" subtitle="Nama ini tampil di seluruh aplikasi." />
          </div>
          <div className="mt-5 space-y-3">
            <FormField label="Nama Bisnis">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="cth. Roti Bahagia" />
            </FormField>
            <Button onClick={handleSaveOrg} disabled={savingOrg}>
              {savingOrg ? 'Menyimpan…' : 'Simpan Perubahan'}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink text-pink-strong">
              <Icon name="user" size={18} />
            </span>
            <CardHeader title="Akun" subtitle="Informasi login Anda." />
          </div>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-border bg-surface-muted p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-secondary">Email</p>
              <p className="mt-0.5 text-sm font-medium text-ink">{user?.email ?? '-'}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-muted p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-secondary">Versi Aplikasi</p>
              <p className="mt-0.5 text-sm font-medium text-ink">Batchly v2.0.0</p>
            </div>
            <Button variant="secondary" onClick={signOut} className="w-full">
              <Icon name="logout" size={14} /> Keluar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
