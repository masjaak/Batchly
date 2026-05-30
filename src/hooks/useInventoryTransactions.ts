import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Transaction = Database['public']['Tables']['inventory_transactions']['Row']
type NewTransaction = Database['public']['Tables']['inventory_transactions']['Insert']

export function useStockIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tx: Omit<NewTransaction, 'type'>) => {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .insert({ ...tx, type: 'in' })
        .select()
        .single()

      if (error) throw error
      return data as Transaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      queryClient.invalidateQueries({ queryKey: ['inventory_transactions'] })
    },
  })
}

export function useStockOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tx: Omit<NewTransaction, 'type'>) => {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .insert({ ...tx, type: 'out' })
        .select()
        .single()

      if (error) throw error
      return data as Transaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      queryClient.invalidateQueries({ queryKey: ['inventory_transactions'] })
    },
  })
}

export function useIngredientTransactions(ingredientId: string) {
  return useQuery({
    queryKey: ['inventory_transactions', ingredientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select('*, supplier:suppliers(name)')
        .eq('ingredient_id', ingredientId)
        .order('transaction_date', { ascending: false })
        .limit(20)

      if (error) throw error
      return data as (Transaction & { supplier: { name: string } | null })[]
    },
    enabled: !!ingredientId,
  })
}
