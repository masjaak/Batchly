import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setInfo(null)
    setSubmitting(true)
    const err = await signUp(email.trim(), password, businessName)
    setSubmitting(false)
    if (err) {
      setError(err.message)
      return
    }
    navigate('/app')
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
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
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
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <p className="mt-1 text-xs text-secondary">Minimal 6 karakter</p>
        </div>

        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 p-3">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {info && (
          <div className="rounded-xl border border-success/30 bg-success/5 p-3">
            <p className="text-sm text-success">{info}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="h-11 w-full rounded-xl bg-ink text-base font-medium text-white disabled:opacity-60"
        >
          {submitting ? 'Memproses…' : 'Daftar'}
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
