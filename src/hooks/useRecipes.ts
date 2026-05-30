import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Recipe = Database['public']['Tables']['recipes']['Row']
type NewRecipe = Database['public']['Tables']['recipes']['Insert']
type RecipeItem = Database['public']['Tables']['recipe_items']['Row']

export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('name')

      if (error) throw error
      return data as Recipe[]
    },
    staleTime: 60_000,
  })
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*, recipe_items(*, ingredient:ingredients(name, unit, latest_price))')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Recipe & { recipe_items: (RecipeItem & { ingredient: { name: string; unit: string; latest_price: number } })[] }
    },
    enabled: !!id,
  })
}

export function useCreateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (recipe: NewRecipe) => {
      const { data, error } = await supabase
        .from('recipes')
        .insert(recipe)
        .select()
        .single()

      if (error) throw error
      return data as Recipe
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...fields }: Partial<Recipe> & { id: string }) => {
      const { data, error } = await supabase
        .from('recipes')
        .update(fields)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Recipe
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['recipe', vars.id] })
    },
  })
}

export function useDuplicateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (recipeId: string) => {
      const { data: original, error: fetchError } = await supabase
        .from('recipes')
        .select('*, recipe_items(*)')
        .eq('id', recipeId)
        .single()

      if (fetchError) throw fetchError

      const { data: newRecipe, error: insertError } = await supabase
        .from('recipes')
        .insert({
          organization_id: original.organization_id,
          name: `Copy of ${original.name}`,
          yield_amount: original.yield_amount,
          yield_unit: original.yield_unit,
          overhead_pct: original.overhead_pct,
          packaging_cost: original.packaging_cost,
          selling_price: original.selling_price,
        })
        .select()
        .single()

      if (insertError) throw insertError

      if (original.recipe_items?.length > 0) {
        const newItems = original.recipe_items.map((item: any) => ({
          recipe_id: newRecipe.id,
          ingredient_id: item.ingredient_id,
          quantity: item.quantity,
          unit: item.unit,
          cost_at_create: item.cost_at_create,
        }))

        const { error: itemsError } = await supabase
          .from('recipe_items')
          .insert(newItems)

        if (itemsError) throw itemsError
      }

      return newRecipe as Recipe
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export function useAddRecipeItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: Database['public']['Tables']['recipe_items']['Insert']) => {
      const { data, error } = await supabase
        .from('recipe_items')
        .insert(item)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['recipe', vars.recipe_id] })
    },
  })
}

export function useRemoveRecipeItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, recipeId }: { id: string; recipeId: string }) => {
      const { error } = await supabase
        .from('recipe_items')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['recipe', vars.recipeId] })
    },
  })
}
