import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useProductVariants(productId: string) {
  const { organization } = useAuth()

  return useQuery({
    queryKey: ['product_variants', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .eq('organization_id', organization!.id)
        .order('sort_order')

      if (error) throw error
      return data
    },
    enabled: !!organization && !!productId,
  })
}

export function useCreateProductVariant() {
  const { organization } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      product_id: string
      name: string
      packaging_cost: number
      default_price: number
      sku?: string
    }) => {
      if (!organization) throw new Error('No organization')

      const { data: maxSort } = await supabase
        .from('product_variants')
        .select('sort_order')
        .eq('product_id', data.product_id)
        .order('sort_order', { ascending: false })
        .limit(1)

      const nextSort = maxSort && maxSort.length > 0 ? (maxSort[0] as any).sort_order + 1 : 1

      const { data: variant, error } = await supabase
        .from('product_variants')
        .insert({
          organization_id: organization.id,
          product_id: data.product_id,
          name: data.name,
          sku: data.sku ?? null,
          packaging_cost: data.packaging_cost,
          default_price: data.default_price,
          sort_order: nextSort,
        })
        .select()
        .single()

      if (error) throw error
      return variant
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product_variants', data.product_id] })
    },
  })
}

export function useDeleteProductVariant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_variants'] })
    },
  })
}
