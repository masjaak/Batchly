import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface Organization {
  id: string
  name: string
  slug: string
}

interface AuthState {
  user: User | null
  organization: Organization | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, businessName: string) => Promise<string | null>
  signInWithGoogle: () => Promise<string | null>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  setOrganization: (org: Organization) => void
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organization: null,
  isLoading: true,

  signIn: async (email, password) => {
    if (!isValidEmail(email)) return 'Email tidak valid'
    if (!password || password.length < 6) return 'Password minimal 6 karakter'

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message

    set({ user: data.user })
    await get().initialize()
    return null
  },

  signUp: async (email, password, businessName) => {
    if (!isValidEmail(email)) return 'Email tidak valid'
    if (!password || password.length < 6) return 'Password minimal 6 karakter'
    if (!businessName || businessName.trim().length === 0) return 'Nama bisnis wajib diisi'

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })
    if (authError) return authError.message
    if (!authData.user) return 'Gagal mendaftar'

    // If email confirmation is ON, no session is returned yet. Creating the
    // organization/user row now would fail (needs auth.uid()) and leave an
    // orphan org. Stop here with a clear message instead.
    if (!authData.session) {
      return 'Akun dibuat. Cek email untuk konfirmasi, lalu login. (Atau matikan "Confirm email" di Supabase untuk langsung masuk.)'
    }

    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const { data: orgData, error: orgError } = await supabase.rpc('create_org_for_current_user', {
      org_name: businessName.trim(),
      org_slug: slug,
    })
    if (orgError) return orgError.message
    if (!orgData) return 'Gagal membuat organisasi'

    set({ user: authData.user, organization: { id: orgData.id, name: orgData.name, slug: orgData.slug } })
    return null
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) return error.message
    return null
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, organization: null })
  },

  initialize: async () => {
    set({ isLoading: true })
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) {
      set({ user: data.session.user })
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .limit(1)
        .single()
      if (orgData) {
        set({ organization: orgData as Organization })
      }
    }
    set({ isLoading: false })
  },

  setOrganization: (org) => set({ organization: org }),
}))

export function useAuth() {
  return useAuthStore()
}
