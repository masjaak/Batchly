import { useAuth } from '@/hooks/useAuth'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 19) return 'Selamat sore'
  return 'Selamat malam'
}

export default function GreetingHeader() {
  const { organization } = useAuth()
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-primary lg:text-3xl">
        {greeting()}, {organization?.name ?? 'Batchly'}
      </h1>
      <p className="mt-1 text-sm text-secondary">
        Pantau stok, produksi, dan keuntungan bisnis Anda dalam satu layar.
      </p>
    </div>
  )
}
