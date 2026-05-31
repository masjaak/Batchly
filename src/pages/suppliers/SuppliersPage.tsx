import { Link } from 'react-router-dom'
import { useSuppliers } from '@/hooks/useSuppliers'
import { useAuth } from '@/hooks/useAuth'
import { useCreateSupplier } from '@/hooks/useSuppliers'
import { useState } from 'react'
import { toast } from 'sonner'
import { Truck } from 'lucide-react'
import { EmptyState, PageHeader } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export default function SuppliersPage() {
  const { data: suppliers, isLoading } = useSuppliers()
  const { organization } = useAuth()
  const { mutateAsync: createSupplier } = useCreateSupplier()
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
    <div className="space-y-4">
      <PageHeader
        title="Pemasok"
        subtitle="Kelola pemasok dan riwayat harga bahan."
        action={!showForm ? <Button size="sm" onClick={() => setShowForm(true)}>+ Pemasok</Button> : undefined}
      />

      {showForm && (
        <form onSubmit={handleAdd} className="space-y-3 rounded-xl border border-border bg-surface p-4">
          <input
            placeholder="Nama Pemasok*"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <input
            placeholder="Kontak Person"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <input
            placeholder="No. Telepon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 h-12 rounded-xl bg-ink text-sm font-medium text-white">
              Simpan
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="h-12 rounded-xl border border-border bg-surface px-6 text-sm font-medium text-secondary">
              Batal
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-muted border border-border" />
          ))}
        </div>
      ) : !suppliers || suppliers.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Belum ada pemasok"
          description="Tambahkan pemasok untuk melacak riwayat harga bahan dan mempercepat pencatatan stok masuk."
        />
      ) : (
        <div className="space-y-2">
          {suppliers.map((sup) => (
            <Link
              key={sup.id}
              to={`/app/suppliers/${sup.id}`}
              className="block rounded-xl border border-border bg-surface p-4"
            >
              <p className="text-sm font-medium text-primary">{sup.name}</p>
              {(sup.contact_person || sup.phone) && (
                <p className="mt-0.5 text-xs text-secondary">
                  {sup.contact_person && `${sup.contact_person}`}
                  {sup.contact_person && sup.phone && ' — '}
                  {sup.phone && `${sup.phone}`}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
