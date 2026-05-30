import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useIngredients, useCreateIngredient, useUpdateIngredient } from '@/hooks/useIngredients'
import { useIngredientCategories } from '@/hooks/useIngredientCategories'
import { toast } from 'sonner'
import { Select } from '@/components/ui/Select'

const CURATED_UNITS = ['g', 'kg', 'ml', 'L', 'pcs', 'sdt', 'sdm', 'cup']

export default function IngredientFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: ingredients } = useIngredients()
  const { data: categories } = useIngredientCategories()
  const { mutateAsync: create } = useCreateIngredient()
  const { mutateAsync: update } = useUpdateIngredient()

  const existing = id ? ingredients?.find((i: any) => i.id === id) : null
  const isEditing = !!existing

  const [name, setName] = useState(existing?.name ?? '')
  const [categoryId, setCategoryId] = useState(existing?.category_id ?? '')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
          className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
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
              className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
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
          className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
        />
        <p className="mt-1 text-xs text-secondary">Peringatan stok menipis jika stok di bawah nilai ini</p>
      </div>

      <button
        type="submit"
        className="h-12 w-full rounded-lg bg-primary text-base font-medium text-white"
      >
        {isEditing ? 'Simpan Perubahan' : 'Tambah Bahan'}
      </button>
    </form>
  )
}
