import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, FormField } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/EmptyState'
import { Building2, LogOut } from 'lucide-react'

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
    <div className="space-y-5">
      <PageHeader title="Pengaturan" subtitle="Kelola profil bisnis dan akun Anda." />

      {/* Profile header */}
      <Card className="flex items-center gap-4 p-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink text-2xl font-bold text-white">
          {(organization?.name ?? 'B').charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="text-lg font-bold text-ink">{organization?.name ?? 'Batchly'}</p>
          <p className="text-sm text-secondary">{user?.email ?? 'Belum login'}</p>
          <span className="mt-1 inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">Akun Bisnis</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Business */}
        <Card className="p-5">
          <CardHeader title="Profil Bisnis" subtitle="Nama ini tampil di seluruh aplikasi." />
          <div className="mt-4 space-y-3">
            <FormField label="Nama Bisnis">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="cth. Roti Bahagia" />
            </FormField>
            <Button onClick={handleSaveOrg} disabled={savingOrg}>
              <Building2 className="h-4 w-4" /> {savingOrg ? 'Menyimpan…' : 'Simpan Perubahan'}
            </Button>
          </div>
        </Card>

        {/* Account */}
        <Card className="p-5">
          <CardHeader title="Akun" subtitle="Informasi login Anda." />
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-surface-muted p-3">
              <p className="text-xs text-secondary">Email</p>
              <p className="text-sm font-medium text-ink">{user?.email ?? '-'}</p>
            </div>
            <div className="rounded-xl bg-surface-muted p-3">
              <p className="text-xs text-secondary">Versi Aplikasi</p>
              <p className="text-sm font-medium text-ink">Batchly v2.0.0</p>
            </div>
            <Button variant="outline" onClick={signOut} className="w-full border-danger/30 text-danger hover:bg-red-50">
              <LogOut className="h-4 w-4" /> Keluar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
