import { WeightUnit } from './types'

export const LB_PER_KG = 2.20462

/** Convert a canonical kg value to the user's display unit. */
export function dispWeight(kg: number, unit: WeightUnit): number {
  const v = unit === 'lb' ? kg * LB_PER_KG : kg
  return Math.round(v * 10) / 10
}
/** Convert a value the user typed (in their unit) back to canonical kg. */
export function toKg(value: number, unit: WeightUnit): number {
  return unit === 'lb' ? value / LB_PER_KG : value
}
export function wLabel(unit: WeightUnit): string {
  return unit
}
