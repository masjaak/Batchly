import { useParams, Link, useNavigate } from 'react-router-dom'
import { useIngredients, useDeleteIngredient } from '@/hooks/useIngredients'
import { useIngredientTransactions, useDeleteInventoryTransaction } from '@/hooks/useInventoryTransactions'
import { toast } from 'sonner'

export default function IngredientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: ingredients } = useIngredients()
  const { data: transactions } = useIngredientTransactions(id ?? '')
  const { mutateAsync: deleteIngredient } = useDeleteIngredient()
  const { mutateAsync: deleteTransaction } = useDeleteInventoryTransaction()

  const ingredient = ingredients?.find((i) => i.id === id)

  if (!ingredient) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-secondary">Bahan tidak ditemukan</p>
        <Link to="/app/inventory" className="mt-4 inline-block text-sm font-medium text-primary underline">
          Kembali
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-4">
        <h1 className="text-lg font-semibold">{ingredient.name}</h1>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-secondary">Stok Saat Ini</p>
            <p className={`text-lg font-semibold ${
              ingredient.current_stock <= ingredient.min_stock_level ? 'text-warning' : 'text-primary'
            }`}>
              {ingredient.current_stock} {ingredient.unit}
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary">Harga Terakhir</p>
            <p className="text-lg font-semibold text-primary">
              Rp {ingredient.latest_price.toLocaleString('id-ID')}/{ingredient.unit}
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary">Stok Minimal</p>
            <p className="text-sm font-medium text-primary">{ingredient.min_stock_level} {ingredient.unit}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          to="/app/inventory/stock-in"
          className="flex-1 rounded-xl border border-border bg-surface py-3 text-center text-sm font-medium text-primary"
        >
          Stok Masuk
        </Link>
        <Link
          to="/app/inventory/stock-out"
          className="flex-1 rounded-xl border border-border bg-surface py-3 text-center text-sm font-medium text-primary"
        >
          Stok Keluar
        </Link>
      </div>

      {transactions && transactions.length > 0 && (() => {
        const ins = transactions.filter((t) => t.type === 'in' && (t.unit_price ?? 0) > 0)
        const outs = transactions.filter((t) => t.type === 'out')
        const prices = [...ins].reverse().map((t) => t.unit_price as number)
        const totalUsed = outs.reduce((s, t) => s + Math.abs(t.quantity), 0)
        const firstPrice = prices[0] ?? ingredient.latest_price
        const lastPrice = prices[prices.length - 1] ?? ingredient.latest_price
        const priceChange = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0
        const maxP = Math.max(1, ...prices)
        return (
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-primary">Tren Harga Beli</h2>
              {prices.length >= 2 && (
                <span className={`text-xs font-medium ${priceChange > 0 ? 'text-danger' : priceChange < 0 ? 'text-success' : 'text-secondary'}`}>
                  {priceChange > 0 ? '↑' : priceChange < 0 ? '↓' : ''} {Math.abs(priceChange).toFixed(0)}%
                </span>
              )}
            </div>
            {prices.length >= 2 ? (
              <div className="mt-3 flex h-20 items-end gap-1.5">
                {prices.slice(-12).map((p, i) => (
                  <div key={i} className="flex-1 rounded-t bg-accent/70" style={{ height: `${(p / maxP) * 100}%` }} title={`Rp ${p.toLocaleString('id-ID')}`} />
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-secondary">Butuh ≥2 pembelian untuk lihat tren.</p>
            )}
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-3">
              <div>
                <p className="text-xs text-secondary">Total Terpakai</p>
                <p className="text-sm font-semibold text-primary">{totalUsed} {ingredient.unit}</p>
              </div>
              <div>
                <p className="text-xs text-secondary">Harga Terendah</p>
                <p className="text-sm font-semibold text-primary">Rp {(prices.length ? Math.min(...prices) : ingredient.latest_price).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-xs text-secondary">Harga Tertinggi</p>
                <p className="text-sm font-semibold text-primary">Rp {(prices.length ? Math.max(...prices) : ingredient.latest_price).toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        )
      })()}

      <div>
        <h2 className="mb-3 text-sm font-medium text-primary">Riwayat Pergerakan</h2>
        {!transactions || transactions.length === 0 ? (
          <p className="text-sm text-secondary">Belum ada pergerakan stok</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        tx.type === 'in' ? 'text-success' : 'text-danger'
                      }`}>
                        {tx.type === 'in' ? '+' : ''}{tx.quantity} {ingredient.unit}
                      </span>
                      {tx.supplier && (
                        <span className="text-xs text-secondary">{tx.supplier.name}</span>
                      )}
                    </div>
                    {tx.notes && <p className="mt-1 text-xs text-secondary">{tx.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-secondary">{tx.transaction_date}</span>
                    <button
                      onClick={async () => {
                        if (!window.confirm('Hapus transaksi ini? Stok akan disesuaikan otomatis.')) return
                        try {
                          await deleteTransaction(tx.id)
                          toast.success('Transaksi dihapus')
                        } catch {
                          toast.error('Gagal menghapus transaksi')
                        }
                      }}
                      className="text-xs font-medium text-secondary hover:text-ink"
                      aria-label="Hapus transaksi"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={async () => {
          if (!window.confirm(`Hapus bahan "${ingredient.name}"? Bahan tidak akan muncul di daftar, tapi riwayat transaksi tetap tersimpan.`)) return
          try {
            await deleteIngredient(ingredient.id)
            toast.success('Bahan dihapus')
            navigate('/app/inventory')
          } catch {
            toast.error('Gagal menghapus bahan')
          }
        }}
        className="h-11 w-full rounded-xl border border-border bg-surface text-sm font-medium text-primary"
      >
        Hapus Bahan
      </button>
    </div>
  )
}
