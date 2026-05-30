import { useState } from 'react'
import { useSales, useCreateSale } from '@/hooks/useSales'
import { useProducts } from '@/hooks/useProducts'
import { useAuth } from '@/hooks/useAuth'
import { calculateRecipeCost, calculateSaleProfit, getTopProducts, formatCurrency } from '@/lib/calculations'
import { exportCSV, downloadCSV } from '@/lib/export'
import { toast } from 'sonner'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function SalesPage() {
  const { organization } = useAuth()
  const { data: sales } = useSales()
  const { data: products } = useProducts()
  const { mutateAsync: createSale, isPending } = useCreateSale()

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
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Form */}
      <Card className="p-5 lg:col-span-1">
        <CardHeader title="Catat Penjualan" subtitle="Tambahkan transaksi penjualan baru." />
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Produk</label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value)
                const p = products?.find((pr: any) => pr.id === e.target.value)
                if (p) setUnitPrice(String(p.default_price))
              }}
              required
              className="h-11 w-full px-3 text-sm"
            >
              <option value="">Pilih produk...</option>
              {products?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-secondary">Jumlah</label>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="h-11 w-full px-3 text-sm" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-secondary">Harga (Rp)</label>
              <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required className="h-11 w-full px-3 text-sm" />
            </div>
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Menyimpan...' : 'Simpan Penjualan'}
          </Button>
        </form>
      </Card>

      <div className="space-y-5 lg:col-span-2">
        {/* Revenue + export */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-lime p-5 text-forest shadow-card">
            <p className="text-sm font-medium">Total Pendapatan</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-card">
            <p className="text-sm text-secondary">Ekspor data penjualan</p>
            <Button variant="outline" size="sm" onClick={handleExport} className="mt-2 self-start">Ekspor CSV</Button>
          </div>
        </div>

        {/* Top products */}
        {sales && sales.length > 0 && products && (() => {
          const top = getTopProducts(sales as any[], products as any[], 5)
          return (
            <Card className="p-5">
              <CardHeader title="Produk Terlaris" />
              <div className="mt-3 space-y-2">
                {top.map((p, i) => (
                  <div key={p.productId} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-secondary">{i + 1}</span>
                      <span className="text-primary">{p.name}</span>
                    </span>
                    <span className="font-semibold text-primary">{formatCurrency(p.revenue)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )
        })()}

        {/* Sales list */}
        {sales && sales.length > 0 && (
          <Card className="p-5">
            <CardHeader title="Riwayat Penjualan" />
            <div className="mt-3 space-y-2">
              {sales.map((sale: any) => {
                const cost = sale.product?.recipe
                  ? calculateRecipeCost(sale.product.recipe, sale.product.recipe.recipe_items ?? [])
                  : { perUnitHpp: 0 }
                const profit = calculateSaleProfit(sale.unit_price, sale.quantity, cost.perUnitHpp)
                return (
                  <div key={sale.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-primary">{sale.product?.name}</p>
                      <p className="text-xs text-secondary">{sale.quantity} × {formatCurrency(sale.unit_price)} · {String(sale.sale_date).slice(0, 10)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">{formatCurrency(profit.revenue)}</p>
                      <p className={`text-xs ${profit.grossProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                        {profit.grossProfit >= 0 ? '+' : ''}{formatCurrency(profit.grossProfit)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
