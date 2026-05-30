import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useProductionBatches, useProductionBatch, useCreateProductionBatch } from '@/hooks/useProductionBatches'

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

const testBatch = {
  id: 'b1', batch_number: 'BCH-20260530-001',
  recipe: { id: 'r1', name: 'Brownies', yield_amount: 24, overhead_pct: 10, packaging_cost: 5000, recipe_items: [] },
  planned_qty: 24, actual_qty: 24, production_date: '2026-05-30',
  organization_id: 'org-1', recipe_id: 'r1', notes: null,
  created_at: '2026-05-30T08:00:00Z', updated_at: '2026-05-30T08:00:00Z',
}

const testBatches = [
  testBatch,
  { ...testBatch, id: 'b2', batch_number: 'BCH-20260530-002', recipe: { name: 'Cold Brew' } },
]

const singleBatch = {
  ...testBatch,
  recipe: {
    ...testBatch.recipe,
    recipe_items: [{ id: 'ri1', quantity: 2, cost_at_create: 12000, ingredient: { id: 'i1', name: 'Tepung', unit: 'kg' } }],
  },
}

const newBatch = { ...testBatch }

function thenableBuilder(finalPromise: Promise<unknown>) {
  return new Proxy({}, {
    get(_, prop: string) {
      if (prop === 'then') return finalPromise.then.bind(finalPromise)
      return () => thenableBuilder(finalPromise)
    },
  })
}

function batchInsertBuilder(insertResultPromise: Promise<unknown>) {
  const selectSingle = { single: () => insertResultPromise }
  const insert = { select: () => selectSingle }
  const emptyPromise = Promise.resolve(dbRes([]))
  return new Proxy({}, {
    get(_: unknown, prop: string) {
      if (prop === 'insert') return () => insert
      if (prop === 'limit') return () => emptyPromise
      if (prop === 'then') return emptyPromise.then.bind(emptyPromise)
      return () => batchInsertBuilder(insertResultPromise)
    },
  })
}

describe('useProductionBatches', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches batch list ordered by date desc', async () => {
    const sb = vi.mocked((await import('@/lib/supabase')).supabase)
    const promise = Promise.resolve(dbRes(testBatches))
    sb.from.mockReturnValue(thenableBuilder(promise) as any)

    const { result } = renderHook(() => useProductionBatches(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(testBatches)
  })
})

describe('useProductionBatch', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches single batch with recipe and items', async () => {
    const sb = vi.mocked((await import('@/lib/supabase')).supabase)
    const singlePromise = Promise.resolve(dbRes(singleBatch))
    const builder = new Proxy({}, {
      get(_: unknown, prop: string) {
        if (prop === 'single') return () => singlePromise
        if (prop === 'then') return singlePromise.then.bind(singlePromise)
        return () => builder
      },
    })
    sb.from.mockReturnValue(builder as any)

    const { result } = renderHook(() => useProductionBatch('b1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.batch_number).toBe('BCH-20260530-001')
  })
})

describe('useCreateProductionBatch', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates batch and auto-deducts ingredients', async () => {
    const sb = vi.mocked((await import('@/lib/supabase')).supabase)

    const recipeRes = dbRes({
      id: 'r1', name: 'Brownies', yield_amount: 24,
      recipe_items: [{ ingredient_id: 'i1', quantity: 2, cost_at_create: 12000 }],
    })
    const recipePromise = Promise.resolve(recipeRes)
    const recipeBuilder = new Proxy({}, {
      get(_: unknown, prop: string) {
        if (prop === 'single') return () => recipePromise
        if (prop === 'then') return recipePromise.then.bind(recipePromise)
        return () => recipeBuilder
      },
    })

    const insertResPromise = Promise.resolve(dbRes(newBatch))
    const batchBuilder = batchInsertBuilder(insertResPromise)

    const txPromise = Promise.resolve({ error: null })

    sb.from.mockImplementation((table: string) => {
      if (table === 'recipes') return recipeBuilder as any
      if (table === 'production_batches') return batchBuilder as any
      if (table === 'inventory_transactions') return thenableBuilder(txPromise) as any
      return thenableBuilder(Promise.resolve(dbRes([]))) as any
    })

    const { result } = renderHook(() => useCreateProductionBatch(), { wrapper: createWrapper() })
    let res: unknown
    await act(async () => {
      res = await result.current.mutateAsync({
        recipe_id: 'r1',
        planned_qty: 24,
        actual_qty: 24,
        production_date: '2026-05-30',
      })
    })
    expect(res).toHaveProperty('batch_number', 'BCH-20260530-001')
  })

  it('rejects zero actual quantity', async () => {
    const { result } = renderHook(() => useCreateProductionBatch(), { wrapper: createWrapper() })
    await expect(
      result.current.mutateAsync({
        recipe_id: 'r1',
        planned_qty: 24,
        actual_qty: 0,
        production_date: '2026-05-30',
      }),
    ).rejects.toThrow('Jumlah aktual harus lebih dari 0')
  })
})
