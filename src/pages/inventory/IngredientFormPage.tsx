import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useIngredients, useCreateIngredient, useUpdateIngredient } from '@/hooks/useIngredients'
import { useIngredientCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useIngredientCategories'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

const CURATED_UNITS = ['g', 'kg', 'ml', 'L', 'pcs', 'sdt', 'sdm', 'cup']

export default function IngredientFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { organization } = useAuth()
  const { data: ingredients } = useIngredients()
  const { data: categories } = useIngredientCategories()
  const { mutateAsync: create } = useCreateIngredient()
  const { mutateAsync: update } = useUpdateIngredient()
  const { mutateAsync: createCategory } = useCreateCategory()
  const { mutateAsync: deleteCategory } = useDeleteCategory()

  const existing = id ? ingredients?.find((i: any) => i.id === id) : null
  const isEditing = !!existing

  const [name, setName] = useState(existing?.name ?? '')
  const [categoryId, setCategoryId] = useState(existing?.category_id ?? '')
  const [newCategory, setNewCategory] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [unitType, setUnitType] = useState<'curated' | 'custom'>(
    existing && !CURATED_UNITS.includes(existing.unit) ? 'custom' : 'curated'
  )
  const [curatedUnit, setCuratedUnit] = useState(
    existing && CURATED_UNITS.includes(existing.unit) ? existing.unit : 'pcs'
  )
  const [customUnit, setCustomUnit] = useState(
    existing && !CURATED_UNITS.includes(existing.unit) ? existing.unit : ''
  )
  const [minStock, setMinStock] = useState(String(existing?.min_stock_level ?? '0'))

  const unitValue = unitType === 'curated' ? curatedUnit : customUnit

  const handleAddCategory = async () => {
    if (!organization || !newCategory.trim()) return
    try {
      const cat = await createCategory({ organization_id: organization.id, name: newCategory.trim(), sort_order: (categories?.length ?? 0) + 1 })
      setCategoryId(cat.id)
      setNewCategory('')
      setAddingCategory(false)
      toast.success('Kategori ditambahkan')
    } catch {
      toast.error('Gagal menambah kategori')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization) {
      toast.error('Sesi tidak ditemukan. Silakan login ulang.')
      return
    }
    if (!name || !unitValue) {
      toast.error('Nama dan satuan wajib diisi')
      return
    }

    try {
      if (isEditing) {
        await update({
          id,
          name,
          category_id: categoryId || null,
          unit: unitValue,
          min_stock_level: Number(minStock),
        })
        toast.success('Bahan berhasil diperbarui')
        navigate(`/app/inventory/${id}`)
      } else {
        const data = await create({
          organization_id: organization.id,
          name,
          category_id: categoryId || null,
          unit: unitValue,
          min_stock_level: Number(minStock),
        })
        toast.success('Bahan berhasil ditambahkan')
        navigate(`/app/inventory/${data.id}`)
      }
    } catch {
      toast.error(isEditing ? 'Gagal memperbarui bahan' : 'Gagal menambahkan bahan')
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender text-grape">
          <Icon name="box" size={18} />
        </span>
        <CardHeader title={isEditing ? 'Edit Bahan' : 'Tambah Bahan'} subtitle={isEditing ? 'Ubah detail bahan baku.' : 'Tambahkan bahan baru ke inventaris.'} />
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-secondary">Nama Bahan</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="cth. Tepung Terigu"
            className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-secondary">Kategori (opsional)</label>
          <Select
            value={categoryId}
            onValueChange={setCategoryId}
            placeholder="Pilih kategori..."
            options={(categories ?? []).map((cat: any) => ({ value: cat.id, label: cat.name }))}
          />
          {addingCategory ? (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nama kategori baru"
                className="h-10 flex-1 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
              />
              <Button type="button" onClick={handleAddCategory}>Simpan</Button>
              <Button type="button" variant="secondary" onClick={() => setAddingCategory(false)}>Batal</Button>
            </div>
          ) : (
            <div className="mt-1.5 flex items-center gap-3">
              <button type="button" onClick={() => setAddingCategory(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-ink">
                <Icon name="plus" size={12} /> Kategori baru
              </button>
              {categories && categories.length > 0 && (
                <details className="text-xs text-secondary">
                  <summary className="cursor-pointer">Kelola ({categories.length})</summary>
                  <ul className="mt-2 space-y-1">
                    {categories.map((cat: any) => (
                      <li key={cat.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-2.5 py-1.5">
                        <span className="truncate text-ink">{cat.name}</span>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(`Hapus kategori "${cat.name}"?`)) return
                            try {
                              await deleteCategory(cat.id)
                              if (categoryId === cat.id) setCategoryId('')
                              toast.success('Kategori dihapus')
                            } catch {
                              toast.error('Kategori dipakai bahan. Hapus atau pindah kategori di bahan terkait dulu.')
                            }
                          }}
                          className="shrink-0 text-xs font-medium text-secondary hover:text-ink"
                        >
                          Hapus
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-secondary">Satuan</label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 ${unitType === 'curated' ? 'border-ink bg-surface-muted' : 'border-border bg-surface'}`}>
              <input
                type="radio"
                name="unitType"
                checked={unitType === 'curated'}
                onChange={() => setUnitType('curated')}
                className="sr-only"
              />
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lavender text-grape">
                <Icon name="check" size={12} />
              </span>
              <span className="text-sm font-medium text-ink">Standar</span>
            </label>
            <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 ${unitType === 'custom' ? 'border-ink bg-surface-muted' : 'border-border bg-surface'}`}>
              <input
                type="radio"
                name="unitType"
                checked={unitType === 'custom'}
                onChange={() => setUnitType('custom')}
                className="sr-only"
              />
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink text-pink-strong">
                <Icon name="edit" size={12} />
              </span>
              <span className="text-sm font-medium text-ink">Kustom</span>
            </label>
          </div>
          {unitType === 'curated' ? (
            <Select className="mt-2" value={curatedUnit} onValueChange={setCuratedUnit} options={CURATED_UNITS.map((u) => ({ value: u, label: u }))} />
          ) : (
            <input
              type="text"
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value)}
              placeholder="cth. bungkus, ikat, pack"
              className="mt-2 h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
            />
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-secondary">Stok Minimal</label>
          <input
            type="number"
            min="0"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
          />
          <p className="mt-1 text-xs text-secondary">Peringatan stok menipis jika stok di bawah nilai ini</p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">
            {isEditing ? 'Simpan Perubahan' : 'Tambah Bahan'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Batal</Button>
        </div>
      </form>
    </Card>
  )
}
