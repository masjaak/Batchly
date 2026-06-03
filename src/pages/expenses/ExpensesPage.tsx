import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useExpenses, useCreateExpense, useDeleteExpense, EXPENSE_CATEGORIES } from '@/hooks/useExpenses'
import { formatCurrency } from '@/lib/calculations'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { PageHeader } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { StatCard } from '@/components/ui/StatCard'
import { Input } from '@/components/ui/Input'

const CAT_PALETTE = [
  { bg: 'bg-pink', text: 'text-pink-strong' },
  { bg: 'bg-yellow', text: 'text-yellow-strong' },
  { bg: 'bg-blue', text: 'text-blue-strong' },
  { bg: 'bg-mint', text: 'text-mint-strong' },
  { bg: 'bg-lavender', text: 'text-grape' },
  { bg: 'bg-purple', text: 'text-purple-strong' },
]

export default function ExpensesPage() {
  const { organization } = useAuth()
  const { data: expenses } = useExpenses()
  const { mutateAsync: createExpense, isPending } = useCreateExpense()
  const { mutateAsync: deleteExpense } = useDeleteExpense()

  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])

  const list = expenses ?? []
  const now = new Date()
  const monthTotal = list
    .filter((e) => {
      const d = new Date(e.expense_date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, e) => sum + Number(e.amount), 0)
  const total = list.reduce((sum, e) => sum + Number(e.amount), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization || !amount) return
    try {
      await createExpense({
        organization_id: organization.id,
        category,
        description: description.trim() || null,
        amount: Number(amount),
        expense_date: expenseDate,
      })
      toast.success('Biaya tercatat')
      setAmount('')
      setDescription('')
    } catch {
      toast.error('Gagal mencatat biaya')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Keuangan"
        title="Biaya Operasional"
        subtitle="Catat pengeluaran rutin bisnis Anda."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Biaya Bulan Ini" value={formatCurrency(monthTotal)} icon="receipt" tone="pink" />
        <StatCard label="Total Tercatat" value={formatCurrency(total)} icon="wallet" tone="dark" />
        <StatCard label="Jumlah Transaksi" value={String(list.length)} icon="calendar" tone="lavender" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <CardHeader title="Catat Biaya" subtitle="Tambahkan pengeluaran operasional." />
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary">Kategori</label>
              <Select
                value={category}
                onValueChange={setCategory}
                options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary">Jumlah (Rp)</label>
              <Input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary">Tanggal</label>
              <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="h-10 w-full px-3 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary">Catatan (opsional)</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="cth. Bayar listrik bulan ini"
              />
            </div>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Menyimpan…' : 'Simpan Biaya'}
            </Button>
          </form>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <CardHeader title="Riwayat Biaya" subtitle={`${list.length} transaksi`} />
          {list.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-2 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-mint-strong">
                <Icon name="check" size={20} />
              </span>
              <p className="text-sm font-medium text-ink">Belum ada biaya tercatat</p>
              <p className="text-xs text-secondary">Mulai catat pengeluaran pertama Anda di form samping.</p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-secondary">
                    <th className="pb-3 font-semibold">Kategori</th>
                    <th className="pb-3 font-semibold">Catatan</th>
                    <th className="pb-3 font-semibold">Tanggal</th>
                    <th className="pb-3 text-right font-semibold">Jumlah</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody>
                  {list.map((e) => {
                    const palette = CAT_PALETTE[[...e.category].reduce((a, c) => a + c.charCodeAt(0), 0) % CAT_PALETTE.length]
                    return (
                      <tr key={e.id} className="group border-b border-border last:border-0">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${palette.bg} ${palette.text}`}>
                              <Icon name="receipt" size={14} />
                            </span>
                            <span className="font-medium text-ink">{e.category}</span>
                          </div>
                        </td>
                        <td className="py-3 text-secondary">{e.description ?? '—'}</td>
                        <td className="py-3 text-secondary tnum">{String(e.expense_date).slice(0, 10)}</td>
                        <td className="py-3 text-right font-semibold text-ink tnum">{formatCurrency(Number(e.amount))}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={async () => {
                              try {
                                await deleteExpense(e.id)
                                toast.success('Biaya dihapus')
                              } catch {
                                toast.error('Gagal menghapus')
                              }
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-secondary opacity-0 transition-all hover:bg-pink hover:text-pink-strong group-hover:opacity-100 ml-auto"
                            aria-label="Hapus"
                          >
                            <Icon name="trash" size={12} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
