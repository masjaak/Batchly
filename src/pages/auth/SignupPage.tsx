import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const error = await signUp(
      form.get('email') as string,
      form.get('password') as string,
      form.get('businessName') as string,
    )
    if (!error) navigate('/app')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-primary">Batchly</h1>
        <p className="mt-1 text-sm text-secondary">Buat akun baru</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="businessName" className="mb-1 block text-sm font-medium text-secondary">
            Nama Bisnis
          </label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            required
            className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-secondary">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-secondary">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          className="h-12 w-full rounded-lg bg-primary text-base font-medium text-white"
        >
          Daftar
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-secondary">
        Sudah punya akun?{' '}
        <Link to="/login" className="font-medium text-primary underline">
          Masuk
        </Link>
      </p>
    </div>
  )
}
