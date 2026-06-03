import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Icon } from '@/components/ui/Icon'

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
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-base font-semibold text-white shadow-card">
          B
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Batchly</h1>
        <p className="mt-1 text-sm text-secondary">Buat akun baru</p>
      </div>
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="businessName" className="mb-1.5 block text-xs font-medium text-secondary">Nama Bisnis</label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-secondary">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-secondary">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
            />
            <p className="mt-1 text-xs text-secondary">Minimal 6 karakter</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-pink bg-pink-soft p-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink text-pink-strong">
                <Icon name="alert" size={11} strokeWidth={2.5} />
              </span>
              <p className="text-sm text-pink-strong">{error}</p>
            </div>
          )}

          {info && (
            <div className="flex items-start gap-2.5 rounded-xl border border-mint bg-mint/40 p-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint text-mint-strong">
                <Icon name="check" size={11} strokeWidth={2.5} />
              </span>
              <p className="text-sm text-mint-strong">{info}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-ink text-sm font-semibold text-white shadow-card transition-colors hover:bg-ink/90 disabled:opacity-50"
          >
            {submitting ? 'Memproses…' : 'Daftar'}
          </button>
        </form>
      </div>
      <p className="mt-6 text-center text-sm text-secondary">
        Sudah punya akun?{' '}
        <Link to="/login" className="font-semibold text-ink underline-offset-4 hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  )
}
