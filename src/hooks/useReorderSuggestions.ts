import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export interface ReorderSuggestion {
  ingredientId: string
  name: string
  unit: string
  currentStock: number
  minStockLevel: number
  urgency: number // current_stock / min_stock_level (lower = more urgent)
  lastSupplierId: string | null
  lastSupplierName: string | null
  lastPrice: number
  lastPurchaseDate: string | null
}

export function useReorderSuggestions() {
  const { organization } = useAuth()

  return useQuery({
    queryKey: ['reorder_suggestions', organization?.id],
    queryFn: async () => {
      if (!organization) return []

      // Get low stock ingredients
      const { data: lowStock, error: ingError } = await supabase
        .from('ingredients')
        .select('id, name, unit, current_stock, min_stock_level, latest_price')
        .eq('organization_id', organization.id)
        .is('deleted_at', null)
        .lte('current_stock', 'min_stock_level') // Using string since column references differ
        .order('name')

      if (ingError) throw ingError

      if (!lowStock || lowStock.length === 0) return []

      // For each, get last stock-in transaction for supplier info
      const ingredientIds = lowStock.map((i: any) => i.id)

      const { data: lastTransactions } = await supabase
        .from('inventory_transactions')
        .select('ingredient_id, unit_price, supplier:suppliers(id, name), transaction_date')
        .eq('organization_id', organization.id)
        .eq('type', 'in')
        .in('ingredient_id', ingredientIds)
        .not('supplier_id', 'is', null)
        .order('transaction_date', { ascending: false })

      const txByIngredient = new Map<string, any>()
      lastTransactions?.forEach((tx: any) => {
        if (!txByIngredient.has(tx.ingredient_id)) {
          txByIngredient.set(tx.ingredient_id, tx)
        }
      })

      const suggestions: ReorderSuggestion[] = lowStock.map((ing: any) => {
        const lastTx = txByIngredient.get(ing.id)
        return {
          ingredientId: ing.id,
          name: ing.name,
          unit: ing.unit,
          currentStock: ing.current_stock,
          minStockLevel: ing.min_stock_level,
          urgency: ing.min_stock_level > 0 ? ing.current_stock / ing.min_stock_level : 0,
          lastSupplierId: lastTx?.supplier?.id ?? null,
          lastSupplierName: lastTx?.supplier?.name ?? null,
          lastPrice: lastTx?.unit_price ?? ing.latest_price,
          lastPurchaseDate: lastTx?.transaction_date ?? null,
        }
      })

      return suggestions.sort((a, b) => a.urgency - b.urgency)
    },
    enabled: !!organization,
  })
}
