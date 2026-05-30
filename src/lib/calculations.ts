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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
