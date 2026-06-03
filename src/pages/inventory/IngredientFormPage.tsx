import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useIngredients, useCreateIngredient, useUpdateIngredient } from '@/hooks/useIngredients'
import { useIngredientCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useIngredientCategories'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Select } from '@/components/ui/Select'

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-secondary">Nama Bahan</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Contoh: Tepung Terigu"
          className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-secondary">Kategori (opsional)</label>
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
              className="h-10 flex-1 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <button type="button" onClick={handleAddCategory} className="h-10 rounded-xl bg-ink px-4 text-sm font-medium text-white">Simpan</button>
            <button type="button" onClick={() => setAddingCategory(false)} className="h-10 rounded-xl border border-border px-3 text-sm text-secondary">Batal</button>
          </div>
        ) : (
          <div className="mt-1.5 flex items-center gap-3">
            <button type="button" onClick={() => setAddingCategory(true)} className="text-xs font-medium text-accent">+ Kategori baru</button>
            {categories && categories.length > 0 && (
              <details className="text-xs text-secondary">
                <summary className="cursor-pointer">Kelola ({categories.length})</summary>
                <ul className="mt-2 space-y-1">
                  {categories.map((cat: any) => (
                    <li key={cat.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-2.5 py-1.5">
                      <span className="truncate text-primary">{cat.name}</span>
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
        <label className="mb-1 block text-sm font-medium text-secondary">Satuan</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="unitType"
              checked={unitType === 'curated'}
              onChange={() => setUnitType('curated')}
            />
            Pilihan satuan
          </label>
          {unitType === 'curated' && (
            <Select
              value={curatedUnit}
              onValueChange={setCuratedUnit}
              options={CURATED_UNITS.map((u) => ({ value: u, label: u }))}
            />
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="unitType"
              checked={unitType === 'custom'}
              onChange={() => setUnitType('custom')}
            />
            Satuan kustom
          </label>
          {unitType === 'custom' && (
            <input
              type="text"
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value)}
              placeholder="Contoh: bungkus, ikat, pack"
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          )}
        </div>
        {unitType === 'custom' && (
          <p className="mt-1 text-xs text-secondary">Satuan kustom akan ditandai (kustom) di daftar</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-secondary">Stok Minimal</label>
        <input
          type="number"
          min="0"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <p className="mt-1 text-xs text-secondary">Peringatan stok menipis jika stok di bawah nilai ini</p>
      </div>

      <button
        type="submit"
        className="h-11 w-full rounded-xl bg-ink text-base font-medium text-white"
      >
        {isEditing ? 'Simpan Perubahan' : 'Tambah Bahan'}
      </button>
    </form>
  )
}
