import type { CharacterAppearance, LifeGoalId, Mission, NpcRelation, Season, Skills } from './types'
import { DEFAULT_APPEARANCE, DEFAULT_SKILLS } from './types'

export const SAVE_KEY = 'beyond-the-dollar-save-v1'

/** Serializable slice of game state for localStorage. */
export interface SaveBlob {
  version: 1
  savedAt: number
  characterCreated: boolean
  playerName: string
  playerAge: number
  appearance: CharacterAppearance
  goals: LifeGoalId[]
  lifeLevel: number
  xp: number
  skills: Skills
  relationships: Record<string, NpcRelation>
  missions: Mission[]
  discoveredLocations: string[]
  achievements: Record<string, number | null>
  decisions: string[]
  season: Season
  cash: number
  bank: number
  savings: number
  weeklyIncome: number
  monthlyExpenses: number
  creditScore: number
  creditEstablished: boolean
  debt: number
  education: string
  career: string
  transportationAvailable: boolean
  hasCheckingAccount: boolean
  hasCreditCard: boolean
  hasJob: number | boolean
  incomeFactor: number
  incomeFactorUntil: number
  nextPaydayAt: number
  completedTopicIds: string[]
  unlockedUnitNumber: number
  totalMinutes: number
  timeScale: number
  firedTriggerIds: string[]
  engagedScenarioIds: string[]
  recurringBills: unknown[]
  dueBillIds: string[]
  nextRandomExpenseAt: number
  randomExpenseCount: number
  assetPrices: Record<string, number>
  holdings: { stock: number; bond: number }
  lastPriceDayIndex: number
  investingIntroSeen: boolean
  paystubs: unknown[]
  ledger: unknown[]
  carStatus: string
  homeStatus: string
  scene: string
  firstDayStarted: boolean
}

export function emptyLifeDefaults() {
  return {
    characterCreated: false,
    playerName: '',
    playerAge: 18,
    appearance: { ...DEFAULT_APPEARANCE },
    goals: [] as LifeGoalId[],
    lifeLevel: 1,
    xp: 0,
    skills: { ...DEFAULT_SKILLS },
    relationships: {} as Record<string, NpcRelation>,
    missions: [] as Mission[],
    discoveredLocations: [] as string[],
    achievements: {} as Record<string, number | null>,
    decisions: [] as string[],
    season: 'summer' as Season,
    firstDayStarted: false,
  }
}

export function loadSave(): SaveBlob | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SaveBlob
    if (parsed?.version !== 1 || !parsed.characterCreated) return null
    return parsed
  } catch {
    return null
  }
}

export function writeSave(blob: SaveBlob) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(blob))
  } catch {
    /* quota / private mode */
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    /* ignore */
  }
}
