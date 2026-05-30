import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2, Wallet } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useExpenses, useCreateExpense, useDeleteExpense, EXPENSE_CATEGORIES } from '@/hooks/useExpenses'
import { formatCurrency } from '@/lib/calculations'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

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
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Form */}
      <Card className="p-5 lg:col-span-1">
        <CardHeader title="Catat Biaya Operasional" subtitle="Catat pengeluaran rutin bisnis Anda." />
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Kategori</label>
            <Select
              value={category}
              onValueChange={setCategory}
              options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Jumlah (Rp)</label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0"
              className="h-11 w-full px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Tanggal</label>
            <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="h-11 w-full px-3 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Catatan (opsional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="cth. Bayar listrik bulan ini"
              className="h-11 w-full px-3 text-sm"
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Menyimpan…' : 'Simpan Biaya'}
          </Button>
        </form>
      </Card>

      {/* Summary + list */}
      <div className="space-y-5 lg:col-span-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-ink p-5 text-white shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-80">Biaya Bulan Ini</p>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                <Wallet className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(monthTotal)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <p className="text-sm text-secondary">Total Tercatat</p>
            <p className="mt-2 text-2xl font-bold text-primary">{formatCurrency(total)}</p>
            <p className="mt-1 text-xs text-secondary">{list.length} transaksi</p>
          </div>
        </div>

        <Card className="p-5">
          <CardHeader title="Riwayat Biaya" />
          {list.length === 0 ? (
            <p className="mt-6 text-sm text-secondary">Belum ada biaya tercatat. Mulai catat pengeluaran pertama Anda.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-secondary">
                    <th className="pb-2 font-medium">Kategori</th>
                    <th className="pb-2 font-medium">Catatan</th>
                    <th className="pb-2 font-medium">Tanggal</th>
                    <th className="pb-2 text-right font-medium">Jumlah</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {list.map((e) => (
                    <tr key={e.id} className="border-t border-border">
                      <td className="py-2.5 font-medium text-primary">{e.category}</td>
                      <td className="py-2.5 text-secondary">{e.description ?? '-'}</td>
                      <td className="py-2.5 text-secondary">{String(e.expense_date).slice(0, 10)}</td>
                      <td className="py-2.5 text-right font-semibold text-primary">{formatCurrency(Number(e.amount))}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={async () => {
                            try {
                              await deleteExpense(e.id)
                              toast.success('Biaya dihapus')
                            } catch {
                              toast.error('Gagal menghapus')
                            }
                          }}
                          className="text-secondary hover:text-danger"
                          aria-label="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
