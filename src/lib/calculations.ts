export interface RecipeCostInput {
  overhead_pct: number
  packaging_cost: number
  selling_price: number
  yield_amount: number
}

export interface RecipeCostItem {
  quantity: number
  cost_at_create: number
}

export interface RecipeCostResult {
  productionCost: number
  overheadCost: number
  packagingCost: number
  totalHpp: number
  perUnitHpp: number
  margin: number
}

export function calculateRecipeCost(
  recipe: RecipeCostInput,
  items: RecipeCostItem[],
): RecipeCostResult {
  const productionCost = items.reduce(
    (sum, item) => sum + item.quantity * item.cost_at_create,
    0,
  )

  const overheadCost = productionCost * (recipe.overhead_pct / 100)
  const totalHpp = productionCost + overheadCost + recipe.packaging_cost
  const perUnitHpp = recipe.yield_amount > 0 ? totalHpp / recipe.yield_amount : 0
  const margin =
    recipe.selling_price > 0
      ? ((recipe.selling_price - totalHpp) / recipe.selling_price) * 100
      : 0

  return { productionCost, overheadCost, packagingCost: recipe.packaging_cost, totalHpp, perUnitHpp, margin }
}

export function calculateSaleProfit(
  unitPrice: number,
  quantity: number,
  perUnitHpp: number,
) {
  const revenue = unitPrice * quantity
  const totalHpp = perUnitHpp * quantity
  const grossProfit = revenue - totalHpp
  const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0

  return { revenue, totalHpp, grossProfit, margin }
}

export interface BatchVarianceItem {
  name: string
  plannedQty: number
  actualQty: number
  plannedCost: number
  actualCost: number
  costAtCreate: number
}

export interface BatchVarianceResult {
  plannedCost: number
  actualCost: number
  variance: number
  variancePct: number
  ingredients: BatchVarianceItem[]
}

export function calculateBatchCostVariance(
  recipe: RecipeCostInput,
  items: (RecipeCostItem & { ingredient_name?: string })[],
  plannedQty: number,
  actualQty: number,
): BatchVarianceResult {
  if (recipe.yield_amount === 0) {
    return { plannedCost: 0, actualCost: 0, variance: 0, variancePct: 0, ingredients: [] }
  }

  const scaleFactorPlanned = recipe.yield_amount > 0 ? plannedQty / recipe.yield_amount : 0
  const scaleFactorActual = recipe.yield_amount > 0 ? actualQty / recipe.yield_amount : 0

  const productionCostPlanned = items.reduce(
    (sum, item) => sum + item.quantity * item.cost_at_create * scaleFactorPlanned,
    0,
  )
  const productionCostActual = items.reduce(
    (sum, item) => sum + item.quantity * item.cost_at_create * scaleFactorActual,
    0,
  )

  const overheadPlanned = productionCostPlanned * (recipe.overhead_pct / 100)
  const overheadActual = productionCostActual * (recipe.overhead_pct / 100)

  const plannedCost = productionCostPlanned + overheadPlanned + recipe.packaging_cost
  const actualCost = productionCostActual + overheadActual + recipe.packaging_cost

  const variance = actualCost - plannedCost
  const variancePct = plannedCost > 0 ? (variance / plannedCost) * 100 : 0

  const ingredients: BatchVarianceItem[] = items.map((item) => ({
    name: item.ingredient_name ?? '',
    plannedQty: item.quantity * scaleFactorPlanned,
    actualQty: item.quantity * scaleFactorActual,
    plannedCost: item.quantity * item.cost_at_create * scaleFactorPlanned,
    actualCost: item.quantity * item.cost_at_create * scaleFactorActual,
    costAtCreate: item.cost_at_create,
  }))

  return { plannedCost, actualCost, variance, variancePct, ingredients }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ── Margin Guard: profitability intelligence (USP) ──────────────
export interface ProductMarginInsight {
  productId: string
  name: string
  sellingPrice: number
  lockedHpp: number // HPP saat resep dibuat
  currentHpp: number // HPP dengan harga bahan terkini
  currentMargin: number // % margin terkini
  costDriftPct: number // kenaikan HPP vs saat dibuat
  status: 'loss' | 'risk' | 'healthy'
  suggestedPrice: number // harga untuk capai target margin
}

export function suggestPrice(hpp: number, targetMarginPct: number): number {
  if (targetMarginPct >= 100) return hpp * 2
  return Math.ceil(hpp / (1 - targetMarginPct / 100) / 500) * 500 // bulatkan ke Rp500
}

export function analyzeProductMargins(
  products: any[],
  priceMap: Record<string, number>,
  targetMargin = 30,
): ProductMarginInsight[] {
  return products
    .filter((p) => p.recipe)
    .map((p) => {
      const recipe = p.recipe
      const items = recipe.recipe_items ?? []
      const lockedHpp = calculateRecipeCost(recipe, items.map((i: any) => ({ quantity: i.quantity, cost_at_create: i.cost_at_create }))).perUnitHpp
      const currentHpp = calculateRecipeCost(recipe, items.map((i: any) => ({ quantity: i.quantity, cost_at_create: priceMap[i.ingredient_id] ?? i.cost_at_create }))).perUnitHpp
      const sellingPrice = p.default_price || recipe.selling_price || 0
      const currentMargin = sellingPrice > 0 ? ((sellingPrice - currentHpp) / sellingPrice) * 100 : 0
      const costDriftPct = lockedHpp > 0 ? ((currentHpp - lockedHpp) / lockedHpp) * 100 : 0
      const status: ProductMarginInsight['status'] = currentMargin < 0 ? 'loss' : currentMargin < targetMargin ? 'risk' : 'healthy'
      return {
        productId: p.id,
        name: p.name,
        sellingPrice,
        lockedHpp,
        currentHpp,
        currentMargin,
        costDriftPct,
        status,
        suggestedPrice: suggestPrice(currentHpp, targetMargin),
      }
    })
    .sort((a, b) => a.currentMargin - b.currentMargin)
}

export function profitHealthScore(insights: ProductMarginInsight[]): number {
  if (insights.length === 0) return 100
  const healthy = insights.filter((i) => i.status === 'healthy').length
  const loss = insights.filter((i) => i.status === 'loss').length
  return Math.round(Math.max(0, ((healthy - loss) / insights.length) * 100))
}

export interface CheaperAlternative {
  ingredientId: string
  name: string
  unit: string
  price: number
  savingsPerUnit: number
}

export function findCheaperAlternatives(
  ingredientId: string,
  categoryName: string | null,
  price: number,
  allIngredients: { id: string; name: string; unit: string; latest_price: number; category?: { name: string } | null }[],
  limit = 3,
): CheaperAlternative[] {
  if (!categoryName) return []

  return allIngredients
    .filter((i) => i.id !== ingredientId && i.category?.name === categoryName && i.latest_price > 0 && i.latest_price < price)
    .map((i) => ({
      ingredientId: i.id,
      name: i.name,
      unit: i.unit,
      price: i.latest_price,
      savingsPerUnit: price - i.latest_price,
    }))
    .sort((a, b) => b.savingsPerUnit - a.savingsPerUnit)
    .slice(0, limit)
}

export function calculatePotentialSavings(
  currentCost: number,
  alternativeCost: number,
  recipeQty: number,
): number {
  return (currentCost - alternativeCost) * recipeQty
}

export interface WeeklyComparison {
  currentWeekRevenue: number
  prevWeekRevenue: number
  changePct: number
  currentWeekCount: number
  prevWeekCount: number
}

export function calculateWeeklyComparison(sales: { sale_date: string; quantity: number; unit_price: number }[]): WeeklyComparison {
  const now = new Date()
  const currentStart = new Date(now)
  currentStart.setDate(now.getDate() - now.getDay()) // Start of current week (Sunday)
  currentStart.setHours(0, 0, 0, 0)

  const prevStart = new Date(currentStart)
  prevStart.setDate(prevStart.getDate() - 7)
  const prevEnd = new Date(currentStart)

  let currentWeekRevenue = 0
  let prevWeekRevenue = 0
  let currentWeekCount = 0
  let prevWeekCount = 0

  sales.forEach((s) => {
    const d = new Date(s.sale_date)
    const revenue = s.quantity * s.unit_price

    if (d >= prevStart && d < prevEnd) {
      prevWeekRevenue += revenue
      prevWeekCount += s.quantity
    } else if (d >= currentStart) {
      currentWeekRevenue += revenue
      currentWeekCount += s.quantity
    }
  })

  const changePct = prevWeekRevenue > 0
    ? ((currentWeekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100
    : currentWeekRevenue > 0 ? 100 : 0

  return { currentWeekRevenue, prevWeekRevenue, changePct, currentWeekCount, prevWeekCount }
}

export function getTopProducts(
  sales: { product_id: string; quantity: number; unit_price: number }[],
  products: { id: string; name: string }[],
  n = 5,
): { productId: string; name: string; revenue: number; quantity: number }[] {
  const revenueMap = new Map<string, { revenue: number; quantity: number }>()

  sales.forEach((s) => {
    const existing = revenueMap.get(s.product_id) ?? { revenue: 0, quantity: 0 }
    revenueMap.set(s.product_id, {
      revenue: existing.revenue + s.quantity * s.unit_price,
      quantity: existing.quantity + s.quantity,
    })
  })

  return Array.from(revenueMap.entries())
    .map(([productId, data]) => ({
      productId,
      name: products.find((p) => p.id === productId)?.name ?? 'Unknown',
      ...data,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, n)
}
