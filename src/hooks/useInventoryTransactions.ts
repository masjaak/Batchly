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
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['reorder_suggestions'] })
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
      queryClient.invalidateQueries({ queryKey: ['reorder_suggestions'] })
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

export function useDeleteInventoryTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: tx, error: fetchError } = await supabase
        .from('inventory_transactions')
        .select('ingredient_id, quantity, organization_id')
        .eq('id', id)
        .single()

      if (fetchError || !tx) throw fetchError ?? new Error('Transaksi tidak ditemukan')

      const { data: ing, error: ingError } = await supabase
        .from('ingredients')
        .select('current_stock')
        .eq('id', tx.ingredient_id)
        .single()

      if (ingError) throw ingError

      const { error: updateError } = await supabase
        .from('ingredients')
        .update({ current_stock: Number(ing?.current_stock ?? 0) - Number(tx.quantity) })
        .eq('id', tx.ingredient_id)

      if (updateError) throw updateError

      const { error: deleteError } = await supabase
        .from('inventory_transactions')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_transactions'] })
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      queryClient.invalidateQueries({ queryKey: ['reorder_suggestions'] })
    },
  })
}
