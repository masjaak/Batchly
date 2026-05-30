import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useIngredientCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useIngredientCategories'

const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockDelete = vi.fn()

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    delete: mockDelete,
  })),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

const testCategories = [
  { id: '1', organization_id: 'org-1', name: 'Bahan Baku', sort_order: 1, created_at: '', updated_at: '' },
  { id: '2', organization_id: 'org-1', name: 'Bumbu', sort_order: 2, created_at: '', updated_at: '' },
  { id: '3', organization_id: 'org-1', name: 'Kemasan', sort_order: 3, created_at: '', updated_at: '' },
]

describe('useIngredientCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches categories ordered by sort_order', async () => {
    mockSelect.mockReturnValue({
      order: vi.fn(() => Promise.resolve({ data: testCategories, error: null })),
    })

    const { result } = renderHook(() => useIngredientCategories(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(testCategories)
  })

  it('returns empty array on error', async () => {
    mockSelect.mockReturnValue({
      order: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Network error' } })),
    })

    const { result } = renderHook(() => useIngredientCategories(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(false))
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts a new category and returns it', async () => {
    const newCategory = { organization_id: 'org-1', name: 'Dairy', sort_order: 4 }
    const returned = { id: '4', created_at: '', updated_at: '', ...newCategory }

    mockInsert.mockReturnValue({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: returned, error: null })),
      })),
    })

    const { result } = renderHook(() => useCreateCategory(), {
      wrapper: createWrapper(),
    })

    let data
    await act(async () => {
      data = await result.current.mutateAsync(newCategory)
    })

    expect(data).toEqual(returned)
    // Regression: category insert MUST carry organization_id (RLS + NOT NULL).
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ organization_id: 'org-1' }))
  })

  it('throws on insert error', async () => {
    mockInsert.mockReturnValue({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Duplicate name' } })),
      })),
    })

    const { result } = renderHook(() => useCreateCategory(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.mutateAsync({ organization_id: 'org-1', name: 'Duplicate', sort_order: 1 })
      }),
    ).rejects.toThrow('Duplicate name')
  })
})

describe('useDeleteCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes a category by id', async () => {
    mockDelete.mockReturnValue({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })

    const { result } = renderHook(() => useDeleteCategory(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync('category-1')
    })

    expect(mockDelete).toHaveBeenCalled()
  })

  it('throws on delete error', async () => {
    mockDelete.mockReturnValue({
      eq: vi.fn(() => Promise.resolve({ error: { message: 'Category in use' } })),
    })

    const { result } = renderHook(() => useDeleteCategory(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.mutateAsync('category-1')
      }),
    ).rejects.toThrow('Category in use')
  })
})
