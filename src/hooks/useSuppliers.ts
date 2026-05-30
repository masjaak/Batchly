import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Supplier = Database['public']['Tables']['suppliers']['Row']
type NewSupplier = Database['public']['Tables']['suppliers']['Insert']

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .is('deleted_at', null)
        .order('name')

      if (error) throw error
      return data as Supplier[]
    },
    staleTime: 60_000,
  })
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Supplier
    },
    enabled: !!id,
  })
}

export function useSupplierTransactions(supplierId: string) {
  return useQuery({
    queryKey: ['supplier_transactions', supplierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select('*, ingredient:ingredients(name, unit)')
        .eq('supplier_id', supplierId)
        .eq('type', 'in')
        .order('transaction_date', { ascending: false })
        .limit(20)

      if (error) throw error
      return data
    },
    enabled: !!supplierId,
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (supplier: NewSupplier) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select()
        .single()

      if (error) throw error
      return data as Supplier
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...fields }: Partial<Supplier> & { id: string }) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update(fields)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Supplier
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, hasTransactions }: { id: string; hasTransactions: boolean }) => {
      if (hasTransactions) {
        const { error } = await supabase
          .from('suppliers')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('suppliers')
          .delete()
          .eq('id', id)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}
