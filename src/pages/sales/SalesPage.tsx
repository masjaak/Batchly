import { useState } from 'react'
import { useSales, useCreateSale, useDeleteSale } from '@/hooks/useSales'
import { useProducts } from '@/hooks/useProducts'
import { useAuth } from '@/hooks/useAuth'
import { calculateRecipeCost, calculateSaleProfit, getTopProducts, formatCurrency } from '@/lib/calculations'
import { exportCSV, downloadCSV } from '@/lib/export'
import { toast } from 'sonner'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { PageHeader } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { StatCard } from '@/components/ui/StatCard'
import { cn } from '@/lib/utils'

export default function SalesPage() {
  const { organization } = useAuth()
  const { data: sales } = useSales()
  const { data: products } = useProducts()
  const { mutateAsync: createSale, isPending } = useCreateSale()
  const { mutateAsync: deleteSale } = useDeleteSale()

  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization || !productId || !quantity || !unitPrice) return
    try {
      await createSale({
        organization_id: organization.id,
        product_id: productId,
        quantity: Number(quantity),
        unit_price: Number(unitPrice),
        sale_date: new Date().toISOString().split('T')[0],
      })
      toast.success('Penjualan tercatat')
      setProductId('')
      setQuantity('')
      setUnitPrice('')
    } catch {
      toast.error('Gagal mencatat penjualan')
    }
  }

  const totalRevenue = sales?.reduce((sum: number, s: any) => sum + s.quantity * s.unit_price, 0) ?? 0
  const totalQty = sales?.reduce((sum: number, s: any) => sum + Number(s.quantity ?? 0), 0) ?? 0
  const orderCount = sales?.length ?? 0

  const handleExport = () => {
    if (!sales) return
    const headers = ['Tanggal', 'Produk', 'Jumlah', 'Harga Satuan', 'Pendapatan']
    const rows = sales.map((s: any) => [
      s.sale_date,
      s.product?.name ?? '',
      String(s.quantity),
      String(s.unit_price),
      String(s.quantity * s.unit_price),
    ])
    const csv = exportCSV(headers, rows)
    downloadCSV(csv, `${organization?.slug ?? 'sales'}-penjualan-${new Date().toISOString().split('T')[0]}.csv`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Keuangan"
        title="Penjualan"
        subtitle="Catat penjualan dan pantau margin per transaksi."
        action={
          <Button variant="secondary" onClick={handleExport}>
            <Icon name="arrow-down" size={14} /> Ekspor CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Total Pendapatan" value={formatCurrency(totalRevenue)} icon="wallet" tone="pink" />
        <StatCard label="Unit Terjual" value={totalQty.toLocaleString('id-ID')} icon="cart" tone="lavender" />
        <StatCard label="Jumlah Transaksi" value={String(orderCount)} icon="receipt" tone="mint" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <CardHeader title="Catat Penjualan" subtitle="Tambahkan transaksi penjualan baru." />
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary">Produk</label>
              <Select
                value={productId}
                onValueChange={(v) => {
                  setProductId(v)
                  const p = products?.find((pr: any) => pr.id === v)
                  if (p) setUnitPrice(String(p.default_price))
                }}
                placeholder="Pilih produk..."
                options={(products ?? []).map((p: any) => ({ value: p.id, label: p.name }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-secondary">Jumlah</label>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="h-10 w-full px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-secondary">Harga (Rp)</label>
                <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required className="h-10 w-full px-3 text-sm" />
              </div>
            </div>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Menyimpan...' : 'Simpan Penjualan'}
            </Button>
          </form>
        </Card>

        <div className="space-y-5 lg:col-span-2">
          {sales && sales.length > 0 && products && (() => {
            const top = getTopProducts(sales as any[], products as any[], 5)
            return (
              <Card className="p-5">
                <CardHeader title="Produk Terlaris" subtitle="5 produk dengan revenue tertinggi" />
                <div className="mt-4 space-y-2">
                  {top.map((p, i) => (
                    <div key={p.productId} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
                      <span className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold tnum',
                        i === 0 ? 'bg-ink text-white' : 'bg-surface-muted text-secondary',
                      )}>{i + 1}</span>
                      <span className="flex-1 truncate text-sm font-medium text-ink">{p.name}</span>
                      <span className="text-sm font-semibold text-ink tnum">{formatCurrency(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })()}

          {sales && sales.length > 0 && (
            <Card className="p-5">
              <CardHeader title="Riwayat Penjualan" subtitle={`${sales.length} transaksi`} />
              <div className="mt-4 space-y-2">
                {sales.map((sale: any) => {
                  const cost = sale.product?.recipe
                    ? calculateRecipeCost(sale.product.recipe, sale.product.recipe.recipe_items ?? [])
                    : { perUnitHpp: 0 }
                  const profit = calculateSaleProfit(sale.unit_price, sale.quantity, cost.perUnitHpp)
                  return (
                    <div key={sale.id} className="group flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-muted">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink text-pink-strong">
                        <Icon name="cart" size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{sale.product?.name}</p>
                        <p className="text-xs text-secondary tnum">
                          {sale.quantity} × {formatCurrency(sale.unit_price)} · {String(sale.sale_date).slice(0, 10)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink tnum">{formatCurrency(profit.revenue)}</p>
                        <p className={cn('text-xs tnum', profit.grossProfit >= 0 ? 'text-mint-strong' : 'text-pink-strong')}>
                          {profit.grossProfit >= 0 ? '+' : ''}{formatCurrency(profit.grossProfit)}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          if (!window.confirm('Hapus transaksi penjualan ini?')) return
                          try {
                            await deleteSale(sale.id)
                            toast.success('Penjualan dihapus')
                          } catch {
                            toast.error('Gagal menghapus penjualan')
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
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
