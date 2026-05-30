import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { useProductVariants, useCreateProductVariant, useDeleteProductVariant } from '@/hooks/useProductVariants'
import { calculateRecipeCost, formatCurrency } from '@/lib/calculations'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: products } = useProducts()
  const { data: variants } = useProductVariants(id!)
  const { mutateAsync: createVariant } = useCreateProductVariant()
  const { mutateAsync: deleteVariant } = useDeleteProductVariant()

  const product = products?.find((p: any) => p.id === id)

  const [showForm, setShowForm] = useState(false)
  const [vName, setVName] = useState('')
  const [vPackaging, setVPackaging] = useState('')
  const [vPrice, setVPrice] = useState('')

  if (!product) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-secondary">Produk tidak ditemukan</p>
        <Link to="/app/products" className="mt-4 inline-block text-sm font-medium text-primary underline">Kembali</Link>
      </div>
    )
  }

  const cost = product.recipe
    ? calculateRecipeCost(product.recipe, product.recipe.recipe_items ?? [])
    : { perUnitHpp: 0, totalHpp: 0, margin: 0, productionCost: 0, overheadCost: 0, packagingCost: 0 }

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vName || !vPrice) return
    try {
      await createVariant({
        product_id: id!,
        name: vName,
        packaging_cost: Number(vPackaging) || 0,
        default_price: Number(vPrice),
      })
      toast.success('Varian ditambahkan')
      setVName('')
      setVPackaging('')
      setVPrice('')
      setShowForm(false)
    } catch {
      toast.error('Gagal menambah varian')
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-4">
        <h1 className="text-sm font-medium text-primary">{product.name}</h1>
        <p className="text-xs text-secondary">{product.sku ?? 'Tanpa SKU'}</p>
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Harga Jual</span>
            <span className="font-semibold text-primary">{formatCurrency(product.default_price)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">HPP Dasar</span>
            <span className="font-medium">{formatCurrency(cost.perUnitHpp)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Margin</span>
            <span className={`font-semibold ${cost.margin >= 30 ? 'text-success' : cost.margin >= 10 ? 'text-warning' : 'text-danger'}`}>
              {cost.margin.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-primary">Varian</h2>
          <button onClick={() => setShowForm(!showForm)} className="text-xs font-medium text-primary underline">
            {showForm ? 'Batal' : '+ Varian'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddVariant} className="mb-4 space-y-3">
            <input
              type="text"
              placeholder="Nama varian"
              value={vName}
              onChange={(e) => setVName(e.target.value)}
              required
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Biaya kemasan"
                value={vPackaging}
                onChange={(e) => setVPackaging(e.target.value)}
                className="h-10 flex-1 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
              />
              <input
                type="number"
                placeholder="Harga jual"
                value={vPrice}
                onChange={(e) => setVPrice(e.target.value)}
                required
                className="h-10 flex-1 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <button type="submit" className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-white">
              Simpan Varian
            </button>
          </form>
        )}

        {!variants || variants.length === 0 ? (
          <p className="text-sm text-secondary">Belum ada varian. Tambah varian untuk kemasan berbeda.</p>
        ) : (
          <div className="space-y-2">
            {variants.map((v: any) => {
              const vHpp = cost.perUnitHpp + v.packaging_cost
              const vMargin = v.default_price > 0 ? ((v.default_price - vHpp) / v.default_price) * 100 : 0
              return (
                <div key={v.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
                  <div>
                    <p className="text-sm font-medium text-primary">{v.name}</p>
                    <p className="text-xs text-secondary">HPP: {formatCurrency(vHpp)} · {vMargin.toFixed(0)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{formatCurrency(v.default_price)}</p>
                    <button
                      onClick={() => { deleteVariant(v.id); toast.success('Varian dihapus') }}
                      className="text-xs text-danger"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
