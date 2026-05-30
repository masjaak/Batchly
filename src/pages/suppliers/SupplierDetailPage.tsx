import { useParams, Link } from 'react-router-dom'
import { useSupplier, useSupplierTransactions } from '@/hooks/useSuppliers'

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: supplier, isLoading } = useSupplier(id ?? '')
  const { data: transactions } = useSupplierTransactions(id ?? '')

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-xl bg-surface-muted border border-border" />
  }

  if (!supplier) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-secondary">Pemasok tidak ditemukan</p>
        <Link to="/app/suppliers" className="mt-4 inline-block text-sm font-medium text-primary underline">
          Kembali
        </Link>
      </div>
    )
  }

  const totalSpent = transactions?.reduce(
    (sum, t) => sum + (t.unit_price ?? 0) * Math.abs(t.quantity), 0
  ) ?? 0

  // Group transactions by ingredient for price history
  const byIngredient = new Map<string, { name: string; unit: string; transactions: typeof transactions }>()
  transactions?.forEach((tx) => {
    const ingName = (tx as any).ingredient?.name ?? 'Unknown'
    const ingUnit = (tx as any).ingredient?.unit ?? ''
    if (!byIngredient.has(ingName)) {
      byIngredient.set(ingName, { name: ingName, unit: ingUnit, transactions: [] })
    }
    byIngredient.get(ingName)!.transactions.push(tx)
  })

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-4">
        <h1 className="text-lg font-semibold">{supplier.name}</h1>
        {supplier.contact_person && (
          <p className="mt-1 text-sm text-secondary">Kontak: {supplier.contact_person}</p>
        )}
        {supplier.phone && (
          <p className="text-sm text-secondary">Telp: {supplier.phone}</p>
        )}
        {supplier.email && (
          <p className="text-sm text-secondary">Email: {supplier.email}</p>
        )}
        {supplier.address && (
          <p className="text-sm text-secondary">Alamat: {supplier.address}</p>
        )}
        {supplier.notes && (
          <p className="mt-2 text-sm text-secondary">Catatan: {supplier.notes}</p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-medium text-primary">Ringkasan Pembelian</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-secondary">Total</p>
            <p className="text-sm font-semibold text-primary">Rp {totalSpent.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-xs text-secondary">Transaksi</p>
            <p className="text-sm font-semibold text-primary">{transactions?.length ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-secondary">Terakhir</p>
            <p className="text-sm font-semibold text-primary">{transactions?.[0]?.transaction_date ?? '-'}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-primary">Riwayat Harga per Bahan</h2>
        {byIngredient.size === 0 ? (
          <p className="text-sm text-secondary">Belum ada transaksi</p>
        ) : (
          <div className="space-y-3">
            {Array.from(byIngredient.entries()).map(([name, group]) => {
              const firstPrice = group.transactions[group.transactions.length - 1]?.unit_price ?? 0
              const lastPrice = group.transactions[0]?.unit_price ?? 0
              const trend = lastPrice - firstPrice
              return (
                <div key={name} className="rounded-xl border border-border bg-surface p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary">{name}</p>
                    <p className={`text-xs font-medium ${trend > 0 ? 'text-danger' : trend < 0 ? 'text-success' : 'text-secondary'}`}>
                      {trend !== 0 ? `${trend > 0 ? '+' : ''}Rp ${trend.toLocaleString('id-ID')}` : 'Stabil'}
                    </p>
                  </div>
                  <div className="mt-2 space-y-1">
                    {group.transactions.map((tx) => (
                      <div key={tx.id} className="flex justify-between text-xs">
                        <span className="text-secondary">{tx.transaction_date}</span>
                        <span className="text-primary">Rp {tx.unit_price?.toLocaleString('id-ID')} /{group.unit}</span>
                        <span className="text-secondary">x{Math.abs(tx.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-primary">Riwayat Pembelian</h2>
        {!transactions || transactions.length === 0 ? (
          <p className="text-sm text-secondary">Belum ada transaksi</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {(tx as any).ingredient?.name ?? 'Bahan'}
                    </p>
                    <p className="text-xs text-secondary">
                      {Math.abs(tx.quantity)} {(tx as any).ingredient?.unit ?? ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      Rp {(tx.unit_price ?? 0).toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-secondary">{tx.transaction_date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
