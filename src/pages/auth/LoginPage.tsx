import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { Icon } from '@/components/ui/Icon'

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
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-base font-semibold text-white shadow-card">
          B
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Batchly</h1>
        <p className="mt-1 text-sm text-secondary">
          {mode === 'login' ? 'Masuk ke akun Anda' : 'Reset password'}
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        {mode === 'login' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-medium text-secondary">Password</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(null); setErrorCode(null); setInfo(null) }}
                  className="text-xs font-medium text-secondary transition-colors hover:text-ink"
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
                className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-pink bg-pink-soft p-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink text-pink-strong">
                  <Icon name="alert" size={11} strokeWidth={2.5} />
                </span>
                <div className="flex-1">
                  <p className="text-sm text-pink-strong">{error}</p>
                  {errorCode === 'email_unconfirmed' && (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={submitting || !email}
                      className="mt-1.5 text-xs font-semibold text-ink underline disabled:opacity-50"
                    >
                      Kirim ulang email konfirmasi
                    </button>
                  )}
                </div>
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
              {submitting ? 'Memproses…' : 'Masuk'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
            <p className="text-sm text-secondary">Masukkan email Anda. Kami akan mengirim link untuk mengatur password baru.</p>
            <div>
              <label htmlFor="reset-email" className="mb-1.5 block text-xs font-medium text-secondary">Email</label>
              <input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-ink/60 focus:ring-4 focus:ring-ink/5"
              />
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
              {submitting ? 'Mengirim…' : 'Kirim link reset'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setErrorCode(null); setInfo(null) }}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-surface text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
            >
              Kembali ke masuk
            </button>
          </form>
        )}
      </div>

      {mode === 'login' && (
        <p className="mt-6 text-center text-sm text-secondary">
          Belum punya akun?{' '}
          <Link to="/signup" className="font-semibold text-ink underline-offset-4 hover:underline">
            Daftar
          </Link>
        </p>
      )}
    </div>
  )
}
