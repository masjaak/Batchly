import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
type NewProduct = Database['public']['Tables']['products']['Insert']

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, recipe:recipes(id, name, yield_amount, yield_unit, overhead_pct, packaging_cost, selling_price, recipe_items(*))')
        .order('name')

      if (error) throw error
      return data as (Product & { recipe: any })[]
    },
    staleTime: 60_000,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (product: NewProduct) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()

      if (error) throw error
      return data as Product
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: salesUsing, error: checkError } = await supabase
        .from('sales')
        .select('id')
        .eq('product_id', id)
        .limit(1)

      if (checkError) throw checkError
      if (salesUsing && salesUsing.length > 0) {
        throw new Error('Produk sudah dipakai di penjualan. Hapus penjualan terkait dulu.')
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
