import { useParams, Link } from 'react-router-dom'
import { useIngredients } from '@/hooks/useIngredients'
import { useIngredientTransactions } from '@/hooks/useInventoryTransactions'

export default function IngredientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: ingredients } = useIngredients()
  const { data: transactions } = useIngredientTransactions(id ?? '')

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

      <div>
        <h2 className="mb-3 text-sm font-medium text-primary">Riwayat Pergerakan</h2>
        {!transactions || transactions.length === 0 ? (
          <p className="text-sm text-secondary">Belum ada pergerakan stok</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center justify-between">
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
                  <span className="text-xs text-secondary">{tx.transaction_date}</span>
                </div>
                {tx.notes && <p className="mt-1 text-xs text-secondary">{tx.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
