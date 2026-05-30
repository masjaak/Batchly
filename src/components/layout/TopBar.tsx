import { useLocation, useNavigate } from 'react-router-dom'

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()

  const pageTitle = getPageTitle(location.pathname)

  return (
    <header className="flex h-14 items-center border-b border-border bg-surface px-4">
      {location.pathname !== '/app' && (
        <button onClick={() => navigate(-1)} className="mr-3 text-sm font-medium text-secondary">
          ←
        </button>
      )}
      <h1 className="text-base font-semibold">{pageTitle}</h1>
    </header>
  )
}

function getPageTitle(path: string): string {
  if (path === '/app') return 'Dashboard'
  if (path.startsWith('/app/inventory')) return 'Stok'
  if (path.startsWith('/app/suppliers')) return 'Pemasok'
  if (path.startsWith('/app/recipes')) return 'Resep'
  if (path.startsWith('/app/products')) return 'Produk'
  if (path.startsWith('/app/sales')) return 'Penjualan'
  if (path.startsWith('/app/settings')) return 'Pengaturan'
  return 'Batchly'
}
