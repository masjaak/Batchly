import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const missingCreds = !supabaseUrl || !supabaseAnonKey

if (missingCreds) {
  console.warn(
    'Supabase credentials not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
  )
}

function createNoopClient(): ReturnType<typeof createClient<Database>> {
  const noop = () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
  const noopSingle = () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
  const chainable = new Proxy(
    { select: () => chainable, insert: () => chainable, update: () => chainable, delete: () => chainable, eq: () => chainable, neq: () => chainable, gt: () => chainable, gte: () => chainable, lt: () => chainable, lte: () => chainable, like: () => chainable, ilike: () => chainable, is: () => chainable, in: () => chainable, contains: () => chainable, order: () => chainable, limit: () => chainable, range: () => chainable, single: noopSingle, maybeSingle: noopSingle, then: undefined },
    {
      get(target, prop) {
        if (prop === 'then') return undefined
        if (prop in target) return (target as Record<string, unknown>)[prop]
        return () => chainable
      },
    },
  ) as ReturnType<ReturnType<typeof createClient<Database>>['from']>

  return {
    from: () => chainable,
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signInWithOAuth: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    storage: { from: () => ({ upload: noop, getPublicUrl: () => ({ data: { publicUrl: '' } }), list: noop, remove: noop }) },
    channel: () => ({ on: () => ({ subscribe: () => {} }), unsubscribe: () => {} }),
  } as unknown as ReturnType<typeof createClient<Database>>
}

export const supabase = missingCreds ? createNoopClient() : createClient<Database>(supabaseUrl!, supabaseAnonKey!)
