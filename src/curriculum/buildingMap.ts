import type { BuildingId } from './types'

/**
 * Building hosts for the 21-unit curriculum (prior mapping decision):
 * College = econ foundations; Bank = money/credit; Office = work/invest/tax;
 * Grocery = budgeting & consumer skills; Home = protection & major life costs.
 */
export const UNIT_BUILDING: Record<number, BuildingId> = {
  1: 'college',
  2: 'college',
  3: 'college',
  4: 'college',
  5: 'college',
  6: 'bank',
  7: 'bank',
  8: 'bank',
  9: 'bank',
  10: 'bank',
  11: 'office',
  12: 'grocery',
  13: 'grocery',
  14: 'office',
  15: 'office',
  16: 'office',
  17: 'home',
  18: 'home',
  19: 'home',
  20: 'grocery',
  21: 'home',
}

export const BUILDING_LABEL: Record<BuildingId, string> = {
  home: 'Home',
  bank: 'FirstCity Bank',
  college: 'Merridian College',
  grocery: 'FreshMart Grocery',
  office: 'Summit Office',
}
