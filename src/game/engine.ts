import type { AssetClass, Debt, GameState, LifeStage } from './types'
import { clamp } from './format'

export const STAGES: LifeStage[] = [
  'highSchool',
  'college',
  'firstJob',
  'careerGrowth',
  'entrepreneurship',
]

export const STAGE_LABEL: Record<LifeStage, string> = {
  highSchool: 'High School',
  college: 'College / Training',
  firstJob: 'First Job',
  careerGrowth: 'Career Growth',
  entrepreneurship: 'Entrepreneurship',
}

// ---- Income & taxes ----------------------------------------------------

export const jobMonthlyGross = (
  hourlyWage: number,
  hoursPerWeek: number,
): number => (hourlyWage * hoursPerWeek * 52) / 12

/** Very simplified progressive-ish effective tax on annual gross. */
export const effectiveTaxRate = (annualGross: number): number => {
  if (annualGross <= 14000) return 0.0765 // FICA only, under standard deduction
  if (annualGross <= 30000) return 0.14
  if (annualGross <= 55000) return 0.19
  if (annualGross <= 90000) return 0.24
  return 0.29
}

export interface Paycheck {
  gross: number
  fica: number
  federal: number
  state: number
  net: number
}

export const computePaycheck = (monthlyGross: number): Paycheck => {
  const annual = monthlyGross * 12
  const rate = effectiveTaxRate(annual)
  const fica = monthlyGross * 0.0765
  const remaining = monthlyGross * rate - fica
  const federal = Math.max(0, remaining * 0.7)
  const state = Math.max(0, remaining * 0.3)
  const net = monthlyGross - fica - federal - state
  return { gross: monthlyGross, fica, federal, state, net }
}

// ---- Living expenses ---------------------------------------------------

const BASE_LIVING: Record<LifeStage, number> = {
  highSchool: 120,
  college: 380,
  firstJob: 620,
  careerGrowth: 780,
  entrepreneurship: 720,
}

export interface ExpenseBreakdown {
  rent: number
  transport: number
  living: number
  debt: number
  total: number
}

export const monthlyExpenses = (state: GameState): ExpenseBreakdown => {
  const rent = state.housing?.monthlyRent ?? 0
  const transport = state.transport?.monthlyCost ?? 0
  const living = BASE_LIVING[state.stage]
  const debt = state.debts.reduce((s, d) => s + d.minPayment, 0)
  return { rent, transport, living, debt, total: rent + transport + living + debt }
}

export const monthlyNetIncome = (state: GameState): number => {
  if (!state.job) return state.monthlyStipend
  const gross = jobMonthlyGross(state.job.hourlyWage, state.job.hoursPerWeek)
  return computePaycheck(gross).net + state.monthlyStipend
}

// ---- Debt --------------------------------------------------------------

export const minPaymentFor = (balance: number, apr: number, type: string): number => {
  if (type === 'creditCard') return Math.max(25, balance * 0.03)
  // amortized-ish floor for installment loans
  const monthlyRate = apr / 12
  const n = type === 'studentLoan' ? 120 : 60
  if (monthlyRate === 0) return balance / n
  const p =
    (balance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n))
  return Math.max(25, p)
}

// ---- Credit score ------------------------------------------------------

export const creditUtilization = (state: GameState): number => {
  const cc = state.debts.find((d) => d.type === 'creditCard')
  if (!cc) return 0
  const limit = Math.max(cc.originalBalance, 500)
  return clamp(cc.balance / limit, 0, 1)
}

export const recomputeCreditScore = (state: GameState): number => {
  let score = 580
  score += Math.min(state.creditHistoryMonths, 60) * 1.5 // length of history
  score += state.onTimePayments * 4
  score -= state.missedPayments * 45
  const util = creditUtilization(state)
  if (state.debts.some((d) => d.type === 'creditCard')) {
    score -= util * 160
    if (util < 0.1) score += 25
  }
  const totalDebt = state.debts.reduce((s, d) => s + d.balance, 0)
  const income = monthlyNetIncome(state) * 12
  if (income > 0) {
    const dti = totalDebt / income
    score -= clamp(dti, 0, 1.5) * 60
  }
  if (state.holdings.length > 0) score += 8
  return clamp(Math.round(score), 300, 850)
}

// ---- Investing ---------------------------------------------------------

export interface AssetInfo {
  key: AssetClass
  name: string
  meanMonthly: number
  volatility: number
  risk: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'
  blurb: string
  color: string
}

export const ASSETS: Record<AssetClass, AssetInfo> = {
  hysa: {
    key: 'hysa',
    name: 'High-Yield Savings',
    meanMonthly: 0.043 / 12,
    volatility: 0,
    risk: 'Very Low',
    blurb: 'Safe, liquid, guaranteed interest. Barely beats inflation.',
    color: '#38bdf8',
  },
  bond: {
    key: 'bond',
    name: 'Bond Fund',
    meanMonthly: 0.05 / 12,
    volatility: 0.012,
    risk: 'Low',
    blurb: 'Lends money to governments/companies. Steady, small swings.',
    color: '#a78bfa',
  },
  index: {
    key: 'index',
    name: 'S&P 500 Index Fund',
    meanMonthly: 0.09 / 12,
    volatility: 0.042,
    risk: 'Medium',
    blurb: 'Owns 500 big companies at once — instant diversification.',
    color: '#34d399',
  },
  stock: {
    key: 'stock',
    name: 'Single Stock',
    meanMonthly: 0.11 / 12,
    volatility: 0.11,
    risk: 'High',
    blurb: 'One company. Big upside, but no diversification cushion.',
    color: '#fbbf24',
  },
  crypto: {
    key: 'crypto',
    name: 'Crypto',
    meanMonthly: 0.13 / 12,
    volatility: 0.26,
    risk: 'Very High',
    blurb: 'Extremely volatile. Only risk what you can afford to lose.',
    color: '#fb7185',
  },
}

const gaussian = (): number => {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** Returns the monthly return multiplier for an asset. */
export const monthlyReturn = (asset: AssetClass): number => {
  const info = ASSETS[asset]
  return info.meanMonthly + gaussian() * info.volatility
}

export const portfolioValue = (state: GameState): number =>
  state.holdings.reduce((s, h) => s + h.value, 0)

export const portfolioInvested = (state: GameState): number =>
  state.holdings.reduce((s, h) => s + h.invested, 0)

// ---- Net worth & health ------------------------------------------------

export const netWorth = (state: GameState): number => {
  const assets = state.cash + state.savings + portfolioValue(state)
  const liabilities = state.debts.reduce((s, d) => s + d.balance, 0)
  return assets - liabilities
}

export const emergencyMonths = (state: GameState): number => {
  const exp = monthlyExpenses(state).total || 1
  return (state.savings + state.cash) / exp
}

/** Composite Financial Health 0-100. */
export const financialHealth = (state: GameState): number => {
  let score = 0
  // Emergency fund (30)
  score += clamp(emergencyMonths(state) / 3, 0, 1) * 30
  // Debt load (25)
  const income = monthlyNetIncome(state)
  const debtPmt = state.debts.reduce((s, d) => s + d.minPayment, 0)
  const dtiRatio = income > 0 ? debtPmt / income : 1
  score += (1 - clamp(dtiRatio / 0.4, 0, 1)) * 25
  // Credit (20)
  score += clamp((state.creditScore - 300) / 550, 0, 1) * 20
  // Savings rate proxy via investing (15)
  score += clamp(portfolioValue(state) / (income * 6 || 1), 0, 1) * 15
  // Cash solvency (10)
  score += state.cash >= 0 ? 10 : 0
  return Math.round(clamp(score, 0, 100))
}

export const healthLabel = (h: number): { label: string; tone: string } => {
  if (h >= 80) return { label: 'Thriving', tone: 'good' }
  if (h >= 60) return { label: 'Stable', tone: 'good' }
  if (h >= 40) return { label: 'Getting By', tone: 'warn' }
  if (h >= 20) return { label: 'Strained', tone: 'warn' }
  return { label: 'In Crisis', tone: 'bad' }
}

// ---- XP / level --------------------------------------------------------

export const levelFromXp = (xp: number): number => Math.floor(Math.sqrt(xp / 40)) + 1

export const xpForLevel = (level: number): number => Math.pow(level - 1, 2) * 40

export const skillLabel = (points: number): string => {
  const lvl = Math.min(5, Math.floor(points / 100) + (points > 0 ? 1 : 0))
  return ['Novice', 'Learner', 'Capable', 'Skilled', 'Expert', 'Master'][lvl] ?? 'Novice'
}

export const skillLevel = (points: number): number =>
  Math.min(5, points > 0 ? Math.floor(points / 100) + 1 : 0)

// ---- Recovery ----------------------------------------------------------

export const inCrisis = (state: GameState): boolean =>
  state.cash < -50 || financialHealth(state) < 15

export const debtLabel: Record<Debt['type'], string> = {
  creditCard: 'Credit Card',
  studentLoan: 'Student Loan',
  autoLoan: 'Auto Loan',
  personal: 'Personal Loan',
}
