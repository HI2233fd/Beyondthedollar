export type LifeStage =
  | 'highSchool'
  | 'college'
  | 'firstJob'
  | 'careerGrowth'
  | 'entrepreneurship'

export type SkillKey =
  | 'budgeting'
  | 'saving'
  | 'credit'
  | 'investing'
  | 'career'
  | 'debt'

export type DebtType = 'creditCard' | 'studentLoan' | 'autoLoan' | 'personal'

export interface Character {
  name: string
  avatar: string
  pronouns: string
  trait: string
}

export interface Job {
  id: string
  title: string
  employer: string
  hourlyWage: number
  hoursPerWeek: number
  stage: LifeStage
  requiresConcept?: string
  benefits?: string
}

export interface Housing {
  id: string
  name: string
  district: string
  monthlyRent: number
  quality: number
  deposit: number
  description: string
}

export interface Transport {
  id: string
  name: string
  type: 'transit' | 'used' | 'new' | 'none'
  price: number
  monthlyCost: number
  reliability: number
  description: string
}

export interface Debt {
  id: string
  type: DebtType
  name: string
  balance: number
  apr: number
  minPayment: number
  originalBalance: number
}

export type AssetClass = 'hysa' | 'bond' | 'index' | 'stock' | 'crypto'

export interface Holding {
  asset: AssetClass
  value: number
  invested: number
}

export interface LedgerEntry {
  id: string
  month: number
  label: string
  amount: number
  category: string
}

export interface TimelineEvent {
  id: string
  month: number
  stage: LifeStage
  title: string
  detail: string
  icon: string
  tone: 'good' | 'bad' | 'neutral' | 'milestone'
}

export interface GameState {
  started: boolean
  onboardingStep: 'welcome' | 'character' | 'setup' | 'done'
  character: Character
  stage: LifeStage
  month: number
  age: number

  cash: number
  savings: number

  job: Job | null
  sideHustle: string | null
  housing: Housing | null
  transport: Transport | null

  debts: Debt[]
  creditScore: number
  creditHistoryMonths: number
  onTimePayments: number
  missedPayments: number

  holdings: Holding[]

  xp: number
  skills: Record<SkillKey, number>
  knownConcepts: string[]
  unlockedAchievements: string[]
  challengeProgress: Record<string, number>
  completedChallenges: string[]

  stress: number
  netWorthHistory: { month: number; netWorth: number }[]
  ledger: LedgerEntry[]
  timeline: TimelineEvent[]

  seenEvents: string[]
  pendingEventId: string | null
  inRecovery: boolean

  monthlyStipend: number
}
