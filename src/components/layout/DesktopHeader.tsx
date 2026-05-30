import { useLocation } from 'react-router-dom'
import { Search, Settings, HelpCircle } from 'lucide-react'

export default function DesktopHeader() {
  const { pathname } = useLocation()
  const { title, subtitle } = getHeader(pathname)

  return (
    <header className="flex items-center justify-between px-8 pt-6">
      <div>
        <h1 className="text-xl font-bold text-primary">{title}</h1>
        <p className="mt-0.5 text-sm text-secondary">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-72 items-center gap-2 rounded-lg border border-border bg-surface px-3">
          <Search className="h-4 w-4 text-secondary" />
          <input
            placeholder="Cari apa saja…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-secondary"
          />
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-secondary">
          <Settings className="h-4 w-4" />
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-secondary">
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}

function getHeader(path: string): { title: string; subtitle: string } {
  if (path === '/app') return { title: 'Dashboard', subtitle: 'Pantau stok, produksi, dan penjualan dalam satu layar.' }
  if (path.startsWith('/app/inventory')) return { title: 'Stok', subtitle: 'Kelola bahan baku dan stok gudang.' }
  if (path.startsWith('/app/production')) return { title: 'Produksi', subtitle: 'Catat batch produksi dan hasilnya.' }
  if (path.startsWith('/app/recipes')) return { title: 'Resep', subtitle: 'Kelola resep dan hitung HPP.' }
  if (path.startsWith('/app/products')) return { title: 'Produk', subtitle: 'Daftar produk jadi dan variannya.' }
  if (path.startsWith('/app/sales')) return { title: 'Penjualan', subtitle: 'Catat penjualan dan pantau margin.' }
  if (path.startsWith('/app/suppliers')) return { title: 'Pemasok', subtitle: 'Kelola pemasok dan riwayat harga.' }
  if (path.startsWith('/app/settings')) return { title: 'Pengaturan', subtitle: 'Atur preferensi akun bisnis Anda.' }
  return { title: 'Batchly', subtitle: '' }
}
