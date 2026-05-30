import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useIngredients, useCreateIngredient, useUpdateIngredient, useDeleteIngredient } from '@/hooks/useIngredients'

const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  })),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const testIngredients = [
  { id: '1', organization_id: 'org-1', category_id: 'cat-1', name: 'Tepung Terigu', unit: 'kg', current_stock: 10, latest_price: 12000, min_stock_level: 2, deleted_at: null, created_at: '', updated_at: '' },
  { id: '2', organization_id: 'org-1', category_id: 'cat-2', name: 'Gula Pasir', unit: 'kg', current_stock: 5, latest_price: 15000, min_stock_level: 1, deleted_at: null, created_at: '', updated_at: '' },
]

describe('useIngredients', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches ingredients with category join', async () => {
    mockSelect.mockReturnValue({
      is: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: testIngredients, error: null })),
      })),
    })

    const { result } = renderHook(() => useIngredients(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(testIngredients)
  })
})

describe('useCreateIngredient', () => {
  beforeEach(() => vi.clearAllMocks())

  it('inserts ingredient and returns it', async () => {
    const newItem = { name: 'Telur', unit: 'pcs', organization_id: 'org-1' }
    const returned = { id: '3', ...newItem, category_id: null, current_stock: 0, latest_price: 0, min_stock_level: 0, deleted_at: null, created_at: '', updated_at: '' }

    mockInsert.mockReturnValue({
      select: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: returned, error: null })) })),
    })

    const { result } = renderHook(() => useCreateIngredient(), { wrapper: createWrapper() })
    let data: unknown
    await act(async () => { data = await result.current.mutateAsync(newItem) })
    expect(data).toEqual(returned)
  })
})

describe('useUpdateIngredient', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates ingredient fields', async () => {
    mockUpdate.mockReturnValue({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { id: '1', name: 'Tepung Baru' }, error: null })) })),
      })),
    })

    const { result } = renderHook(() => useUpdateIngredient(), { wrapper: createWrapper() })
    let data: unknown
    await act(async () => { data = await result.current.mutateAsync({ id: '1', name: 'Tepung Baru' }) })
    expect(data).toEqual({ id: '1', name: 'Tepung Baru' })
  })
})

describe('useDeleteIngredient', () => {
  beforeEach(() => vi.clearAllMocks())

  it('soft deletes ingredient', async () => {
    mockUpdate.mockReturnValue({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })

    const { result } = renderHook(() => useDeleteIngredient(), { wrapper: createWrapper() })
    await act(async () => { await result.current.mutateAsync('1') })
    expect(mockUpdate).toHaveBeenCalled()
  })
})
