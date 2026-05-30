import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Expense = Database['public']['Tables']['expenses']['Row']
type NewExpense = Database['public']['Tables']['expenses']['Insert']

export const EXPENSE_CATEGORIES = [
  'Gaji',
  'Sewa',
  'Listrik & Air',
  'Gas',
  'Transportasi',
  'Kemasan',
  'Pemasaran',
  'Peralatan',
  'Lainnya',
] as const

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false })
        .limit(100)

      if (error) throw error
      return (data ?? []) as Expense[]
    },
    staleTime: 30_000,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (expense: NewExpense) => {
      const { data, error } = await supabase.from('expenses').insert(expense).select().single()
      if (error) throw error
      return data as Expense
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
