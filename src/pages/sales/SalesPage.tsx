import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSales, useCreateSale } from '@/hooks/useSales'
import { useProducts } from '@/hooks/useProducts'
import { useAuth } from '@/hooks/useAuth'
import { calculateRecipeCost, calculateSaleProfit } from '@/lib/calculations'
import { exportCSV, downloadCSV } from '@/lib/export'
import { toast } from 'sonner'

export default function SalesPage() {
  const navigate = useNavigate()
  const { organization } = useAuth()
  const { data: sales } = useSales()
  const { data: products } = useProducts()
  const { mutateAsync: createSale, isPending } = useCreateSale()

  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')

  const selectedProduct = products?.find((p: any) => p.id === productId)

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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-medium text-primary">Catat Penjualan</h2>

        <select
          value={productId}
          onChange={(e) => {
            setProductId(e.target.value)
            const p = products?.find((pr: any) => pr.id === e.target.value)
            if (p) setUnitPrice(String(p.default_price))
          }}
          required
          className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
        >
          <option value="">Pilih produk...</option>
          {products?.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Jumlah"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            min="1"
            className="h-12 flex-1 rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
          />
          <input
            type="number"
            placeholder="Harga"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            required
            className="h-12 flex-1 rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-lg bg-primary text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? 'Menyimpan...' : 'Simpan Penjualan'}
        </button>
      </form>

      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-secondary">Total Pendapatan</span>
          <span className="text-lg font-semibold text-primary">Rp {totalRevenue.toLocaleString('id-ID')}</span>
        </div>
        <button type="button" onClick={handleExport} className="mt-2 text-xs font-medium text-primary underline">
          Ekspor CSV
        </button>
      </div>

      {sales && sales.length > 0 && (
        <div className="space-y-2">
          {sales.map((sale: any) => {
            const cost = sale.product?.recipe
              ? calculateRecipeCost(sale.product.recipe, sale.product.recipe.recipe_items ?? [])
              : { perUnitHpp: 0 }
            const profit = calculateSaleProfit(sale.unit_price, sale.quantity, cost.perUnitHpp)
            return (
              <div key={sale.id} className="rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">{sale.product?.name}</p>
                    <p className="text-xs text-secondary">{sale.quantity} × Rp {sale.unit_price.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">Rp {profit.revenue.toLocaleString('id-ID')}</p>
                    <p className={`text-xs ${profit.grossProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                      {profit.grossProfit >= 0 ? '+' : ''}Rp {profit.grossProfit.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <p className="mt-1 text-xs text-secondary">{sale.sale_date}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
