import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useStockIn } from '@/hooks/useInventoryTransactions'

const mockInsert = vi.fn()

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(() => ({
    insert: mockInsert,
  })),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useStockIn', () => {
  beforeEach(() => vi.clearAllMocks())

  it('inserts stock-in transaction with type=in', async () => {
    const transaction = {
      organization_id: 'org-1',
      ingredient_id: 'ing-1',
      quantity: 10,
      unit_price: 12000,
      transaction_date: '2026-05-20',
    }

    mockInsert.mockReturnValue({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({
          data: { id: 'tx-1', ...transaction, type: 'in', supplier_id: null, reason: null, notes: null, created_at: '' },
          error: null,
        })),
      })),
    })

    const { result } = renderHook(() => useStockIn(), { wrapper: createWrapper() })
    let data: unknown
    await act(async () => { data = await result.current.mutateAsync(transaction) })

    expect(data).toHaveProperty('id', 'tx-1')
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ type: 'in' }))
  })

  it('accepts optional supplier_id', async () => {
    mockInsert.mockReturnValue({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: { id: 'tx-2', supplier_id: 'sup-1' }, error: null })),
      })),
    })

    const { result } = renderHook(() => useStockIn(), { wrapper: createWrapper() })
    await act(async () => {
      await result.current.mutateAsync({
        organization_id: 'org-1',
        ingredient_id: 'ing-1',
        quantity: 5,
        unit_price: 15000,
        supplier_id: 'sup-1',
      })
    })

    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ supplier_id: 'sup-1' }))
  })
})
