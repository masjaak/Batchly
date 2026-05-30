import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const error = await signIn(
      form.get('email') as string,
      form.get('password') as string,
    )
    if (!error) navigate('/app')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-primary">Batchly</h1>
        <p className="mt-1 text-sm text-secondary">Masuk ke akun Anda</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-base outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          className="h-12 w-full rounded-lg bg-primary text-base font-medium text-white"
        >
          Masuk
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-secondary">
        Belum punya akun?{' '}
        <Link to="/signup" className="font-medium text-primary underline">
          Daftar
        </Link>
      </p>
    </div>
  )
}
