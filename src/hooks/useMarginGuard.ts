import { useMemo } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useIngredients } from '@/hooks/useIngredients'
import { analyzeProductMargins, profitHealthScore } from '@/lib/calculations'

export function useMarginGuard(targetMargin = 30) {
  const { data: products } = useProducts()
  const { data: ingredients } = useIngredients()

  return useMemo(() => {
    const priceMap: Record<string, number> = {}
    ;(ingredients ?? []).forEach((i: any) => { priceMap[i.id] = i.latest_price })
    const insights = analyzeProductMargins(products ?? [], priceMap, targetMargin)
    return {
      insights,
      score: profitHealthScore(insights),
      lossCount: insights.filter((i) => i.status === 'loss').length,
      riskCount: insights.filter((i) => i.status === 'risk').length,
    }
  }, [products, ingredients, targetMargin])
}
