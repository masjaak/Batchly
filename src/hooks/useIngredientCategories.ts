import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Category = Database['public']['Tables']['ingredient_categories']['Row']
type NewCategory = Database['public']['Tables']['ingredient_categories']['Insert']

export function useIngredientCategories() {
  return useQuery({
    queryKey: ['ingredient_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredient_categories')
        .select('*')
        .order('sort_order')

      if (error) throw error
      return data as Category[]
    },
    staleTime: 120_000,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (category: NewCategory) => {
      const { data, error } = await supabase
        .from('ingredient_categories')
        .insert(category)
        .select()
        .single()

      if (error) throw error
      return data as Category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredient_categories'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ingredient_categories')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredient_categories'] })
    },
  })
}
