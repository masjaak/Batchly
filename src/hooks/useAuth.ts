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
  organizations: Organization[]
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, businessName: string) => Promise<string | null>
  signInWithGoogle: () => Promise<string | null>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  setOrganization: (org: Organization) => void
  loadOrganizations: () => Promise<void>
  switchOrganization: (orgId: string) => Promise<string | null>
  createBusiness: (name: string) => Promise<string | null>
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organization: null,
  organizations: [],
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

    const slug = slugify(businessName)

    const { data: orgData, error: orgError } = await supabase.rpc('create_org_for_current_user', {
      org_name: businessName.trim(),
      org_slug: slug,
    })
    if (orgError) return orgError.message
    if (!orgData) return 'Gagal membuat organisasi'

    const org = { id: orgData.id, name: orgData.name, slug: orgData.slug }
    set({ user: authData.user, organization: org, organizations: [org] })
    return null
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) return error.message
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
    if (error) return error.message
    if (data) set({ organization: { id: data.id, name: data.name, slug: data.slug } })
    return null
  },

  createBusiness: async (name) => {
    if (!name.trim()) return 'Nama usaha wajib diisi'
    const { data, error } = await supabase.rpc('create_additional_business', {
      org_name: name.trim(),
      org_slug: slugify(name),
    })
    if (error) return error.message
    if (data) {
      set({ organization: { id: data.id, name: data.name, slug: data.slug } })
      await get().loadOrganizations()
    }
    return null
  },
}))

export function useAuth() {
  return useAuthStore()
}
