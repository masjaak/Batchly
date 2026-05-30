import { Link } from 'react-router-dom'
import { useSuppliers } from '@/hooks/useSuppliers'
import { useAuth } from '@/hooks/useAuth'
import { useCreateSupplier } from '@/hooks/useSuppliers'
import { useState } from 'react'
import { toast } from 'sonner'

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
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="h-12 w-full rounded-lg bg-primary text-sm font-medium text-white"
        >
          Tambah Pemasok
        </button>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="space-y-3 rounded-xl border border-border bg-surface p-4">
          <input
            placeholder="Nama Pemasok*"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
          />
          <input
            placeholder="Kontak Person"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
          />
          <input
            placeholder="No. Telepon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 h-12 rounded-lg bg-primary text-sm font-medium text-white">
              Simpan
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="h-12 rounded-lg border border-border bg-surface px-6 text-sm font-medium text-secondary">
              Batal
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : !suppliers || suppliers.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-secondary">Belum ada pemasok</p>
        </div>
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
