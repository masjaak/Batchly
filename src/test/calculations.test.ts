import { describe, it, expect } from 'vitest'
import { calculateRecipeCost, calculateSaleProfit, calculateBatchCostVariance, findCheaperAlternatives, calculateWeeklyComparison, getTopProducts } from '@/lib/calculations'

describe('calculateRecipeCost', () => {
  const recipe = {
    overhead_pct: 10,
    packaging_cost: 5000,
    selling_price: 85000,
    yield_amount: 24,
    yield_unit: 'pcs',
  }

  const items = [
    { quantity: 2, cost_at_create: 12000 },  // Tepung: 2 * 12000 = 24000
    { quantity: 1, cost_at_create: 15000 },  // Gula: 1 * 15000 = 15000
    { quantity: 6, cost_at_create: 2500 },   // Telur: 6 * 2500 = 15000
  ]

  it('calculates production cost as sum of item costs', () => {
    const result = calculateRecipeCost(recipe, items)
    expect(result.productionCost).toBe(54000)
  })

  it('calculates overhead as percentage of production cost', () => {
    const result = calculateRecipeCost(recipe, items)
    expect(result.overheadCost).toBe(5400)
  })

  it('calculates total HPP including packaging', () => {
    const result = calculateRecipeCost(recipe, items)
    expect(result.totalHpp).toBe(64400)
  })

  it('calculates per-unit HPP', () => {
    const result = calculateRecipeCost(recipe, items)
    expect(result.perUnitHpp).toBeCloseTo(2683.33, 1)
  })

  it('calculates margin percentage', () => {
    const result = calculateRecipeCost(recipe, items)
    expect(result.margin).toBeCloseTo(24.24, 1)
  })

  it('handles zero yield amount without crashing', () => {
    const result = calculateRecipeCost({ ...recipe, yield_amount: 0 }, items)
    expect(result.perUnitHpp).toBe(0)
  })

  it('handles zero selling price', () => {
    const result = calculateRecipeCost({ ...recipe, selling_price: 0 }, items)
    expect(result.margin).toBe(0)
  })

  it('handles empty ingredients list', () => {
    const result = calculateRecipeCost(recipe, [])
    expect(result.productionCost).toBe(0)
    expect(result.totalHpp).toBe(5000) // only packaging
  })

  it('handles negative margin when selling price below cost', () => {
    const result = calculateRecipeCost({ ...recipe, selling_price: 50000 }, items)
    expect(result.margin).toBeLessThan(0)
  })
})

describe('calculateBatchCostVariance', () => {
  const recipe = {
    overhead_pct: 10,
    packaging_cost: 5000,
    selling_price: 85000,
    yield_amount: 24,
  }

  const items = [
    { quantity: 2, cost_at_create: 12000, ingredient_name: 'Tepung Terigu' },
    { quantity: 1, cost_at_create: 15000, ingredient_name: 'Gula Pasir' },
    { quantity: 6, cost_at_create: 2500, ingredient_name: 'Telur' },
  ]

  it('calculates planned vs actual cost with same qty', () => {
    const result = calculateBatchCostVariance(recipe, items, 24, 24)
    expect(result.plannedCost).toBeCloseTo(64400, 0)
    expect(result.actualCost).toBeCloseTo(64400, 0)
    expect(result.variance).toBe(0)
    expect(result.variancePct).toBe(0)
  })

  it('calculates variance when actual qty differs from planned', () => {
    const result = calculateBatchCostVariance(recipe, items, 24, 48)
    expect(result.plannedCost).toBeCloseTo(64400, 0) // planned for 24
    expect(result.actualCost).toBeCloseTo(123800, 0) // actual for 48 (packaging is fixed per batch)
    expect(result.variance).toBeCloseTo(59400, 0)
  })

  it('shows favorable variance (negative) when actual qty < planned', () => {
    const result = calculateBatchCostVariance(recipe, items, 24, 12)
    expect(result.actualCost).toBeLessThan(result.plannedCost)
    expect(result.variance).toBeLessThan(0)
  })

  it('returns per-ingredient breakdown with expected quantities', () => {
    const result = calculateBatchCostVariance(recipe, items, 24, 48)
    expect(result.ingredients).toHaveLength(3)
    expect(result.ingredients[0].name).toBe('Tepung Terigu')
    expect(result.ingredients[0].plannedQty).toBe(2)  // 2kg for 24 pcs
    expect(result.ingredients[0].actualQty).toBe(4)    // 4kg for 48 pcs
  })

  it('handles planned_qty = 0 without crashing', () => {
    const result = calculateBatchCostVariance(recipe, items, 0, 24)
    expect(result.plannedCost).toBe(5000) // packaging is fixed per batch
    expect(typeof result.variancePct).toBe('number')
  })

  it('handles empty items', () => {
    const result = calculateBatchCostVariance(recipe, [], 24, 24)
    expect(result.plannedCost).toBe(5000) // only packaging
    expect(result.actualCost).toBe(5000)
    expect(result.ingredients).toHaveLength(0)
  })

  it('handles zero yield amount', () => {
    const result = calculateBatchCostVariance({ ...recipe, yield_amount: 0 }, items, 24, 24)
    expect(result.plannedCost).toBe(0)
    expect(result.actualCost).toBe(0)
  })
})

describe('calculateSaleProfit', () => {
  it('calculates revenue, HPP, profit, and margin', () => {
    const result = calculateSaleProfit(85000, 10, 2683.33)
    expect(result.revenue).toBe(850000)
    expect(result.totalHpp).toBeCloseTo(26833.3, 1)
    expect(result.grossProfit).toBeCloseTo(823166.7, 1)
    expect(result.margin).toBeCloseTo(96.84, 1)
  })

  it('handles zero quantity', () => {
    const result = calculateSaleProfit(85000, 0, 2683.33)
    expect(result.revenue).toBe(0)
    expect(result.grossProfit).toBe(0)
  })
})

describe('findCheaperAlternatives', () => {
  const all = [
    { id: 'i1', name: 'Tepung Segitiga', unit: 'kg', latest_price: 15000, category: { name: 'Bahan Baku' } },
    { id: 'i2', name: 'Tepung Cakra', unit: 'kg', latest_price: 18000, category: { name: 'Bahan Baku' } },
    { id: 'i3', name: 'Tepung Kunci', unit: 'kg', latest_price: 12000, category: { name: 'Bahan Baku' } },
    { id: 'i4', name: 'Gula Pasir', unit: 'kg', latest_price: 16000, category: { name: 'Bahan Baku' } },
    { id: 'i5', name: 'Vanili Bubuk', unit: 'sdt', latest_price: 5000, category: { name: 'Bumbu' } },
  ]

  it('finds cheaper alternatives in same category', () => {
    const result = findCheaperAlternatives('i2', 'Bahan Baku', 18000, all)
    expect(result).toHaveLength(3)
    expect(result[0].name).toBe('Tepung Kunci')
    expect(result[0].savingsPerUnit).toBe(6000)
  })

  it('returns empty if no category', () => {
    const result = findCheaperAlternatives('i1', null, 15000, all)
    expect(result).toHaveLength(0)
  })

  it('excludes the ingredient itself', () => {
    const result = findCheaperAlternatives('i3', 'Bahan Baku', 12000, all)
    expect(result.find((r) => r.ingredientId === 'i3')).toBeUndefined()
  })

  it('returns empty if no cheaper alternative exists', () => {
    const result = findCheaperAlternatives('i3', 'Bahan Baku', 12000, all)
    expect(result).toHaveLength(0)
  })

  it('returns empty for ingredients in a different category', () => {
    const result = findCheaperAlternatives('i5', 'Bumbu', 5000, all)
    expect(result).toHaveLength(0) // only one in Bumbu
  })
})

describe('calculateWeeklyComparison', () => {
  const today = new Date()
  const thisWeek = today.toISOString().split('T')[0]
  const lastWeek = new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0]
  const twoWeeksAgo = new Date(today.getTime() - 14 * 86400000).toISOString().split('T')[0]

  it('compares current week vs last week', () => {
    const sales = [
      { sale_date: thisWeek, quantity: 10, unit_price: 50000 },
      { sale_date: lastWeek, quantity: 5, unit_price: 40000 },
    ]
    const result = calculateWeeklyComparison(sales)
    expect(result.currentWeekRevenue).toBe(500000)
    expect(result.prevWeekRevenue).toBe(200000)
    expect(result.changePct).toBe(150)
  })

  it('handles no sales this week', () => {
    const sales = [
      { sale_date: lastWeek, quantity: 5, unit_price: 40000 },
    ]
    const result = calculateWeeklyComparison(sales)
    expect(result.currentWeekRevenue).toBe(0)
    expect(result.changePct).toBe(-100)
  })

  it('handles no sales last week', () => {
    const sales = [
      { sale_date: thisWeek, quantity: 10, unit_price: 50000 },
    ]
    const result = calculateWeeklyComparison(sales)
    expect(result.currentWeekRevenue).toBe(500000)
    expect(result.prevWeekRevenue).toBe(0)
    expect(result.changePct).toBe(100)
  })

  it('handles empty sales', () => {
    const result = calculateWeeklyComparison([])
    expect(result.currentWeekRevenue).toBe(0)
    expect(result.prevWeekRevenue).toBe(0)
    expect(result.changePct).toBe(0)
  })
})

describe('getTopProducts', () => {
  const products = [
    { id: 'p1', name: 'Brownies' },
    { id: 'p2', name: 'Cold Brew' },
    { id: 'p3', name: 'Donat' },
  ]

  it('returns top products by revenue', () => {
    const sales = [
      { product_id: 'p1', quantity: 10, unit_price: 50000 },
      { product_id: 'p2', quantity: 20, unit_price: 25000 },
      { product_id: 'p3', quantity: 5, unit_price: 10000 },
    ]
    const result = getTopProducts(sales, products, 2)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Brownies')
    expect(result[0].revenue).toBe(500000)
  })

  it('handles empty sales', () => {
    const result = getTopProducts([], products)
    expect(result).toHaveLength(0)
  })
})
