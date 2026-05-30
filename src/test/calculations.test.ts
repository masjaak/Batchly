import { describe, it, expect } from 'vitest'
import { calculateRecipeCost, calculateSaleProfit } from '@/lib/calculations'

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
