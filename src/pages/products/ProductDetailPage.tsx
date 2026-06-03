import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProducts, useDeleteProduct } from '@/hooks/useProducts'
import { useProductVariants, useCreateProductVariant, useDeleteProductVariant } from '@/hooks/useProductVariants'
import { calculateRecipeCost, formatCurrency } from '@/lib/calculations'
import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { StatCard } from '@/components/ui/StatCard'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: products } = useProducts()
  const { data: variants } = useProductVariants(id!)
  const { mutateAsync: createVariant } = useCreateProductVariant()
  const { mutateAsync: deleteVariant } = useDeleteProductVariant()
  const { mutateAsync: deleteProduct } = useDeleteProduct()

  const product = products?.find((p: any) => p.id === id)

  const [showForm, setShowForm] = useState(false)
  const [vName, setVName] = useState('')
  const [vPackaging, setVPackaging] = useState('')
  const [vPrice, setVPrice] = useState('')

  if (!product) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-secondary">Produk tidak ditemukan</p>
        <Link to="/app/products" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink underline">
          <Icon name="chevron-left" size={14} /> Kembali
        </Link>
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

  const healthy = cost.margin >= 30
  const ok = cost.margin >= 10

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/app/products" className="inline-flex items-center gap-1 text-sm font-semibold text-secondary transition-colors hover:text-ink">
          <Icon name="chevron-left" size={14} /> Kembali ke Produk
        </Link>
        <Button
          variant="secondary"
          onClick={async () => {
            if (!window.confirm(`Hapus produk "${product.name}"?`)) return
            try {
              await deleteProduct(id!)
              toast.success('Produk dihapus')
              navigate('/app/products')
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Gagal menghapus produk')
            }
          }}
        >
          <Icon name="trash" size={14} /> Hapus
        </Button>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary">SKU: {product.sku ?? 'Tanpa SKU'}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{product.name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Harga Jual" value={formatCurrency(product.default_price)} icon="tag" tone="pink" />
        <StatCard label="HPP / unit" value={formatCurrency(cost.perUnitHpp)} icon="wallet" tone="lavender" />
        <StatCard label="Margin" value={`${cost.margin.toFixed(0)}%`} icon={healthy ? 'trending-up' : 'trending-down'} tone={healthy ? 'mint' : ok ? 'yellow' : 'pink'} />
        <StatCard label="Varian" value={String(variants?.length ?? 0)} icon="package" tone="blue" />
      </div>

      {product.recipe?.recipe_items?.length > 0 && (() => {
        const items = product.recipe.recipe_items
        const yield_ = product.recipe.yield_amount || 1
        const rows = items.map((it: any) => ({
          name: it.ingredient?.name ?? 'Bahan',
          perUnit: (it.quantity * it.cost_at_create) / yield_,
          qty: it.quantity,
          unit: it.unit,
        }))
        const overheadPer = (rows.reduce((s: number, r: any) => s + r.perUnit, 0) * (product.recipe.overhead_pct / 100))
        const pkgPer = (product.recipe.packaging_cost || 0) / yield_
        const maxRow = Math.max(...rows.map((r: any) => r.perUnit), overheadPer, pkgPer, 1)
        return (
          <Card className="p-6">
            <CardHeader title={`Rincian HPP per ${product.unit}`} subtitle={`Dari resep "${product.recipe.name}" (hasil ${yield_} ${product.recipe.yield_unit})`} />
            <div className="mt-4 space-y-3">
              {rows.map((r: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-ink">{r.name} <span className="text-secondary">({r.qty} {r.unit})</span></span>
                    <span className="font-semibold text-ink tnum">{formatCurrency(r.perUnit)}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full rounded-full bg-pink-strong" style={{ width: `${(r.perUnit / maxRow) * 100}%` }} />
                  </div>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-2 text-xs">
                <span className="text-secondary">Overhead ({product.recipe.overhead_pct}%)</span>
                <span className="font-medium text-ink tnum">{formatCurrency(overheadPer)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-secondary">Kemasan</span>
                <span className="font-medium text-ink tnum">{formatCurrency(pkgPer)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm">
                <span className="font-semibold text-ink">Total HPP</span>
                <span className="font-semibold text-ink tnum">{formatCurrency(cost.perUnitHpp)}</span>
              </div>
            </div>
          </Card>
        )
      })()}

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue text-blue-strong">
              <Icon name="package" size={18} />
            </span>
            <CardHeader title="Varian" subtitle="Varian kemasan & harga untuk produk ini" />
          </div>
          {!showForm && (
            <Button size="sm" variant="secondary" onClick={() => setShowForm(true)}>
              <Icon name="plus" size={14} /> Varian
            </Button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleAddVariant} className="mt-4 space-y-3 rounded-2xl border border-border bg-surface-muted p-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary">Nama Varian</label>
              <Input value={vName} onChange={(e) => setVName(e.target.value)} placeholder="cth. Toples Kecil" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-secondary">Biaya Kemasan</label>
                <Input type="number" value={vPackaging} onChange={(e) => setVPackaging(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-secondary">Harga Jual</label>
                <Input type="number" value={vPrice} onChange={(e) => setVPrice(e.target.value)} required />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1"><Icon name="check" size={14} /> Simpan</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
            </div>
          </form>
        )}

        {!variants || variants.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border bg-surface-muted px-4 py-6 text-center text-sm text-secondary">
            Belum ada varian. Tambah varian untuk kemasan berbeda.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {variants.map((v: any) => {
              const vHpp = cost.perUnitHpp + v.packaging_cost
              const vMargin = v.default_price > 0 ? ((v.default_price - vHpp) / v.default_price) * 100 : 0
              const vHealthy = vMargin >= 30
              return (
                <div key={v.id} className="group flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-muted">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue text-blue-strong">
                    <Icon name="package" size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{v.name}</p>
                    <p className="text-xs text-secondary tnum">HPP: {formatCurrency(vHpp)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink tnum">{formatCurrency(v.default_price)}</p>
                    <span className={cn(
                      'text-[11px] font-semibold tnum',
                      vHealthy ? 'text-mint-strong' : 'text-pink-strong',
                    )}>
                      {vMargin.toFixed(0)}%
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await deleteVariant(v.id)
                        toast.success('Varian dihapus')
                      } catch {
                        toast.error('Gagal menghapus varian')
                      }
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-secondary opacity-0 transition-all hover:bg-pink hover:text-pink-strong group-hover:opacity-100"
                    aria-label="Hapus"
                  >
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
