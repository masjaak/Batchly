import { Link } from 'react-router-dom'
import { useSuppliers, useCreateSupplier, useDeleteSupplier } from '@/hooks/useSuppliers'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { toast } from 'sonner'
import { EmptyState, PageHeader } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'

export default function SuppliersPage() {
  const { data: suppliers, isLoading } = useSuppliers()
  const { organization } = useAuth()
  const { mutateAsync: createSupplier } = useCreateSupplier()
  const { mutateAsync: deleteSupplier } = useDeleteSupplier()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [phone, setPhone] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization) return
    try {
      await createSupplier({
        organization_id: organization.id,
        name,
        contact_person: contact || null,
        phone: phone || null,
      })
      toast.success('Pemasok berhasil ditambahkan')
      setName('')
      setContact('')
      setPhone('')
      setShowForm(false)
    } catch {
      toast.error('Gagal menambahkan pemasok')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operasional"
        title="Pemasok"
        subtitle="Kelola pemasok dan riwayat harga bahan."
        action={!showForm ? (
          <Button onClick={() => setShowForm(true)}>
            <Icon name="plus" size={14} /> Pemasok
          </Button>
        ) : undefined}
      />

      {showForm && (
        <Card className="p-5">
          <h3 className="mb-4 text-base font-semibold text-ink">Tambah Pemasok</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary">Nama Pemasok</label>
              <Input placeholder="cth. Toko Sumber Rezeki" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-secondary">Kontak Person</label>
                <Input placeholder="Pak Budi" value={contact} onChange={(e) => setContact(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-secondary">No. Telepon</label>
                <Input placeholder="0812…" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1"><Icon name="check" size={14} /> Simpan</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-muted border border-border" />
          ))}
        </div>
      ) : !suppliers || suppliers.length === 0 ? (
        <EmptyState
          title="Belum ada pemasok"
          description="Tambahkan pemasok untuk melacak riwayat harga bahan dan mempercepat pencatatan stok masuk."
          action={!showForm ? <Button onClick={() => setShowForm(true)}><Icon name="plus" size={14} /> Tambah Pemasok</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {suppliers.map((sup) => (
            <Link
              key={sup.id}
              to={`/app/suppliers/${sup.id}`}
              className="group relative flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-muted"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue text-blue-strong text-sm font-semibold">
                {sup.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{sup.name}</p>
                {(sup.contact_person || sup.phone) ? (
                  <p className="mt-0.5 truncate text-xs text-secondary tnum">
                    {[sup.contact_person, sup.phone].filter(Boolean).join(' · ')}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-tertiary">Belum ada kontak</p>
                )}
              </div>
              <Icon name="chevron-right" size={14} className="text-secondary" />
              <button
                onClick={async (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!window.confirm(`Hapus pemasok "${sup.name}"?`)) return
                  try {
                    await deleteSupplier({ id: sup.id, hasTransactions: false })
                    toast.success('Pemasok dihapus')
                  } catch {
                    toast.error('Gagal menghapus pemasok')
                  }
                }}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg text-secondary opacity-0 transition-all hover:bg-pink hover:text-pink-strong group-hover:opacity-100"
                aria-label="Hapus"
              >
                <Icon name="trash" size={12} />
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
