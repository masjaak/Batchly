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
