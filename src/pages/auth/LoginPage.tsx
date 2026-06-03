import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

type Mode = 'login' | 'forgot'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, resendConfirmation, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('login')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setErrorCode(null)
    setInfo(null)
    setSubmitting(true)
    const err = await signIn(email.trim(), password)
    setSubmitting(false)
    if (err) {
      setError(err.message)
      setErrorCode(err.code)
      return
    }
    navigate('/app')
  }

  const handleResend = async () => {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    setErrorCode(null)
    setInfo(null)
    const err = await resendConfirmation(email.trim())
    setSubmitting(false)
    if (err) {
      setError(err.message)
      setErrorCode(err.code)
      return
    }
    setInfo('Email konfirmasi sudah dikirim ulang. Cek inbox (dan folder spam).')
  }

  const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setErrorCode(null)
    setInfo(null)
    setSubmitting(true)
    const err = await resetPassword(email.trim())
    setSubmitting(false)
    if (err) {
      setError(err.message)
      setErrorCode(err.code)
      return
    }
    setInfo('Link reset password sudah dikirim ke email Anda. Cek inbox (dan folder spam).')
    toast.success('Link reset password dikirim')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-primary">Batchly</h1>
        <p className="mt-1 text-sm text-secondary">
          {mode === 'login' ? 'Masuk ke akun Anda' : 'Reset password'}
        </p>
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-secondary">
                Password
              </label>
              <button
                type="button"
                onClick={() => { setMode('forgot'); setError(null); setErrorCode(null); setInfo(null) }}
                className="text-xs font-medium text-primary underline"
              >
                Lupa password?
              </button>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger/5 p-3">
              <p className="text-sm text-danger">{error}</p>
              {errorCode === 'email_unconfirmed' && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={submitting || !email}
                  className="mt-2 text-xs font-medium text-primary underline disabled:opacity-50"
                >
                  Kirim ulang email konfirmasi
                </button>
              )}
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
            {submitting ? 'Memproses…' : 'Masuk'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleForgot} className="space-y-4">
          <p className="text-sm text-secondary">
            Masukkan email Anda. Kami akan mengirim link untuk mengatur password baru.
          </p>
          <div>
            <label htmlFor="reset-email" className="mb-1 block text-sm font-medium text-secondary">
              Email
            </label>
            <input
              id="reset-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
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
            {submitting ? 'Mengirim…' : 'Kirim link reset'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); setErrorCode(null); setInfo(null) }}
            className="h-11 w-full rounded-xl border border-border bg-surface text-sm font-medium text-primary"
          >
            Kembali ke masuk
          </button>
        </form>
      )}

      {mode === 'login' && (
        <p className="mt-6 text-center text-sm text-secondary">
          Belum punya akun?{' '}
          <Link to="/signup" className="font-medium text-primary underline">
            Daftar
          </Link>
        </p>
      )}
    </div>
  )
}
