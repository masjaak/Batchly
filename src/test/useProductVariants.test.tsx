import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useProductVariants, useCreateProductVariant, useDeleteProductVariant } from '@/hooks/useProductVariants'

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ organization: { id: 'org-1' } }),
}))

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

function dbRes(data: unknown) {
  return { data, error: null }
}

function thenableBuilder(finalPromise: Promise<unknown>) {
  return new Proxy({}, {
    get(_, prop: string) {
      if (prop === 'then') return finalPromise.then.bind(finalPromise)
      return () => thenableBuilder(finalPromise)
    },
  })
}

const testVariants = [
  { id: 'v1', product_id: 'p1', name: 'Kemasan 250g', sku: 'BRW-250', packaging_cost: 3000, default_price: 25000, sort_order: 1, organization_id: 'org-1', created_at: '', updated_at: '' },
  { id: 'v2', product_id: 'p1', name: 'Kemasan 500g', sku: 'BRW-500', packaging_cost: 5000, default_price: 45000, sort_order: 2, organization_id: 'org-1', created_at: '', updated_at: '' },
]

describe('useProductVariants', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches variants for a product ordered by sort_order', async () => {
    const sb = vi.mocked((await import('@/lib/supabase')).supabase)
    const promise = Promise.resolve(dbRes(testVariants))
    sb.from.mockReturnValue(thenableBuilder(promise) as any)

    const { result } = renderHook(() => useProductVariants('p1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(testVariants)
  })
})

describe('useCreateProductVariant', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates variant and returns it', async () => {
    const sb = vi.mocked((await import('@/lib/supabase')).supabase)
    const newVariant = { name: 'Kemasan 1kg', product_id: 'p1', packaging_cost: 8000, default_price: 80000 }

    // First call: get max sort_order
    // Second call: insert and return
    const maxOrderPromise = Promise.resolve(dbRes([{ sort_order: 2 }]))
    const insertPromise = Promise.resolve(dbRes({ id: 'v3', ...newVariant, sku: null, sort_order: 3, organization_id: 'org-1', created_at: '', updated_at: '' }))

    let callCount = 0
    const builder = new Proxy({}, {
      get(_, prop: string) {
        if (prop === 'limit') return () => maxOrderPromise
        if (prop === 'insert') return () => ({ select: () => ({ single: () => insertPromise }) })
        if (prop === 'then') {
          callCount++
          if (callCount === 1) return maxOrderPromise.then.bind(maxOrderPromise)
          return insertPromise.then.bind(insertPromise)
        }
        return () => builder
      },
    })
    sb.from.mockReturnValue(builder as any)

    const { result } = renderHook(() => useCreateProductVariant(), { wrapper: createWrapper() })
    let data: unknown
    await act(async () => {
      data = await result.current.mutateAsync(newVariant)
    })
    expect(data).toHaveProperty('id', 'v3')
    expect(data).toHaveProperty('name', 'Kemasan 1kg')
  })
})

describe('useDeleteProductVariant', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes variant', async () => {
    const sb = vi.mocked((await import('@/lib/supabase')).supabase)
    const promise = Promise.resolve({ error: null })
    sb.from.mockReturnValue(thenableBuilder(promise) as any)

    const { result } = renderHook(() => useDeleteProductVariant(), { wrapper: createWrapper() })
    await act(async () => {
      await result.current.mutateAsync('v1')
    })
    expect(sb.from).toHaveBeenCalledWith('product_variants')
  })
})
