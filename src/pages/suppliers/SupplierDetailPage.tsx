import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSupplier, useSupplierTransactions, useDeleteSupplier } from '@/hooks/useSuppliers'
import { toast } from 'sonner'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { StatCard } from '@/components/ui/StatCard'
import { formatCurrency } from '@/lib/calculations'

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: supplier, isLoading } = useSupplier(id ?? '')
  const { data: transactions } = useSupplierTransactions(id ?? '')
  const { mutateAsync: deleteSupplier } = useDeleteSupplier()

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-2xl bg-surface-muted border border-border" />
  }

  if (!supplier) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-secondary">Pemasok tidak ditemukan</p>
        <Link to="/app/suppliers" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink underline">
          <Icon name="chevron-left" size={14} /> Kembali
        </Link>
      </div>
    )
  }

  const totalSpent = transactions?.reduce((sum, t) => sum + (t.unit_price ?? 0) * Math.abs(t.quantity), 0) ?? 0
  const lastTx = transactions?.[0]

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
      <div className="flex items-center justify-between">
        <Link to="/app/suppliers" className="inline-flex items-center gap-1 text-sm font-semibold text-secondary transition-colors hover:text-ink">
          <Icon name="chevron-left" size={14} /> Kembali ke Pemasok
        </Link>
        <Button
          variant="secondary"
          onClick={async () => {
            const hasTx = (transactions?.length ?? 0) > 0
            const msg = hasTx
              ? `Hapus pemasok "${supplier.name}"? Pemasok punya ${transactions?.length} transaksi. Riwayat tetap tersimpan, hanya disembunyikan dari daftar.`
              : `Hapus pemasok "${supplier.name}"?`
            if (!window.confirm(msg)) return
            try {
              await deleteSupplier({ id: supplier!.id, hasTransactions: hasTx })
              toast.success('Pemasok dihapus')
              navigate('/app/suppliers')
            } catch {
              toast.error('Gagal menghapus pemasok')
            }
          }}
        >
          <Icon name="trash" size={14} /> Hapus
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue text-2xl font-semibold text-blue-strong">
            {supplier.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{supplier.name}</h1>
            <div className="mt-1 flex flex-wrap gap-2 text-sm text-secondary">
              {supplier.contact_person && <span>{supplier.contact_person}</span>}
              {supplier.contact_person && supplier.phone && <span>·</span>}
              {supplier.phone && <span className="tnum">{supplier.phone}</span>}
              {!supplier.contact_person && !supplier.phone && <span className="text-tertiary">Belum ada kontak</span>}
            </div>
          </div>
        </div>

        {(supplier.email || supplier.address || supplier.notes) && (
          <div className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
            {supplier.email && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-secondary">Email</p>
                <p className="mt-1 text-sm font-medium text-ink">{supplier.email}</p>
              </div>
            )}
            {supplier.address && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-secondary">Alamat</p>
                <p className="mt-1 text-sm font-medium text-ink">{supplier.address}</p>
              </div>
            )}
            {supplier.notes && (
              <div className="sm:col-span-2">
                <p className="text-[11px] font-medium uppercase tracking-wider text-secondary">Catatan</p>
                <p className="mt-1 text-sm text-ink">{supplier.notes}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Belanja" value={formatCurrency(totalSpent)} icon="wallet" tone="pink" />
        <StatCard label="Jumlah Transaksi" value={String(transactions?.length ?? 0)} icon="receipt" tone="lavender" />
        <StatCard label="Terakhir" value={lastTx?.transaction_date ?? '-'} icon="clock" tone="blue" />
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow text-yellow-strong">
            <Icon name="trending-up" size={18} />
          </span>
          <CardHeader title="Riwayat Harga per Bahan" subtitle="Tren harga yang kamu beli dari pemasok ini" />
        </div>
        {byIngredient.size === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border bg-surface-muted px-4 py-6 text-center text-sm text-secondary">
            Belum ada transaksi
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {Array.from(byIngredient.entries()).map(([name, group]) => {
              const firstPrice = group.transactions[group.transactions.length - 1]?.unit_price ?? 0
              const lastPrice = group.transactions[0]?.unit_price ?? 0
              const trend = lastPrice - firstPrice
              return (
                <div key={name} className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink">{name}</p>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tnum ${
                      trend > 0 ? 'bg-pink text-pink-strong' : trend < 0 ? 'bg-mint text-mint-strong' : 'bg-surface-muted text-secondary'
                    }`}>
                      <Icon name={trend > 0 ? 'trending-up' : trend < 0 ? 'trending-down' : 'check'} size={11} />
                      {trend !== 0 ? `${trend > 0 ? '+' : '−'}${formatCurrency(Math.abs(trend))}` : 'Stabil'}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1">
                    {group.transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between rounded-lg border border-border bg-surface-muted px-3 py-1.5 text-xs tnum">
                        <span className="text-secondary">{tx.transaction_date}</span>
                        <span className="font-medium text-ink">{formatCurrency(tx.unit_price ?? 0)}/{group.unit}</span>
                        <span className="text-secondary">× {Math.abs(tx.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
