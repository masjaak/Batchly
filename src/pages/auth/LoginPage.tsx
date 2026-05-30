import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    const form = new FormData(e.currentTarget)
    const error = await signIn(
      form.get('email') as string,
      form.get('password') as string,
    )
    setSubmitting(false)
    if (error) {
      toast.error(error)
      return
    }
    navigate('/app')
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
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
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
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="h-11 w-full rounded-xl bg-ink text-base font-medium text-white disabled:opacity-60"
        >
          {submitting ? 'Memproses…' : 'Masuk'}
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
