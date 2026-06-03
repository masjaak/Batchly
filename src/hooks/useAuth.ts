import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface Organization {
  id: string
  name: string
  slug: string
}

export type AuthErrorCode =
  | 'email_unconfirmed'
  | 'invalid_credentials'
  | 'email_taken'
  | 'weak_password'
  | 'rate_limited'
  | 'network'
  | 'not_configured'
  | 'unknown'

export interface AuthError {
  code: AuthErrorCode
  message: string
}

interface AuthState {
  user: User | null
  organization: Organization | null
  organizations: Organization[]
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<AuthError | null>
  signUp: (email: string, password: string, businessName: string) => Promise<AuthError | null>
  signInWithGoogle: () => Promise<AuthError | null>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  setOrganization: (org: Organization) => void
  loadOrganizations: () => Promise<void>
  switchOrganization: (orgId: string) => Promise<AuthError | null>
  createBusiness: (name: string) => Promise<AuthError | null>
  resendConfirmation: (email: string) => Promise<AuthError | null>
  resetPassword: (email: string) => Promise<AuthError | null>
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function mapAuthError(err: { message?: string } | null, fallback: string): AuthError {
  const msg = err?.message ?? fallback
  const lower = msg.toLowerCase()

  if (lower.includes('not configured')) {
    return { code: 'not_configured', message: 'Supabase belum dikonfigurasi. Hubungi admin.' }
  }
  if (lower.includes('email not confirmed') || lower.includes('not confirmed')) {
    return { code: 'email_unconfirmed', message: 'Email belum dikonfirmasi. Cek inbox Anda atau kirim ulang tautan konfirmasi.' }
  }
  if (lower.includes('invalid login') || lower.includes('invalid credentials') || lower.includes('invalid email or password')) {
    return { code: 'invalid_credentials', message: 'Email atau password salah. Coba lagi, atau daftar kalau belum punya akun.' }
  }
  if (lower.includes('already registered') || lower.includes('user already') || lower.includes('already been registered')) {
    return { code: 'email_taken', message: 'Email sudah terdaftar. Coba login, atau gunakan email lain.' }
  }
  if (lower.includes('password') && (lower.includes('at least') || lower.includes('characters') || lower.includes('weak'))) {
    return { code: 'weak_password', message: 'Password terlalu lemah. Minimal 6 karakter.' }
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return { code: 'rate_limited', message: 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.' }
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch')) {
    return { code: 'network', message: 'Gagal terhubung ke server. Cek koneksi internet Anda.' }
  }
  if (lower.includes('supabase') && lower.includes('url') && lower.includes('invalid')) {
    return { code: 'not_configured', message: 'Konfigurasi Supabase tidak valid. Hubungi admin.' }
  }
  return { code: 'unknown', message: msg }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organization: null,
  organizations: [],
  isLoading: true,

  signIn: async (email, password) => {
    if (!isValidEmail(email)) return { code: 'unknown', message: 'Email tidak valid' }
    if (!password) return { code: 'unknown', message: 'Password wajib diisi' }
    if (password.length < 6) return { code: 'weak_password', message: 'Password minimal 6 karakter' }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return mapAuthError(error, 'Gagal masuk')

    // Defensive: Supabase can return a user without a session if email
    // confirmation is required and the user is on a stale build. Never mark
    // the user as signed-in if there's no real auth session.
    if (!data.session || !data.user) {
      return {
        code: 'email_unconfirmed',
        message: 'Email belum dikonfirmasi. Cek inbox Anda atau kirim ulang tautan konfirmasi.',
      }
    }

    set({ user: data.user })
    await get().loadOrganizations()
    return null
  },

  signUp: async (email, password, businessName) => {
    if (!isValidEmail(email)) return { code: 'unknown', message: 'Email tidak valid' }
    if (!password) return { code: 'unknown', message: 'Password wajib diisi' }
    if (password.length < 6) return { code: 'weak_password', message: 'Password minimal 6 karakter' }
    if (!businessName || businessName.trim().length === 0) return { code: 'unknown', message: 'Nama bisnis wajib diisi' }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })
    if (authError) return mapAuthError(authError, 'Gagal mendaftar')
    if (!authData.user) return { code: 'unknown', message: 'Gagal mendaftar' }

    // If email confirmation is ON, no session is returned yet. Creating the
    // organization/user row now would fail (needs auth.uid()) and leave an
    // orphan org. Stop here with a clear message instead.
    if (!authData.session) {
      return {
        code: 'email_unconfirmed',
        message: 'Akun dibuat. Cek email untuk konfirmasi, lalu login. (Atau matikan "Confirm email" di Supabase untuk langsung masuk.)',
      }
    }

    const slug = slugify(businessName)

    const { data: orgData, error: orgError } = await supabase.rpc('create_org_for_current_user', {
      org_name: businessName.trim(),
      org_slug: slug,
    })
    if (orgError) return mapAuthError(orgError, 'Gagal membuat organisasi')
    if (!orgData) return { code: 'unknown', message: 'Gagal membuat organisasi' }

    const org = { id: orgData.id, name: orgData.name, slug: orgData.slug }
    set({ user: authData.user, organization: org, organizations: [org] })
    return null
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) return mapAuthError(error, 'Gagal masuk dengan Google')
    return null
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, organization: null, organizations: [] })
  },

  initialize: async () => {
    set({ isLoading: true })
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) {
      set({ user: data.session.user })
      await get().loadOrganizations()
    }
    set({ isLoading: false })
  },

  setOrganization: (org) => set({ organization: org }),

  loadOrganizations: async () => {
    const { data, error } = await supabase.rpc('list_my_organizations')
    if (error || !data) return
    const orgs: Organization[] = data.map((o: { id: string; name: string; slug: string }) => ({ id: o.id, name: o.name, slug: o.slug }))
    const active = data.find((o: { is_active: boolean }) => o.is_active)
    set({
      organizations: orgs,
      ...(active ? { organization: { id: active.id, name: active.name, slug: active.slug } } : {}),
    })
  },

  switchOrganization: async (orgId) => {
    const { data, error } = await supabase.rpc('set_active_organization', { org_id: orgId })
    if (error) return mapAuthError(error, 'Gagal ganti usaha')
    if (data) set({ organization: { id: data.id, name: data.name, slug: data.slug } })
    return null
  },

  createBusiness: async (name) => {
    if (!name.trim()) return { code: 'unknown', message: 'Nama usaha wajib diisi' }
    const { data, error } = await supabase.rpc('create_additional_business', {
      org_name: name.trim(),
      org_slug: slugify(name),
    })
    if (error) return mapAuthError(error, 'Gagal membuat usaha')
    if (data) {
      set({ organization: { id: data.id, name: data.name, slug: data.slug } })
      await get().loadOrganizations()
    }
    return null
  },

  resendConfirmation: async (email) => {
    if (!isValidEmail(email)) return { code: 'unknown', message: 'Email tidak valid' }
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })
    if (error) return mapAuthError(error, 'Gagal mengirim ulang email')
    return null
  },

  resetPassword: async (email) => {
    if (!isValidEmail(email)) return { code: 'unknown', message: 'Email tidak valid' }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    if (error) return mapAuthError(error, 'Gagal mengirim email reset')
    return null
  },
}))

export function useAuth() {
  return useAuthStore()
}
