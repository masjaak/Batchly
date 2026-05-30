import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useProductionBatches() {
  const { organization } = useAuth()

  return useQuery({
    queryKey: ['production_batches', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_batches')
        .select('*, recipe:recipes(name)')
        .eq('organization_id', organization!.id)
        .order('production_date', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!organization,
  })
}

export function useProductionBatch(id: string) {
  const { organization } = useAuth()

  return useQuery({
    queryKey: ['production_batch', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_batches')
        .select('*, recipe:recipes(name, yield_amount, overhead_pct, packaging_cost, selling_price, notes, recipe_items(*, ingredient:ingredients(*, ingredient_categories(name))))')
        .match({ id, organization_id: organization!.id })
        .single()

      if (error) throw error
      return data
    },
    enabled: !!organization && !!id,
  })
}

async function generateBatchNumber(organizationId: string, date: string): Promise<string> {
  const dateStr = date.replace(/-/g, '')
  const { data: lastBatch } = await supabase
    .from('production_batches')
    .select('batch_number')
    .eq('organization_id', organizationId)
    .like('batch_number', `BCH-${dateStr}-%`)
    .order('batch_number', { ascending: false })
    .limit(1)

  const lastNum = lastBatch && lastBatch.length > 0
    ? parseInt((lastBatch[0] as any).batch_number.slice(-3), 10)
    : 0

  const nextNum = String(lastNum + 1).padStart(3, '0')
  return `BCH-${dateStr}-${nextNum}`
}

export function useCreateProductionBatch() {
  const { organization } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      recipe_id: string
      planned_qty: number
      actual_qty: number
      production_date: string
      notes?: string
      variant_id?: string
    }) => {
      if (!organization) throw new Error('No organization')
      if (data.actual_qty <= 0) throw new Error('Jumlah aktual harus lebih dari 0')

      // 1. Get recipe with items
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('*, recipe_items(*)')
        .eq('id', data.recipe_id)
        .single()

      if (recipeError || !recipe) throw new Error('Resep tidak ditemukan')

      // 2. Generate batch number
      const batchNumber = await generateBatchNumber(organization.id, data.production_date)

      // 3. Insert batch
      const { data: batch, error: batchError } = await supabase
        .from('production_batches')
        .insert({
          organization_id: organization.id,
          recipe_id: data.recipe_id,
          variant_id: data.variant_id ?? null,
          batch_number: batchNumber,
          planned_qty: data.planned_qty,
          actual_qty: data.actual_qty,
          production_date: data.production_date,
          notes: data.notes ?? null,
        })
        .select()
        .single()

      if (batchError || !batch) throw batchError ?? new Error('Gagal membuat batch')

      // 4. Create stock-out transactions for each ingredient
      if (recipe.recipe_items && recipe.recipe_items.length > 0) {
        const scaleFactor = data.actual_qty / (recipe.yield_amount || 1)
        const transactions = recipe.recipe_items.map((item: any) => ({
          organization_id: organization.id,
          ingredient_id: item.ingredient_id,
          type: 'out' as const,
          quantity: -(item.quantity * scaleFactor),
          reason: 'produksi',
          notes: `Batch: ${batchNumber} - ${(recipe as any).name}`,
          batch_id: batch.id,
          transaction_date: data.production_date,
        }))

        const { error: txError } = await supabase
          .from('inventory_transactions')
          .insert(transactions)

        if (txError) throw txError
      }

      return batch
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production_batches'] })
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
    },
  })
}

export function useDeleteProductionBatch() {
  const { organization } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!organization) throw new Error('No organization')

      const { data: batch, error: fetchError } = await supabase
        .from('production_batches')
        .select('created_at')
        .eq('id', id)
        .single()

      if (fetchError || !batch) throw fetchError ?? new Error('Batch tidak ditemukan')

      const createdAt = new Date(batch.created_at)
      const now = new Date()
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

      if (hoursDiff > 24) {
        throw new Error('Batch hanya bisa dihapus dalam 24 jam')
      }

      const { error } = await supabase
        .from('production_batches')
        .delete()
        .eq('id', id)
        .eq('organization_id', organization.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production_batches'] })
    },
  })
}
