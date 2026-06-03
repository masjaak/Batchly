import { useParams, Link, useNavigate } from 'react-router-dom'
import { useIngredients, useDeleteIngredient } from '@/hooks/useIngredients'
import { useIngredientTransactions, useDeleteInventoryTransaction } from '@/hooks/useInventoryTransactions'
import { toast } from 'sonner'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { StatCard } from '@/components/ui/StatCard'
import { formatCurrency } from '@/lib/calculations'

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
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-secondary">Bahan tidak ditemukan</p>
        <Link to="/app/inventory" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink underline">
          <Icon name="chevron-left" size={14} /> Kembali
        </Link>
      </div>
    )
  }

  const ins = transactions?.filter((t) => t.type === 'in' && (t.unit_price ?? 0) > 0) ?? []
  const outs = transactions?.filter((t) => t.type === 'out') ?? []
  const prices = [...ins].reverse().map((t) => t.unit_price as number)
  const totalUsed = outs.reduce((s, t) => s + Math.abs(t.quantity), 0)
  const firstPrice = prices[0] ?? ingredient.latest_price
  const lastPrice = prices[prices.length - 1] ?? ingredient.latest_price
  const priceChange = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0
  const maxP = Math.max(1, ...prices)
  const low = ingredient.current_stock <= ingredient.min_stock_level

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/app/inventory" className="inline-flex items-center gap-1 text-sm font-semibold text-secondary transition-colors hover:text-ink">
          <Icon name="chevron-left" size={14} /> Kembali ke Stok
        </Link>
        <Button
          variant="secondary"
          onClick={async () => {
            if (!window.confirm(`Hapus bahan "${ingredient.name}"?`)) return
            try {
              await deleteIngredient(ingredient.id)
              toast.success('Bahan dihapus')
              navigate('/app/inventory')
            } catch {
              toast.error('Gagal menghapus bahan')
            }
          }}
        >
          <Icon name="trash" size={14} /> Hapus
        </Button>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary">{ingredient.category?.name ?? 'Bahan'}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{ingredient.name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Stok Saat Ini" value={`${ingredient.current_stock} ${ingredient.unit}`} icon="box" tone={low ? 'yellow' : 'mint'} />
        <StatCard label="Harga Terakhir" value={`${formatCurrency(ingredient.latest_price)}/${ingredient.unit}`} icon="tag" tone="pink" />
        <StatCard label="Stok Minimal" value={`${ingredient.min_stock_level} ${ingredient.unit}`} icon="shield" tone="lavender" />
        <StatCard label="Total Terpakai" value={`${totalUsed.toFixed(1)} ${ingredient.unit}`} icon="trending-down" tone="blue" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/app/inventory/stock-in" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface text-sm font-semibold text-ink transition-colors hover:bg-surface-muted">
          <Icon name="arrow-down" size={14} /> Stok Masuk
        </Link>
        <Link to="/app/inventory/stock-out" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface text-sm font-semibold text-ink transition-colors hover:bg-surface-muted">
          <Icon name="arrow-up" size={14} /> Stok Keluar
        </Link>
      </div>

      {transactions && transactions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <CardHeader title="Tren Harga Beli" subtitle="12 pembelian terakhir" />
            {prices.length >= 2 && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tnum ${priceChange > 0 ? 'bg-pink text-pink-strong' : priceChange < 0 ? 'bg-mint text-mint-strong' : 'bg-surface-muted text-secondary'}`}>
                <Icon name={priceChange > 0 ? 'trending-up' : 'trending-down'} size={11} />
                {Math.abs(priceChange).toFixed(0)}%
              </span>
            )}
          </div>
          {prices.length >= 2 ? (
            <div className="mt-5 flex h-24 items-end gap-1.5">
              {prices.slice(-12).map((p, i) => (
                <div key={i} className="flex-1 rounded-t-md bg-pink" style={{ height: `${(p / maxP) * 100}%`, minHeight: 4 }} title={`Rp ${p.toLocaleString('id-ID')}`} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-secondary">Butuh ≥2 pembelian untuk lihat tren.</p>
          )}

          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-secondary">Terendah</p>
              <p className="mt-1 text-sm font-semibold text-ink tnum">{formatCurrency(prices.length ? Math.min(...prices) : ingredient.latest_price)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-secondary">Tertinggi</p>
              <p className="mt-1 text-sm font-semibold text-ink tnum">{formatCurrency(prices.length ? Math.max(...prices) : ingredient.latest_price)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-secondary">Rata-rata</p>
              <p className="mt-1 text-sm font-semibold text-ink tnum">{formatCurrency(prices.length ? prices.reduce((s, p) => s + p, 0) / prices.length : ingredient.latest_price)}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <CardHeader title="Riwayat Pergerakan" subtitle={`${transactions?.length ?? 0} transaksi`} />
        {!transactions || transactions.length === 0 ? (
          <p className="mt-6 text-sm text-secondary">Belum ada pergerakan stok</p>
        ) : (
          <div className="mt-4 space-y-2">
            {transactions.map((tx) => {
              const isIn = tx.type === 'in'
              return (
                <div key={tx.id} className="group flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-muted">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isIn ? 'bg-mint text-mint-strong' : 'bg-pink text-pink-strong'}`}>
                    <Icon name={isIn ? 'arrow-down' : 'arrow-up'} size={14} strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold tnum ${isIn ? 'text-mint-strong' : 'text-pink-strong'}`}>
                      {isIn ? '+' : ''}{tx.quantity} {ingredient.unit}
                    </p>
                    {tx.supplier && <p className="text-xs text-secondary">{tx.supplier.name}</p>}
                    {tx.notes && <p className="text-xs text-secondary">{tx.notes}</p>}
                  </div>
                  <div className="text-right">
                    {tx.unit_price != null && <p className="text-sm font-semibold text-ink tnum">{formatCurrency(tx.unit_price)}</p>}
                    <p className="text-xs text-secondary tnum">{tx.transaction_date}</p>
                  </div>
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
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-secondary opacity-0 transition-all hover:bg-pink hover:text-pink-strong group-hover:opacity-100"
                    aria-label="Hapus transaksi"
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
