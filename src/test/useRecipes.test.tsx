import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useRecipes, useCreateRecipe, useRecipe, useDuplicateRecipe } from '@/hooks/useRecipes'

const mockSelect = vi.fn()
const mockInsert = vi.fn()

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
  })),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

const testRecipes = [
  { id: 'r1', organization_id: 'org-1', name: 'Brownies Coklat', yield_amount: 24, yield_unit: 'pcs', overhead_pct: 10, packaging_cost: 5000, selling_price: 85000, notes: null, created_at: '', updated_at: '' },
  { id: 'r2', organization_id: 'org-1', name: 'Cold Brew', yield_amount: 5, yield_unit: 'liter', overhead_pct: 0, packaging_cost: 2000, selling_price: 120000, notes: null, created_at: '', updated_at: '' },
]

describe('useRecipes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches recipe list ordered by name', async () => {
    mockSelect.mockReturnValue({
      order: vi.fn(() => Promise.resolve({ data: testRecipes, error: null })),
    })

    const { result } = renderHook(() => useRecipes(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(testRecipes)
  })
})

describe('useRecipe', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches single recipe with items', async () => {
    const recipeWithItems = {
      ...testRecipes[0],
      recipe_items: [
        { id: 'ri1', recipe_id: 'r1', ingredient_id: 'i1', quantity: 2, unit: 'kg', cost_at_create: 12000 },
      ],
    }

    mockSelect.mockReturnValue({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: recipeWithItems, error: null })),
      })),
    })

    const { result } = renderHook(() => useRecipe('r1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.name).toBe('Brownies Coklat')
    expect(result.current.data?.recipe_items).toHaveLength(1)
  })
})

describe('useCreateRecipe', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates recipe and returns it', async () => {
    const newRecipe = { name: 'New Recipe', yield_amount: 10, yield_unit: 'box', organization_id: 'org-1' }
    const returned = { id: 'r3', ...newRecipe, overhead_pct: 0, packaging_cost: 0, selling_price: 0, notes: null, created_at: '', updated_at: '' }

    mockInsert.mockReturnValue({
      select: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: returned, error: null })) })),
    })

    const { result } = renderHook(() => useCreateRecipe(), { wrapper: createWrapper() })
    let data: unknown
    await act(async () => { data = await result.current.mutateAsync(newRecipe) })
    expect(data).toEqual(returned)
  })
})

describe('useDuplicateRecipe', () => {
  beforeEach(() => vi.clearAllMocks())

  it('duplicates recipe with new name', async () => {
    const original = { ...testRecipes[0] }
    const duplicated = { ...original, id: 'r4', name: 'Copy of Brownies Coklat' }

    mockSelect.mockReturnValue({
      eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { ...original, recipe_items: [] }, error: null })) })),
    })
    mockInsert.mockReturnValue({
      select: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: duplicated, error: null })) })),
    })

    const { result } = renderHook(() => useDuplicateRecipe(), { wrapper: createWrapper() })
    let data: unknown
    await act(async () => { data = await result.current.mutateAsync('r1') })
    expect(data).toHaveProperty('name', 'Copy of Brownies Coklat')
  })
})
