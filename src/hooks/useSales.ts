import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Sale = Database['public']['Tables']['sales']['Row']
type NewSale = Database['public']['Tables']['sales']['Insert']

export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*, product:products(id, name, unit, default_price, recipe:recipes(*))')
        .order('sale_date', { ascending: false })
        .limit(50)

      if (error) throw error
      return data as (Sale & { product: any })[]
    },
    staleTime: 30_000,
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sale: NewSale) => {
      const { data, error } = await supabase
        .from('sales')
        .insert(sale)
        .select()
        .single()

      if (error) throw error
      return data as Sale
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
