import { create, type StoreApi, type UseBoundStore } from 'zustand'
import { CURRICULUM, unlockedAfterCompleting } from './curriculum'
import {
  backfillEducation,
  buildCheckpoint,
  initialEducation,
  levelTitle,
  markExplainerSeen,
  normalizeEducation,
  recordEvent,
  submitActive,
  unlocksForPassedLevel,
} from './education'
import type { EducationState } from './education/types'
import { MINUTES_PER_DAY, START_TOTAL_MINUTES, stampFromMinutes } from './simulation/time'
import { getScenario, registerRuntimeScenario, type ScenarioStat } from './simulation/scenarios'
import {
  billInDays,
  removeBillsByCategory,
  upsertBill,
  type RecurringBill,
} from './simulation/bills'
import {
  buildRandomExpenseScenario,
  rollNextExpenseAt,
  type ExpenseContext,
} from './simulation/randomExpenses'
import {
  INITIAL_ASSETS,
  stepPrices,
  type AssetId,
  type Holdings,
} from './simulation/investing'
import {
  CAR_CREDIT_MIN,
  CAR_SAVINGS_MIN,
  CREDIT_PRODUCT_MIN,
  CREDIT_SCORE_ON_FILE,
  FIRST_PAYDAY_TOTAL_MINUTES,
  GRADUATION_CASH,
  HOME_CREDIT_MIN,
  HOME_DOWN_PAYMENT,
  INVEST_SAVINGS_MIN,
  OFFICE_HOURLY,
  OFFICE_HOURS_PER_WEEK,
  OFFICE_WEEKLY_GROSS,
  PAYROLL_TAX_RATE,
} from './simulation/progression'
import { HOME_BEDROOM_START } from './cityLayout'
import {
  type CharacterAppearance,
  type LifeGoalId,
  type Mission,
  type NpcRelation,
  type Season,
  type SkillId,
  type Skills,
  DEFAULT_APPEARANCE,
  DEFAULT_SKILLS,
  DOWNTOWN_UNLOCK_LEVEL,
  professionalFromTalks,
  relationTierFromAffinity,
  xpNeededForLevel,
} from './life/types'
import { ACHIEVEMENT_DEFS, createFirstDayMission, createPersonalizedOpportunity } from './life/missions'
import { clearSave, emptyLifeDefaults, loadSave, writeSave, type SaveBlob } from './life/save'
import { computeActivityOptions, type OptionContext } from './life/optionsEngine'
import { buildGoalMilestones, syncGoalMilestonesFromState } from './life/goalChains'
import { normalizeAppearance, type GoalMilestone, type PhoneMessage, type RewardPopup } from './life/characterLook'
import type { ActivityOption } from './life/characterLook'

export type SceneId = 'city' | 'bank' | 'grocery' | 'college' | 'office' | 'home'

export interface DialogueOption {
  label: string
  next?: Dialogue
  action?: () => void
  close?: boolean
}

export interface Dialogue {
  name: string
  text: string
  options: DialogueOption[]
}

export interface CartItem {
  id: string
  name: string
  price: number
}

export interface Spawn {
  pos: [number, number, number]
  yaw: number
}

export type CarStatus = 'none' | 'owned' | 'leased'
export type HomeStatus = 'renting' | 'owned'

export interface Paystub {
  id: string
  atTotalMinutes: number
  employer: string
  gross: number
  tax: number
  net: number
}

export interface LedgerEntry {
  id: string
  atTotalMinutes: number
  label: string
  amount: number
  kind: 'bill' | 'paycheck' | 'expense' | 'interest' | 'late-fee'
  status: 'paid' | 'missed'
}

export const CAR_BUY_DOWN = 2000
export const CAR_LOAN_MONTHLY = 280
export const CAR_LEASE_MONTHLY = 249
export const CAR_INSURANCE_MONTHLY = 110
export const CAR_MAINTENANCE_MONTHLY = 40

export const RENT_MONTHLY = 900
export const MORTGAGE_MONTHLY = 1050
export const PROPERTY_TAX_MONTHLY = 150
export const HOME_MAINTENANCE_MONTHLY = 100

export { HOME_CREDIT_MIN, HOME_DOWN_PAYMENT, INVEST_SAVINGS_MIN, CREDIT_PRODUCT_MIN }

interface GameState {
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

  scene: SceneId
  spawn: Spawn | null
  transitioning: boolean

  prompt: string | null
  dialogue: Dialogue | null

  cart: CartItem[]

  lifeEventActive: boolean
  lifeEventShown: boolean
  lifeEventOutcome: string | null

  hasJob: boolean
  incomeFactor: number
  incomeFactorUntil: number
  nextPaydayAt: number

  completedTopicIds: string[]
  unlockedUnitNumber: number
  activeLessonId: string | null
  activeQuizId: string | null
  quizAnswers: Record<string, number>
  quizSubmitted: boolean

  /** Financial mastery. Separate from XP `lifeLevel` and from the diploma string `education`. */
  financialEdu: EducationState
  activeConceptId: string | null
  checkpointOpen: boolean
  recordEducation: (event: string, meta?: { cartTotal?: number }) => void
  openConcept: (id: string) => void
  closeConcept: () => void
  dismissExplainer: (id: string) => void
  startCheckpoint: () => void
  answerCheckpoint: (questionId: string, choice: number) => void
  submitCheckpoint: () => void
  closeCheckpoint: () => void

  totalMinutes: number
  timeScale: number

  activeScenarioId: string | null
  scenarioChoiceId: string | null
  scenarioWhyOverride: string | null
  firedTriggerIds: string[]
  engagedScenarioIds: string[]

  recurringBills: RecurringBill[]
  /** Bill ids that are due and waiting for a Scenario resolution. */
  dueBillIds: string[]
  lastBillNotice: string | null
  lastMarketNotice: string | null
  recentlyMissedBill: boolean

  /** Random life-expense scheduler. */
  nextRandomExpenseAt: number
  /** After the first expense, use the normal 5–15 day spacing. */
  randomExpenseCount: number

  /** Job interview progress (null = not interviewing). */
  interviewCorrect: number
  interviewAsked: number
  interviewActive: boolean

  assetPrices: Record<AssetId, number>
  holdings: Holdings
  lastPriceDayIndex: number
  investingPanelOpen: boolean
  investingIntroSeen: boolean

  phoneOpen: boolean
  paystubs: Paystub[]
  ledger: LedgerEntry[]

  carStatus: CarStatus
  homeStatus: HomeStatus

  /** Life sim — character, progression, relationships, missions, save */
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
  firstDayStarted: boolean
  optionsOpen: boolean
  guideDismissed: string[]
  phoneOpenedOnce: boolean
  leftHome: boolean
  rewardPopup: RewardPopup | null
  messages: PhoneMessage[]
  goalMilestones: GoalMilestone[]

  setPrompt: (p: string | null) => void
  openDialogue: (d: Dialogue) => void
  closeDialogue: () => void
  enterScene: (scene: SceneId, spawn: Spawn) => void
  finishTransition: () => void

  beginLife: (name: string, age: number, appearance: CharacterAppearance, goals: LifeGoalId[]) => void
  continueFromSave: () => boolean
  hasSaveGame: () => boolean
  newGameWipe: () => void
  autosave: () => void
  awardXp: (amount: number, reason?: string) => void
  xpToNext: () => number
  bumpSkill: (skill: SkillId, amount?: number) => void
  talkToNpc: (npcId: string, displayName: string, memory?: string) => void
  completeMissionObjective: (missionId: string, objectiveId: string) => void
  discoverLocation: (id: string) => void
  unlockAchievement: (id: string) => void
  rememberDecision: (id: string) => void
  syncSeasonFromTime: () => void
  downtownUnlocked: () => boolean
  openOptions: () => void
  closeOptions: () => void
  activityOptions: () => ActivityOption[]
  dismissGuide: (key: string) => void
  showReward: (title: string, lines: string[], xp?: number, cash?: number) => void
  clearRewardPopup: () => void
  pushMessage: (from: string, body: string, opportunityId?: string) => void
  markMessagesRead: () => void
  syncMilestones: () => void
  /** Jump clock forward to the next payday (capped) for paced early-game flow. */
  advanceToPayday: () => void
  /** Jump to a specific scene with optional notice — used by pacing “Go” buttons. */
  goDo: (action: ActivityOption['action']) => void

  openCheckingAccount: () => void
  deposit: (amount: number) => string | null
  withdraw: (amount: number) => string | null
  openSavings: (amount: number) => string | null
  transferToSavings: (amount: number) => string | null
  applyForCreditCard: () => string | null
  applyJob: () => string | null

  addToCart: (item: CartItem) => void
  clearCart: () => void
  checkout: () => number

  triggerLifeEvent: () => void
  resolveLifeEvent: (choice: 'savings' | 'credit' | 'delay') => void
  dismissLifeEventOutcome: () => void

  openLesson: (lessonId: string) => void
  closeLesson: () => void
  startQuiz: (quizId: string) => void
  answerQuiz: (questionId: string, choiceIndex: number) => void
  submitQuiz: () => void
  closeQuiz: () => void

  advanceTime: (deltaMinutes: number) => void
  setTimeScale: (scale: number) => void
  openScenario: (scenarioId: string, triggerId?: string) => void
  chooseScenarioOption: (choiceId: string) => void
  dismissScenario: () => void
  dismissBillNotice: () => void
  dismissMarketNotice: () => void

  openPhone: () => void
  closePhone: () => void

  openInvestingPanel: () => void
  closeInvestingPanel: () => void
  buyAsset: (id: AssetId, shares?: number) => string | null
  sellAsset: (id: AssetId, shares?: number) => string | null

  openCarDealScenario: () => void
  openHomeDealScenario: () => void

  beginInterview: () => string | null
  answerInterview: (correct: boolean) => void
  finishInterview: () => { hired: boolean; message: string }
}

function liquidFunds(s: { bank: number; savings: number; cash: number }) {
  return s.bank + s.savings + s.cash
}

function takeFromLiquid(
  s: { bank: number; savings: number; cash: number },
  amount: number,
): { bank: number; savings: number; cash: number } | null {
  if (liquidFunds(s) < amount) return null
  let left = amount
  let bank = s.bank
  let savings = s.savings
  let cash = s.cash
  const fromBank = Math.min(bank, left)
  bank -= fromBank
  left -= fromBank
  const fromSavings = Math.min(savings, left)
  savings -= fromSavings
  left -= fromSavings
  cash -= left
  return { bank, savings, cash }
}

function pushLedger(list: LedgerEntry[], entry: LedgerEntry, cap = 40): LedgerEntry[] {
  return [entry, ...list].slice(0, cap)
}

function bumpCredit(score: number, established: boolean, delta: number): number {
  if (!established) return score
  return Math.max(300, Math.min(850, score + delta))
}

type UseGameStore = UseBoundStore<StoreApi<GameState>>

/** Survives Vite HMR so Phone/HUD/NPC never diverge onto a fresh empty store. */
const STORE_GLOBAL = '__beyondTheDollarUseGame' as const

type Persistable = ReturnType<typeof emptyLifeDefaults> & {
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
  hasJob: boolean
  incomeFactor: number
  incomeFactorUntil: number
  nextPaydayAt: number
  completedTopicIds: string[]
  unlockedUnitNumber: number
  totalMinutes: number
  timeScale: number
  firedTriggerIds: string[]
  engagedScenarioIds: string[]
  recurringBills: RecurringBill[]
  dueBillIds: string[]
  nextRandomExpenseAt: number
  randomExpenseCount: number
  assetPrices: Record<AssetId, number>
  holdings: Holdings
  lastPriceDayIndex: number
  investingIntroSeen: boolean
  paystubs: Paystub[]
  ledger: LedgerEntry[]
  carStatus: CarStatus
  homeStatus: HomeStatus
  scene: SceneId
  financialEdu: EducationState
}

function toSaveBlob(s: Persistable): SaveBlob {
  return {
    version: 1,
    savedAt: Date.now(),
    characterCreated: s.characterCreated,
    playerName: s.playerName,
    playerAge: s.playerAge,
    appearance: s.appearance,
    goals: s.goals,
    lifeLevel: s.lifeLevel,
    xp: s.xp,
    skills: s.skills,
    relationships: s.relationships,
    missions: s.missions,
    discoveredLocations: s.discoveredLocations,
    achievements: s.achievements,
    decisions: s.decisions,
    season: s.season,
    firstDayStarted: s.firstDayStarted,
    cash: s.cash,
    bank: s.bank,
    savings: s.savings,
    weeklyIncome: s.weeklyIncome,
    monthlyExpenses: s.monthlyExpenses,
    creditScore: s.creditScore,
    creditEstablished: s.creditEstablished,
    debt: s.debt,
    education: s.education,
    career: s.career,
    transportationAvailable: s.transportationAvailable,
    hasCheckingAccount: s.hasCheckingAccount,
    hasCreditCard: s.hasCreditCard,
    hasJob: s.hasJob,
    incomeFactor: s.incomeFactor,
    incomeFactorUntil: s.incomeFactorUntil,
    nextPaydayAt: s.nextPaydayAt,
    completedTopicIds: s.completedTopicIds,
    unlockedUnitNumber: s.unlockedUnitNumber,
    totalMinutes: s.totalMinutes,
    timeScale: s.timeScale,
    firedTriggerIds: s.firedTriggerIds,
    engagedScenarioIds: s.engagedScenarioIds,
    recurringBills: s.recurringBills,
    dueBillIds: s.dueBillIds,
    nextRandomExpenseAt: s.nextRandomExpenseAt,
    randomExpenseCount: s.randomExpenseCount,
    assetPrices: s.assetPrices,
    holdings: { ...s.holdings },
    lastPriceDayIndex: s.lastPriceDayIndex,
    investingIntroSeen: s.investingIntroSeen,
    paystubs: s.paystubs,
    ledger: s.ledger,
    carStatus: s.carStatus,
    homeStatus: s.homeStatus,
    scene: s.scene,
    financialEdu: s.financialEdu,
  }
}

function applySaveBlob(set: (partial: Partial<GameState>) => void, blob: SaveBlob) {
  set({
    characterCreated: true,
    playerName: blob.playerName,
    playerAge: blob.playerAge,
    appearance: normalizeAppearance(blob.appearance),
    goals: blob.goals,
    lifeLevel: blob.lifeLevel,
    xp: blob.xp,
    skills: blob.skills,
    relationships: blob.relationships,
    missions: blob.missions,
    discoveredLocations: blob.discoveredLocations,
    achievements: blob.achievements,
    decisions: blob.decisions,
    season: blob.season,
    firstDayStarted: true,
    optionsOpen: false,
    guideDismissed: [],
    phoneOpenedOnce: true,
    leftHome: true,
    rewardPopup: null,
    messages: [],
    goalMilestones: buildGoalMilestones(blob.goals),
    cash: blob.cash,
    bank: blob.bank,
    savings: blob.savings,
    weeklyIncome: blob.weeklyIncome,
    monthlyExpenses: blob.monthlyExpenses,
    creditScore: blob.creditScore,
    creditEstablished: blob.creditEstablished,
    debt: blob.debt,
    education: blob.education,
    career: blob.career,
    transportationAvailable: blob.transportationAvailable,
    hasCheckingAccount: blob.hasCheckingAccount,
    hasCreditCard: blob.hasCreditCard,
    hasJob: !!blob.hasJob,
    incomeFactor: blob.incomeFactor,
    incomeFactorUntil: blob.incomeFactorUntil,
    nextPaydayAt: blob.nextPaydayAt,
    completedTopicIds: blob.completedTopicIds,
    unlockedUnitNumber: blob.unlockedUnitNumber,
    totalMinutes: blob.totalMinutes,
    timeScale: blob.timeScale,
    firedTriggerIds: blob.firedTriggerIds,
    engagedScenarioIds: blob.engagedScenarioIds,
    recurringBills: blob.recurringBills as RecurringBill[],
    dueBillIds: blob.dueBillIds,
    nextRandomExpenseAt: blob.nextRandomExpenseAt,
    randomExpenseCount: blob.randomExpenseCount,
    assetPrices: blob.assetPrices as Record<AssetId, number>,
    holdings: blob.holdings as unknown as Holdings,
    lastPriceDayIndex: blob.lastPriceDayIndex,
    investingIntroSeen: blob.investingIntroSeen,
    paystubs: blob.paystubs as Paystub[],
    ledger: blob.ledger as LedgerEntry[],
    carStatus: blob.carStatus as CarStatus,
    homeStatus: blob.homeStatus as HomeStatus,
    scene: (blob.scene as SceneId) || 'home',
    financialEdu: blob.financialEdu
      ? normalizeEducation(blob.financialEdu)
      : backfillEducation(initialEducation(), {
          hasChecking: blob.hasCheckingAccount,
          hasJob: !!blob.hasJob,
          hasCreditCard: blob.hasCreditCard,
          savings: blob.savings,
          paystubCount: blob.paystubs?.length ?? 0,
          completedTopicIds: blob.completedTopicIds ?? [],
          goalsCount: blob.goals?.length ?? 0,
        }),
    activeConceptId: null,
    checkpointOpen: false,
    spawn: blob.scene === 'city' ? { pos: [0, 0, 0], yaw: Math.PI } : HOME_BEDROOM_START,
    transitioning: true,
    phoneOpen: false,
    dialogue: null,
    prompt: null,
    lastBillNotice: `Welcome back, ${blob.playerName}`,
  })
}

function createGameStore(): UseGameStore {
  return create<GameState>((set, get) => ({
  cash: GRADUATION_CASH,
  bank: 0,
  savings: 0,
  weeklyIncome: 0,
  monthlyExpenses: RENT_MONTHLY,
  creditScore: 0,
  creditEstablished: false,
  debt: 0,
  education: 'High School graduate',
  career: 'Unemployed',
  transportationAvailable: true,
  hasCheckingAccount: false,
  hasCreditCard: false,

  scene: 'city',
  spawn: null,
  transitioning: false,

  prompt: null,
  dialogue: null,

  cart: [],

  lifeEventActive: false,
  lifeEventShown: true,
  lifeEventOutcome: null,

  hasJob: false,
  incomeFactor: 1,
  incomeFactorUntil: 0,
  nextPaydayAt: START_TOTAL_MINUTES + 7 * MINUTES_PER_DAY,

  completedTopicIds: [],
  unlockedUnitNumber: 1,
  activeLessonId: null,
  activeQuizId: null,
  quizAnswers: {},
  quizSubmitted: false,

  financialEdu: initialEducation(),
  activeConceptId: null,
  checkpointOpen: false,

  totalMinutes: START_TOTAL_MINUTES,
  timeScale: 1,

  activeScenarioId: null,
  scenarioChoiceId: null,
  scenarioWhyOverride: null,
  firedTriggerIds: [],
  engagedScenarioIds: [],

  recurringBills: [
    billInDays('rent-maple', 'Maple Apartments rent', RENT_MONTHLY, 30, START_TOTAL_MINUTES, 'rent', 2),
  ],
  dueBillIds: [],
  lastBillNotice: null,
  lastMarketNotice: null,
  recentlyMissedBill: false,

  nextRandomExpenseAt: rollNextExpenseAt(START_TOTAL_MINUTES, { first: true }),
  randomExpenseCount: 0,

  interviewCorrect: 0,
  interviewAsked: 0,
  interviewActive: false,
  assetPrices: { stock: INITIAL_ASSETS.stock.price, bond: INITIAL_ASSETS.bond.price },
  holdings: { stock: 0, bond: 0 },
  lastPriceDayIndex: stampFromMinutes(START_TOTAL_MINUTES).dayIndex,
  investingPanelOpen: false,
  investingIntroSeen: false,

  phoneOpen: false,
  paystubs: [],
  ledger: [],

  carStatus: 'none',
  homeStatus: 'renting',

  ...emptyLifeDefaults(),

  setPrompt: (p) => {
    if (get().prompt !== p) set({ prompt: p })
  },
  openDialogue: (d) => set({ dialogue: d, prompt: null, phoneOpen: false }),
  closeDialogue: () => {
    if (get().dialogue) set({ dialogue: null })
  },

  enterScene: (scene, spawn) =>
    set((s) => ({
      transitioning: true,
      scene,
      spawn,
      dialogue: null,
      prompt: null,
      investingPanelOpen: false,
      phoneOpen: false,
      optionsOpen: false,
      leftHome: s.leftHome || scene === 'city',
    })),
  finishTransition: () => set({ transitioning: false }),

  beginLife: (name, age, appearance, goals) => {
    const firstDay = createFirstDayMission()
    const opportunity = createPersonalizedOpportunity(goals)
    const achievements: Record<string, number | null> = {}
    for (const a of ACHIEVEMENT_DEFS) achievements[a.id] = null
    const look = normalizeAppearance(appearance)
    set({
      characterCreated: true,
      playerName: name,
      playerAge: age,
      appearance: look,
      goals: [...goals],
      lifeLevel: 1,
      xp: 0,
      skills: { ...DEFAULT_SKILLS },
      relationships: {},
      missions: [firstDay, opportunity],
      discoveredLocations: ['home'],
      achievements,
      decisions: [],
      season: 'summer',
      firstDayStarted: true,
      optionsOpen: false,
      guideDismissed: [],
      phoneOpenedOnce: false,
      leftHome: false,
      rewardPopup: null,
      messages: [
        {
          id: 'msg-welcome',
          from: 'Guide',
          body: `Welcome to Merridian, ${name}. Open “What can I do?” whenever you want your next options.`,
          atTotalMinutes: START_TOTAL_MINUTES,
          read: false,
        },
      ],
      goalMilestones: buildGoalMilestones(goals),
      scene: 'home',
      spawn: HOME_BEDROOM_START,
      transitioning: true,
      dialogue: null,
      prompt: null,
      phoneOpen: false,
      lastBillNotice: `Welcome, ${name}. Your first day starts at home.`,
      financialEdu: recordEvent(initialEducation(), 'goal-set', START_TOTAL_MINUTES),
      activeConceptId: null,
      checkpointOpen: false,
    })
    get().showReward('LIFE BEGINS', [`${name} · age ${age}`, 'Explore home · meet people · build your path'], 0)
    get().autosave()
  },
  hasSaveGame: () => !!loadSave(),
  continueFromSave: () => {
    const blob = loadSave()
    if (!blob) return false
    applySaveBlob(set, blob)
    return true
  },
  newGameWipe: () => {
    clearSave()
    set({
      ...emptyLifeDefaults(),
      appearance: { ...DEFAULT_APPEARANCE },
      skills: { ...DEFAULT_SKILLS },
      financialEdu: initialEducation(),
      activeConceptId: null,
      checkpointOpen: false,
    })
  },
  autosave: () => {
    const s = get()
    if (!s.characterCreated) return
    writeSave(toSaveBlob(s))
  },
  awardXp: (amount, reason) => {
    if (amount <= 0) return
    const s = get()
    let xp = s.xp + amount
    let lifeLevel = s.lifeLevel
    let leveled = false
    let need = xpNeededForLevel(lifeLevel)
    while (xp >= need) {
      xp -= need
      lifeLevel += 1
      leveled = true
      need = xpNeededForLevel(lifeLevel)
    }
    set({
      xp,
      lifeLevel,
      lastBillNotice: leveled
        ? `Level up! Life Level ${lifeLevel}${reason ? ` · ${reason}` : ''}`
        : reason
          ? `+${amount} XP · ${reason}`
          : s.lastBillNotice,
    })
    if (leveled) {
      get().showReward('LEVEL UP', [
        `Life Level ${lifeLevel}`,
        lifeLevel >= DOWNTOWN_UNLOCK_LEVEL
          ? 'Downtown unlocked — explore the east skyline'
          : `Downtown unlocks at Life Level ${DOWNTOWN_UNLOCK_LEVEL}`,
        reason ? `From: ${reason}` : '',
      ].filter(Boolean), amount)
      if (lifeLevel >= DOWNTOWN_UNLOCK_LEVEL) get().unlockAchievement('downtown-unlocked')
    }
    get().autosave()
  },
  xpToNext: () => xpNeededForLevel(get().lifeLevel),
  bumpSkill: (skill, amount = 0.25) => {
    const skills = { ...get().skills }
    skills[skill] = Math.min(5, Math.round((skills[skill] + amount) * 100) / 100)
    set({ skills })
  },
  talkToNpc: (npcId, displayName, memory) => {
    const s = get()
    const prev = s.relationships[npcId]
    const talks = (prev?.talks ?? 0) + 1
    const affinity = Math.min(100, (prev?.affinity ?? 0) + (prev?.met ? 4 : 10))
    const memories = [...(prev?.memories ?? [])]
    if (memory && !memories.includes(memory)) memories.push(memory)
    if (memories.length > 8) memories.shift()
    const next: NpcRelation = {
      affinity,
      met: true,
      talks,
      tier: relationTierFromAffinity(affinity),
      professional: professionalFromTalks(talks, affinity),
      memories,
      lastTalkAt: s.totalMinutes,
    }
    set({ relationships: { ...s.relationships, [npcId]: next } })
    get().completeMissionObjective('first-day', 'meet-someone')
    if (talks === 1) {
      get().awardXp(25, `Met ${displayName}`)
      get().showReward('NEW CONNECTION', [`Met ${displayName}`, `Relationship · ${next.tier}`, '+25 XP'], 25)
      get().pushMessage(displayName, `Hey ${s.playerName || 'there'} — good meeting you. Text me if you need a local tip.`)
    } else if (talks % 3 === 0) {
      get().awardXp(15, `${displayName} · ${next.tier}`)
      get().bumpSkill('communication', 0.15)
    }
    get().syncMilestones()
  },
  openOptions: () => set({ optionsOpen: true, phoneOpen: false, dialogue: null, prompt: null }),
  closeOptions: () => set({ optionsOpen: false }),
  activityOptions: () => {
    const s = get()
    const ctx: OptionContext = {
      scene: s.scene,
      hasChecking: s.hasCheckingAccount,
      hasJob: s.hasJob,
      cash: s.cash,
      bank: s.bank,
      savings: s.savings,
      lifeLevel: s.lifeLevel,
      xp: s.xp,
      xpToNext: xpNeededForLevel(s.lifeLevel),
      goals: s.goals,
      missions: s.missions,
      metJordan: !!s.relationships['home-jordan']?.met,
      phoneOpen: s.phoneOpen,
      discovered: s.discoveredLocations,
      career: s.career,
      season: s.season,
      creditEstablished: s.creditEstablished,
      paystubCount: s.paystubs.length,
      unreadMessages: (s.messages ?? []).filter((m) => !m.read).length,
    }
    return computeActivityOptions(ctx)
  },
  dismissGuide: (key) => {
    const s = get()
    if (s.guideDismissed.includes(key)) return
    set({ guideDismissed: [...s.guideDismissed, key] })
  },
  showReward: (title, lines, xp, cash) => {
    set({
      rewardPopup: {
        id: `rw-${Date.now()}`,
        title,
        lines,
        xp,
        cash,
        createdAt: Date.now(),
      },
    })
  },
  clearRewardPopup: () => set({ rewardPopup: null }),
  pushMessage: (from, body, opportunityId) => {
    const s = get()
    const msg = {
      id: `msg-${s.totalMinutes}-${s.messages.length}`,
      from,
      body,
      atTotalMinutes: s.totalMinutes,
      read: false,
      opportunityId,
    }
    set({ messages: [msg, ...s.messages].slice(0, 40) })
  },
  markMessagesRead: () => {
    set({ messages: get().messages.map((m) => ({ ...m, read: true })) })
  },
  syncMilestones: () => {
    const s = get()
    const holdingsValue = s.holdings.stock * s.assetPrices.stock + s.holdings.bond * s.assetPrices.bond
    set({
      goalMilestones: syncGoalMilestonesFromState({
        goals: s.goals,
        milestones: s.goalMilestones.length ? s.goalMilestones : buildGoalMilestones(s.goals),
        hasJob: s.hasJob,
        hasChecking: s.hasCheckingAccount,
        savings: s.savings,
        paystubCount: s.paystubs.length,
        metAnyone: Object.values(s.relationships).some((r) => r.met),
        discoveredCount: s.discoveredLocations.length,
        holdingsValue,
      }),
    })
  },
  advanceToPayday: () => {
    const s = get()
    if (!s.hasJob || !s.hasCheckingAccount) return
    const target = Math.max(s.totalMinutes + 30, s.nextPaydayAt)
    const delta = target - s.totalMinutes
    if (delta <= 0) return
    get().advanceTime(delta + 1)
    set({
      lastBillNotice: 'Time skipped to payday',
      optionsOpen: false,
      phoneOpen: false,
    })
    get().showReward('PAYDAY ARRIVES', ['Clock advanced to your direct deposit', 'Check Phone → Jobs for the stub'], 0)
  },
  goDo: (action) => {
    get().closeOptions()
    const enter = get().enterScene
    switch (action) {
      case 'phone':
        get().openPhone()
        break
      case 'goto-bank':
        enter('bank', { pos: [0, 0, 2], yaw: Math.PI })
        break
      case 'goto-office':
        enter('office', { pos: [0, 0, 2.5], yaw: Math.PI })
        break
      case 'goto-grocery':
        enter('grocery', { pos: [0, 0, 2.5], yaw: Math.PI })
        break
      case 'goto-college':
        enter('college', { pos: [0, 0, 2], yaw: Math.PI })
        break
      case 'goto-home':
        enter('home', HOME_BEDROOM_START)
        break
      case 'goto-city':
        enter('city', { pos: [-36, 0, -16], yaw: 0 })
        break
      case 'talk-jordan':
        enter('home', HOME_BEDROOM_START)
        window.setTimeout(() => {
          get().talkToNpc('home-jordan', 'Jordan', 'Guided catch-up')
          get().openDialogue({
            name: 'Roommate — Jordan',
            text: 'Ready for the next move? Bank → job → payday is the starter arc.',
            options: [
              {
                label: 'Show my options',
                action: () => get().openOptions(),
                close: true,
              },
              { label: 'Later', close: true },
            ],
          })
        }, 350)
        break
      case 'advance-payday':
        get().advanceToPayday()
        break
      case 'open-map':
        get().openPhone()
        break
      default:
        get().openOptions()
    }
  },

  completeMissionObjective: (missionId, objectiveId) => {
    const s = get()
    const before = s.missions.find((m) => m.id === missionId)
    if (!before || before.completed) return
    if (before.objectives.find((o) => o.id === objectiveId)?.done) return

    const missions = s.missions.map((m) => {
      if (m.id !== missionId) return m
      const objectives = m.objectives.map((o) => (o.id === objectiveId ? { ...o, done: true } : o))
      return { ...m, objectives, completed: objectives.every((o) => o.done) }
    })
    set({ missions })
    get().recordEducation(objectiveId)
    const after = missions.find((m) => m.id === missionId)
    if (!after?.completed) return

    if (after.rewardXp) get().awardXp(after.rewardXp, after.title)
    if (after.rewardCash) set({ cash: get().cash + after.rewardCash })
    const lines = [
      after.rewardCash ? `+$${after.rewardCash}` : '',
      after.rewardXp ? `+${after.rewardXp} XP` : '',
      missionId === 'first-day' ? 'Skill · Problem Solving +' : '',
      missionId === 'first-opportunity' ? 'Skills · Financial + Business' : '',
    ].filter(Boolean)
    get().showReward('MISSION COMPLETE', [after.title, ...lines], after.rewardXp, after.rewardCash)
    if (missionId === 'first-day') {
      get().unlockAchievement('first-day-done')
      get().bumpSkill('problemSolving', 0.2)
      set({ lastBillNotice: 'First day complete — your personalized opportunity is waiting' })
      get().pushMessage('Jordan', 'Nice work surviving day one. Summit is hiring if you want a paycheck path.')
    }
    if (missionId === 'first-opportunity') {
      get().bumpSkill('financial', 0.35)
      get().bumpSkill('business', 0.2)
    }
    get().syncMilestones()
    get().autosave()
  },
  discoverLocation: (id) => {
    const s = get()
    if (s.discoveredLocations.includes(id)) return
    set({ discoveredLocations: [...s.discoveredLocations, id] })
    if (id !== 'home') get().awardXp(10, `Discovered ${id}`)
  },
  unlockAchievement: (id) => {
    const s = get()
    if (s.achievements[id] != null) return
    set({
      achievements: { ...s.achievements, [id]: s.totalMinutes },
      lastBillNotice: `Achievement · ${ACHIEVEMENT_DEFS.find((a) => a.id === id)?.title ?? id}`,
    })
    get().awardXp(40, 'Achievement')
  },
  rememberDecision: (id) => {
    const s = get()
    if (s.decisions.includes(id)) return
    set({ decisions: [...s.decisions, id] })
  },
  syncSeasonFromTime: () => {
    const { month } = stampFromMinutes(get().totalMinutes)
    const season: Season =
      month >= 3 && month <= 5 ? 'spring' : month >= 6 && month <= 8 ? 'summer' : month >= 9 && month <= 11 ? 'fall' : 'winter'
    if (get().season !== season) set({ season })
  },
  downtownUnlocked: () => get().lifeLevel >= DOWNTOWN_UNLOCK_LEVEL,

  openCheckingAccount: () => {
    const s = get()
    if (s.hasCheckingAccount) return
    const deposit = Math.min(s.cash, GRADUATION_CASH)
    set({
      hasCheckingAccount: true,
      bank: s.bank + deposit,
      cash: s.cash - deposit,
      creditEstablished: true,
      creditScore: s.creditEstablished ? s.creditScore : CREDIT_SCORE_ON_FILE,
    })
    get().awardXp(50, 'Opened checking')
    get().bumpSkill('financial', 0.3)
    get().recordEducation('open-checking')
    get().completeMissionObjective('first-opportunity', 'open-checking')
    get().autosave()
  },
  deposit: (amount) => {
    const s = get()
    if (!s.hasCheckingAccount) return 'Open a checking account first.'
    const amt = Math.min(amount, s.cash)
    if (amt <= 0) return 'No cash to deposit.'
    set({ cash: s.cash - amt, bank: s.bank + amt })
    get().recordEducation('deposit')
    return null
  },
  withdraw: (amount) => {
    const s = get()
    if (!s.hasCheckingAccount) return 'Open a checking account first.'
    const amt = Math.min(amount, s.bank)
    if (amt <= 0) return 'Nothing in checking to withdraw.'
    set({ bank: s.bank - amt, cash: s.cash + amt })
    get().recordEducation('withdraw')
    return null
  },
  openSavings: (amount) => {
    const s = get()
    if (!s.hasCheckingAccount) return 'Open a checking account first.'
    const amt = Math.min(amount, s.cash + s.bank)
    if (amt <= 0) return 'Nothing to move into savings.'
    let left = amt
    let cash = s.cash
    let bank = s.bank
    const fromCash = Math.min(cash, left)
    cash -= fromCash
    left -= fromCash
    bank -= left
    set({
      cash,
      bank,
      savings: s.savings + amt,
      creditEstablished: true,
      creditScore: s.creditEstablished ? bumpCredit(s.creditScore, true, 1) : CREDIT_SCORE_ON_FILE,
    })
    get().recordEducation('open-savings')
    get().completeMissionObjective('first-opportunity', 'shop-or-save')
    get().bumpSkill('financial', 0.15)
    get().autosave()
    return null
  },
  transferToSavings: (amount) => {
    const s = get()
    if (!s.hasCheckingAccount) return 'Open a checking account first.'
    const amt = Math.min(amount, s.bank)
    set({
      bank: s.bank - amt,
      savings: s.savings + amt,
      creditEstablished: true,
      creditScore: s.creditEstablished ? bumpCredit(s.creditScore, true, 1) : CREDIT_SCORE_ON_FILE,
    })
    if (amt > 0) {
      get().recordEducation('transfer-savings')
      get().completeMissionObjective('first-opportunity', 'shop-or-save')
      get().autosave()
    }
    return null
  },
  applyForCreditCard: () => {
    const s = get()
    if (!s.hasCheckingAccount) return 'Open a checking account first.'
    if (!s.creditEstablished) return 'No credit history yet — bank activity and on-time bills build it.'
    if (s.creditScore < CREDIT_PRODUCT_MIN) {
      return `Credit score ${s.creditScore} is below ${CREDIT_PRODUCT_MIN}. Keep paying on time.`
    }
    if (s.hasCreditCard) return 'You already have a card on file.'
    set({ hasCreditCard: true })
    get().recordEducation('credit-card')
    get().autosave()
    return null
  },
  applyJob: () => {
    const s = get()
    if (!s.hasCheckingAccount) return 'Employers want direct deposit — open checking at the bank first.'
    if (s.hasJob) return 'You already have this job.'
    if (!s.interviewActive) return 'Start the interview with Diane first.'
    return 'Finish the interview questions first.'
  },

  beginInterview: () => {
    const s = get()
    if (s.hasJob) return 'You already work here.'
    if (!s.hasCheckingAccount) return 'Direct deposit required — open a checking account at FirstCity Bank first.'
    // Education gate: high-school grad is enough for this role; flag if somehow missing.
    if (!/high school/i.test(s.education)) {
      return 'This role requires a high school diploma (or equivalent).'
    }
    set({ interviewActive: true, interviewCorrect: 0, interviewAsked: 0 })
    get().recordEducation('interview')
    return null
  },
  answerInterview: (correct) => {
    const s = get()
    if (!s.interviewActive) return
    set({
      interviewAsked: s.interviewAsked + 1,
      interviewCorrect: s.interviewCorrect + (correct ? 1 : 0),
    })
  },
  finishInterview: () => {
    const s = get()
    if (!s.interviewActive) return { hired: false, message: 'No interview in progress.' }
    // Base chance from answers (3 questions): 0/3→15%, 1/3→40%, 2/3→70%, 3/3→90%
    const rates = [0.15, 0.4, 0.7, 0.9]
    const rate = rates[Math.min(3, s.interviewCorrect)] ?? 0.15
    const roll = Math.random()
    const hired = roll < rate
    const score = s.interviewCorrect
    if (hired) {
      // First payday is morning of Sept 2 — not a full week later.
      const nextPay = Math.max(s.totalMinutes + 90, FIRST_PAYDAY_TOTAL_MINUTES)
      const netEst = Math.round(OFFICE_WEEKLY_GROSS * (1 - PAYROLL_TAX_RATE))
      const message = `You’re hired as Office Assistant ($${OFFICE_HOURLY}/hr, ${OFFICE_HOURS_PER_WEEK} hrs/week, ~$${OFFICE_WEEKLY_GROSS} gross / ~$${netEst} take-home after tax). Interview score ${score}/3. First direct deposit hits checking on Sept 2 morning — check Phone → Jobs.`
      set({
        hasJob: true,
        career: 'Office Assistant',
        weeklyIncome: OFFICE_WEEKLY_GROSS,
        nextPaydayAt: nextPay,
        interviewActive: false,
        interviewCorrect: 0,
        interviewAsked: 0,
        lastBillNotice: `Hired · first payday Sept 2 (~$${netEst} net)`,
      })
      get().awardXp(80, 'Hired')
      get().bumpSkill('communication', 0.3)
      get().bumpSkill('problemSolving', 0.2)
      get().recordEducation('get-hired')
      get().completeMissionObjective('first-opportunity', 'get-hired')
      get().rememberDecision(`hired-summit-${score}`)
      get().showReward(
        'YOU’RE HIRED',
        [
          'Office Assistant',
          `~$${netEst}/wk take-home after tax`,
          'First payday: Sept 2 morning',
          '+80 XP',
        ],
        80,
      )
      get().pushMessage(
        'Diane · Summit',
        `Welcome aboard. Your first direct deposit (~$${netEst} after tax) lands Sept 2. Open What can I do? if you want to skip ahead to payday.`,
      )
      get().syncMilestones()
      get().autosave()
      return { hired: true, message }
    }
    set({ interviewActive: false, interviewCorrect: 0, interviewAsked: 0 })
    return {
      hired: false,
      message: `Not this time — you scored ${score}/3. Review the role and try applying again later.`,
    }
  },

  addToCart: (item) => set({ cart: [...get().cart, item] }),
  clearCart: () => set({ cart: [] }),
  checkout: () => {
    const { cart, cash } = get()
    const total = cart.reduce((sum, i) => sum + i.price, 0)
    const paid = Math.min(total, cash)
    set({ cash: cash - paid, cart: [] })
    if (paid > 0) {
      get().recordEducation('shop', { cartTotal: total })
      get().completeMissionObjective('first-opportunity', 'shop-or-save')
      get().bumpSkill('financial', 0.1)
      get().awardXp(15, 'Grocery run')
      get().rememberDecision(`grocery-${Math.round(paid)}`)
      get().autosave()
    }
    return total
  },

  triggerLifeEvent: () => {
    if (!get().lifeEventShown) set({ lifeEventActive: true, lifeEventShown: true })
  },
  resolveLifeEvent: () => set({ lifeEventActive: false, lifeEventOutcome: null }),
  dismissLifeEventOutcome: () => set({ lifeEventOutcome: null }),

  openLesson: (lessonId) => {
    set({
      activeLessonId: lessonId,
      activeQuizId: null,
      quizAnswers: {},
      quizSubmitted: false,
      dialogue: null,
      prompt: null,
      investingPanelOpen: false,
      phoneOpen: false,
    })
    get().recordEducation(`lesson:${lessonId}`)
  },
  closeLesson: () => set({ activeLessonId: null }),
  startQuiz: (quizId) =>
    set({ activeQuizId: quizId, activeLessonId: null, quizAnswers: {}, quizSubmitted: false }),
  answerQuiz: (questionId, choiceIndex) => {
    if (get().quizSubmitted) return
    set({ quizAnswers: { ...get().quizAnswers, [questionId]: choiceIndex } })
  },
  submitQuiz: () => {
    const { activeQuizId, quizAnswers, completedTopicIds, unlockedUnitNumber } = get()
    if (!activeQuizId) return
    const found = CURRICULUM.flatMap((u) => u.topics.map((t) => ({ topic: t, lesson: t.lesson }))).find(
      (x) => x.lesson.quiz.id === activeQuizId,
    )
    if (!found) return
    const perfect = found.lesson.quiz.questions.every((qq) => quizAnswers[qq.id] === qq.correctIndex)
    set({ quizSubmitted: true })
    if (!perfect || completedTopicIds.includes(found.topic.id)) return
    const nextCompleted = [...completedTopicIds, found.topic.id]
    set({
      completedTopicIds: nextCompleted,
      unlockedUnitNumber: unlockedAfterCompleting(nextCompleted, unlockedUnitNumber),
    })
    get().recordEducation(`quiz:${found.topic.id}`)
    get().autosave()
  },
  closeQuiz: () => set({ activeQuizId: null, quizAnswers: {}, quizSubmitted: false }),

  recordEducation: (event, meta) => {
    const next = recordEvent(get().financialEdu, event, get().totalMinutes, meta)
    if (next === get().financialEdu) return
    set({ financialEdu: next })
    if (get().characterCreated) get().autosave()
  },
  openConcept: (id) => {
    const next = recordEvent(get().financialEdu, `concept:${id}`, get().totalMinutes)
    set({ activeConceptId: id, phoneOpen: false, checkpointOpen: false, financialEdu: next })
    if (get().characterCreated) get().autosave()
  },
  closeConcept: () => set({ activeConceptId: null }),
  dismissExplainer: (id) => {
    set({ financialEdu: markExplainerSeen(get().financialEdu, id) })
    if (get().characterCreated) get().autosave()
  },
  startCheckpoint: () => {
    const edu = get().financialEdu
    if (edu.activeCheckpoint && !edu.activeCheckpoint.submitted) {
      set({ checkpointOpen: true, phoneOpen: false, activeConceptId: null })
      return
    }
    const built = buildCheckpoint(edu, edu.financialLevel)
    set({
      financialEdu: { ...edu, activeCheckpoint: built },
      checkpointOpen: true,
      phoneOpen: false,
      activeConceptId: null,
    })
  },
  answerCheckpoint: (questionId, choice) => {
    const edu = get().financialEdu
    const active = edu.activeCheckpoint
    if (!active || active.submitted) return
    set({
      financialEdu: {
        ...edu,
        activeCheckpoint: { ...active, answers: { ...active.answers, [questionId]: choice } },
      },
    })
  },
  submitCheckpoint: () => {
    const before = get().financialEdu
    const next = submitActive(before, get().totalMinutes)
    set({ financialEdu: next })
    const newly = next.rewardedLevels.find((level) => !before.rewardedLevels.includes(level))
    if (newly != null) {
      const gained = unlocksForPassedLevel(newly)
      get().awardXp(30, 'Financial checkpoint')
      get().showReward(
        `FINANCIAL LEVEL ${next.financialLevel}`,
        [
          `${levelTitle(newly)} checkpoint cleared`,
          next.financialLevel === newly ? levelTitle(newly) : `Now: ${levelTitle(next.financialLevel)}`,
          ...gained.map((u) => (u.live ? u.title : `${u.title} · ready when that part of life exists`)),
        ],
        30,
      )
      set({ checkpointOpen: false })
    }
    get().autosave()
  },
  closeCheckpoint: () => set({ checkpointOpen: false }),

  advanceTime: (deltaMinutes) => {
    if (deltaMinutes <= 0) return
    const prev = get()
    const totalMinutes = prev.totalMinutes + deltaMinutes
    const day = stampFromMinutes(totalMinutes).dayIndex

    let assetPrices = prev.assetPrices
    let lastPriceDayIndex = prev.lastPriceDayIndex
    let lastMarketNotice = prev.lastMarketNotice
    if (day > lastPriceDayIndex) {
      for (let d = lastPriceDayIndex; d < day; d++) {
        const stepped = stepPrices(assetPrices)
        assetPrices = stepped.prices
        if (stepped.eventNote) lastMarketNotice = stepped.eventNote
      }
      lastPriceDayIndex = day
    }

    let incomeFactor = prev.incomeFactor
    if (prev.incomeFactorUntil > 0 && totalMinutes >= prev.incomeFactorUntil) {
      incomeFactor = 1
    }

    let bank = prev.bank
    const savings = prev.savings
    const cash = prev.cash
    const debt = prev.debt
    const creditScore = prev.creditScore
    const creditEstablished = prev.creditEstablished
    let lastBillNotice = prev.lastBillNotice
    const recentlyMissedBill = prev.recentlyMissedBill
    let ledger = prev.ledger
    let paystubs = prev.paystubs
    let nextPaydayAt = prev.nextPaydayAt
    const dueBillIds = [...prev.dueBillIds]
    const recurringBills = prev.recurringBills.map((b) => ({ ...b }))
    let paydayHit = false

    // Paydays (weekly) — require checking for direct deposit
    if (prev.hasJob && prev.hasCheckingAccount) {
      let guard = 0
      while (totalMinutes >= nextPaydayAt && guard++ < 8) {
        const gross = Math.round(prev.weeklyIncome * incomeFactor)
        const tax = Math.round(gross * PAYROLL_TAX_RATE)
        const net = gross - tax
        bank += net
        const stub: Paystub = {
          id: `pay-${nextPaydayAt}`,
          atTotalMinutes: nextPaydayAt,
          employer: 'Summit Office',
          gross,
          tax,
          net,
        }
        paystubs = [stub, ...paystubs].slice(0, 20)
        ledger = pushLedger(ledger, {
          id: `led-pay-${nextPaydayAt}`,
          atTotalMinutes: nextPaydayAt,
          label: 'Paycheck (direct deposit)',
          amount: net,
          kind: 'paycheck',
          status: 'paid',
        })
        lastBillNotice = `Paycheck deposited: $${net}`
        nextPaydayAt += 7 * MINUTES_PER_DAY
        paydayHit = true
      }
    }

    // Queue due bills for Scenario resolution (do not silently auto-pay).
    for (const bill of recurringBills) {
      if (totalMinutes >= bill.nextDueTotalMinutes && !dueBillIds.includes(bill.id)) {
        dueBillIds.push(bill.id)
        if (import.meta.env.DEV) {
          console.debug('[bills] due', bill.id, bill.label, bill.amount, 'at', totalMinutes)
        }
      }
    }

    set({
      totalMinutes,
      assetPrices,
      lastPriceDayIndex,
      lastMarketNotice,
      incomeFactor,
      incomeFactorUntil: incomeFactor === 1 ? 0 : prev.incomeFactorUntil,
      recurringBills,
      dueBillIds,
      bank,
      savings,
      cash,
      debt,
      creditScore,
      creditEstablished,
      lastBillNotice,
      recentlyMissedBill,
      ledger,
      paystubs,
      nextPaydayAt,
    })
    if (paydayHit) get().recordEducation('payday')
    if (dueBillIds.length > prev.dueBillIds.length) get().recordEducation('bill-due')
    if (paydayHit) {
      get().completeMissionObjective('first-opportunity', 'first-paycheck')
      get().unlockAchievement('first-paycheck')
      get().awardXp(60, 'Paycheck')
      get().bumpSkill('financial', 0.1)
      get().autosave()
    }
  },
  setTimeScale: (scale) => set({ timeScale: Math.max(0, scale) }),

  openScenario: (scenarioId, triggerId) => {
    if (!getScenario(scenarioId)) return
    if (get().activeScenarioId) return
    set((s) => ({
      activeScenarioId: scenarioId,
      scenarioChoiceId: null,
      scenarioWhyOverride: null,
      dialogue: null,
      prompt: null,
      investingPanelOpen: false,
      phoneOpen: false,
      firedTriggerIds:
        triggerId && !s.firedTriggerIds.includes(triggerId)
          ? [...s.firedTriggerIds, triggerId]
          : s.firedTriggerIds,
    }))
  },
  chooseScenarioOption: (choiceId) => {
    const state = get()
    const { activeScenarioId } = state
    if (!activeScenarioId || state.scenarioChoiceId) return
    const scenario = getScenario(activeScenarioId)
    const choice = scenario?.choices.find((c) => c.id === choiceId)
    if (!choice) return
    get().recordEducation(`scenario:${activeScenarioId}`)

    const patch: Record<string, unknown> = {
      scenarioChoiceId: choiceId,
      scenarioWhyOverride: null,
    }
    let ledger = state.ledger

    const stats = choice.effects.stats
    if (stats) {
      ;(Object.keys(stats) as ScenarioStat[]).forEach((key) => {
        const delta = stats[key]
        if (delta == null) return
        const cur = state[key]
        if (typeof cur === 'number') patch[key] = cur + delta
      })
    }
    const flags = choice.effects.flags
    if (flags) {
      if (flags.hasJob != null) patch.hasJob = flags.hasJob
      if (flags.transportationAvailable != null) patch.transportationAvailable = flags.transportationAvailable
    }

    const pay = choice.effects.payExpense
    if (pay) {
      if (pay.from === 'savings') {
        if (state.savings >= pay.amount) {
          patch.savings = state.savings - pay.amount
          ledger = pushLedger(ledger, {
            id: `led-exp-${state.totalMinutes}`,
            atTotalMinutes: state.totalMinutes,
            label: scenario?.title ?? 'Expense',
            amount: pay.amount,
            kind: 'expense',
            status: 'paid',
          })
        } else {
          patch.scenarioWhyOverride =
            'Not enough savings — the bill went on credit instead, and your score took a small hit.'
          patch.debt = state.debt + pay.amount
          patch.creditScore = bumpCredit(state.creditScore, true, -10)
          patch.creditEstablished = true
        }
      } else if (pay.from === 'bank') {
        if (state.bank >= pay.amount) {
          patch.bank = state.bank - pay.amount
          ledger = pushLedger(ledger, {
            id: `led-exp-${state.totalMinutes}`,
            atTotalMinutes: state.totalMinutes,
            label: scenario?.title ?? 'Expense',
            amount: pay.amount,
            kind: 'expense',
            status: 'paid',
          })
        } else {
          patch.scenarioWhyOverride =
            'Checking couldn’t cover it — the rest went on credit with a score ding.'
          const fromBank = state.bank
          patch.bank = 0
          patch.debt = state.debt + (pay.amount - fromBank)
          patch.creditScore = bumpCredit(state.creditScore, true, -10)
          patch.creditEstablished = true
        }
      } else if (pay.from === 'cash') {
        if (state.cash >= pay.amount) patch.cash = state.cash - pay.amount
        else {
          patch.scenarioWhyOverride = 'Not enough cash — credit covered the gap.'
          patch.debt = state.debt + pay.amount
          patch.creditScore = bumpCredit(state.creditScore, true, -8)
          patch.creditEstablished = true
        }
      } else if (pay.from === 'credit') {
        if (!state.hasCreditCard && state.creditScore < CREDIT_PRODUCT_MIN && state.creditEstablished) {
          patch.scenarioWhyOverride = `No credit product yet (need score ≥ ${CREDIT_PRODUCT_MIN}). The bill was delayed and may cost more later.`
          patch.recentlyMissedBill = true
        } else {
          patch.debt = state.debt + pay.amount
          patch.creditScore = bumpCredit(state.creditScore, true, -12)
          patch.creditEstablished = true
          ledger = pushLedger(ledger, {
            id: `led-cred-${state.totalMinutes}`,
            atTotalMinutes: state.totalMinutes,
            label: scenario?.title ?? 'Credit charge',
            amount: pay.amount,
            kind: 'expense',
            status: 'paid',
          })
        }
      } else if (pay.from === 'delay') {
        if (activeScenarioId.includes('car-repair')) patch.transportationAvailable = false
        patch.creditScore = bumpCredit(state.creditScore, state.creditEstablished, -3)
        patch.recentlyMissedBill = true
      }
    }

    const billPay = choice.effects.billPay
    if (billPay) {
      const bill = state.recurringBills.find((b) => b.id === billPay.billId)
      if (bill) {
        const amount = bill.amount
        let paidOk = false
        if (billPay.from === 'bank' && state.bank >= amount) {
          patch.bank = state.bank - amount
          paidOk = true
        } else if (billPay.from === 'savings' && state.savings >= amount) {
          patch.savings = state.savings - amount
          paidOk = true
        } else if (billPay.from === 'cash' && state.cash >= amount) {
          patch.cash = state.cash - amount
          paidOk = true
        } else if (billPay.from !== 'miss') {
          patch.scenarioWhyOverride = `Not enough in that account for $${amount}. The payment was missed and added to debt.`
        }

        const bills = state.recurringBills.map((b) =>
          b.id === bill.id
            ? { ...b, nextDueTotalMinutes: Math.max(b.nextDueTotalMinutes, state.totalMinutes) + b.everyDays * MINUTES_PER_DAY }
            : b,
        )
        patch.recurringBills = bills
        patch.dueBillIds = state.dueBillIds.filter((id) => id !== bill.id)

        if (paidOk) {
          patch.creditEstablished = true
          patch.creditScore = state.creditEstablished
            ? bumpCredit(state.creditScore, true, 4)
            : CREDIT_SCORE_ON_FILE + 4
          patch.lastBillNotice = `Paid $${amount} — ${bill.label}`
          ledger = pushLedger(ledger, {
            id: `led-${bill.id}-${state.totalMinutes}`,
            atTotalMinutes: state.totalMinutes,
            label: bill.label,
            amount,
            kind: 'bill',
            status: 'paid',
          })
        } else {
          patch.debt = (typeof patch.debt === 'number' ? patch.debt : state.debt) + amount
          patch.creditEstablished = true
          patch.creditScore = bumpCredit(state.creditEstablished ? state.creditScore : CREDIT_SCORE_ON_FILE, true, -12)
          patch.recentlyMissedBill = true
          patch.lastBillNotice = `Missed $${amount} — ${bill.label} (added to debt)`
          if (!patch.scenarioWhyOverride) {
            patch.scenarioWhyOverride =
              'Missing rent/bills adds debt and hurts your credit. Catch up when you can.'
          }
          ledger = pushLedger(ledger, {
            id: `led-miss-${bill.id}-${state.totalMinutes}`,
            atTotalMinutes: state.totalMinutes,
            label: bill.label,
            amount,
            kind: 'bill',
            status: 'missed',
          })
        }
      }
    }

    if (choice.effects.hoursCut) {
      const { weeklyLoss, days } = choice.effects.hoursCut
      const base = state.weeklyIncome || 240
      const factor = Math.max(0.35, 1 - weeklyLoss / Math.max(base, 1))
      patch.incomeFactor = Math.min(state.incomeFactor, factor)
      patch.incomeFactorUntil = state.totalMinutes + days * MINUTES_PER_DAY
    }

    if (choice.effects.rentHike != null) {
      const hike = choice.effects.rentHike
      const bills = state.recurringBills.map((b) =>
        b.category === 'rent' ? { ...b, amount: b.amount + hike, label: `Maple rent ($${b.amount + hike})` } : b,
      )
      patch.recurringBills = bills
      patch.monthlyExpenses = (typeof patch.monthlyExpenses === 'number' ? patch.monthlyExpenses : state.monthlyExpenses) + hike
    }

    if (choice.effects.carDeal === 'buy') {
      if (!state.hasJob) {
        patch.scenarioWhyOverride = 'Dealers want steady income. Get hired first, then come back.'
      } else if (!state.creditEstablished || state.creditScore < CAR_CREDIT_MIN) {
        patch.scenarioWhyOverride = `Credit score too low for a car loan (need ${CAR_CREDIT_MIN}+). Keep paying bills on time.`
      } else if (state.savings < CAR_SAVINGS_MIN) {
        patch.scenarioWhyOverride = `Build at least $${CAR_SAVINGS_MIN} in savings before taking on a car.`
      } else {
        const paid = takeFromLiquid(state, CAR_BUY_DOWN)
        if (!paid) {
          patch.scenarioWhyOverride = 'You need $2,000 liquid for the down payment.'
        } else {
          let bills = removeBillsByCategory(state.recurringBills, [
            'car-loan',
            'car-lease',
            'car-insurance',
            'car-maintenance',
          ])
          bills = upsertBill(
            bills,
            billInDays('car-loan', 'Car loan payment', CAR_LOAN_MONTHLY, 30, state.totalMinutes, 'car-loan', 30),
          )
          bills = upsertBill(
            bills,
            billInDays(
              'car-insurance',
              'Car insurance',
              CAR_INSURANCE_MONTHLY,
              30,
              state.totalMinutes,
              'car-insurance',
              30,
            ),
          )
          bills = upsertBill(
            bills,
            billInDays(
              'car-maint',
              'Car maintenance fund',
              CAR_MAINTENANCE_MONTHLY,
              30,
              state.totalMinutes,
              'car-maintenance',
              30,
            ),
          )
          Object.assign(patch, paid)
          patch.carStatus = 'owned'
          patch.transportationAvailable = true
          patch.debt = state.debt + 10000
          patch.recurringBills = bills
        }
      }
    } else if (choice.effects.carDeal === 'lease') {
      if (!state.hasJob) {
        patch.scenarioWhyOverride = 'Leases need proof of income. Get a job first.'
      } else if (!state.creditEstablished || state.creditScore < CAR_CREDIT_MIN) {
        patch.scenarioWhyOverride = `Credit score too low to lease (need ${CAR_CREDIT_MIN}+).`
      } else {
        let bills = removeBillsByCategory(state.recurringBills, [
          'car-loan',
          'car-lease',
          'car-insurance',
          'car-maintenance',
        ])
        bills = upsertBill(
          bills,
          billInDays('car-lease', 'Car lease payment', CAR_LEASE_MONTHLY, 30, state.totalMinutes, 'car-lease', 30),
        )
        bills = upsertBill(
          bills,
          billInDays(
            'car-insurance',
            'Car insurance',
            CAR_INSURANCE_MONTHLY,
            30,
            state.totalMinutes,
            'car-insurance',
            30,
          ),
        )
        patch.carStatus = 'leased'
        patch.transportationAvailable = true
        patch.recurringBills = bills
      }
    }

    if (choice.effects.homeDeal === 'buy') {
      if (!state.creditEstablished || state.creditScore < HOME_CREDIT_MIN) {
        patch.scenarioWhyOverride = `Credit score ${state.creditEstablished ? state.creditScore : 'unrated'} is below ${HOME_CREDIT_MIN}. Keep paying on time.`
      } else {
        const paid = takeFromLiquid(state, HOME_DOWN_PAYMENT)
        if (!paid) {
          patch.scenarioWhyOverride = `You need $${HOME_DOWN_PAYMENT.toLocaleString()} liquid for the down payment.`
        } else {
          let bills = removeBillsByCategory(state.recurringBills, [
            'rent',
            'mortgage',
            'property-tax',
            'home-maintenance',
          ])
          bills = upsertBill(
            bills,
            billInDays('mortgage', 'Mortgage payment', MORTGAGE_MONTHLY, 30, state.totalMinutes, 'mortgage', 30),
          )
          bills = upsertBill(
            bills,
            billInDays(
              'prop-tax',
              'Property tax escrow',
              PROPERTY_TAX_MONTHLY,
              30,
              state.totalMinutes,
              'property-tax',
              30,
            ),
          )
          bills = upsertBill(
            bills,
            billInDays(
              'home-maint',
              'Home maintenance',
              HOME_MAINTENANCE_MONTHLY,
              30,
              state.totalMinutes,
              'home-maintenance',
              30,
            ),
          )
          Object.assign(patch, paid)
          patch.homeStatus = 'owned'
          patch.debt = (typeof patch.debt === 'number' ? patch.debt : state.debt) + 165000
          patch.recurringBills = bills
        }
      }
    } else if (choice.effects.homeDeal === 'keep-rent') {
      let bills = removeBillsByCategory(state.recurringBills, [
        'rent',
        'mortgage',
        'property-tax',
        'home-maintenance',
      ])
      const rentBill = state.recurringBills.find((b) => b.category === 'rent')
      const rentAmt = rentBill?.amount ?? RENT_MONTHLY
      bills = upsertBill(
        bills,
        billInDays('rent-maple', 'Maple Apartments rent', rentAmt, 30, state.totalMinutes, 'rent', 30),
      )
      patch.homeStatus = 'renting'
      patch.recurringBills = bills
    }

    patch.ledger = ledger
    set(patch as Partial<GameState>)
  },
  dismissScenario: () => {
    const { activeScenarioId, engagedScenarioIds, investingIntroSeen } = get()
    if (!activeScenarioId) return
    const openInvest = activeScenarioId === 'investing-intro'
    set({
      activeScenarioId: null,
      scenarioChoiceId: null,
      scenarioWhyOverride: null,
      engagedScenarioIds: engagedScenarioIds.includes(activeScenarioId)
        ? engagedScenarioIds
        : [...engagedScenarioIds, activeScenarioId],
      investingIntroSeen: openInvest ? true : investingIntroSeen,
      investingPanelOpen: openInvest ? true : get().investingPanelOpen,
    })
  },
  dismissBillNotice: () => set({ lastBillNotice: null }),
  dismissMarketNotice: () => set({ lastMarketNotice: null }),

  openPhone: () => {
    set({ phoneOpen: true, phoneOpenedOnce: true, dialogue: null, prompt: null, investingPanelOpen: false, optionsOpen: false })
    get().completeMissionObjective('first-day', 'open-phone')
    get().markMessagesRead()
  },
  closePhone: () => set({ phoneOpen: false }),

  openInvestingPanel: () => {
    const s = get()
    if (s.activeScenarioId) return
    if (!s.hasCheckingAccount) {
      s.openDialogue({
        name: 'Invest desk',
        text: 'Open a checking account with the teller before you can invest.',
        options: [{ label: 'OK', close: true }],
      })
      return
    }
    if (s.savings < INVEST_SAVINGS_MIN) {
      s.openDialogue({
        name: 'Invest desk',
        text: `Build a safety net first — you need about $${INVEST_SAVINGS_MIN} in savings before investing.`,
        options: [{ label: 'Got it', close: true }],
      })
      return
    }
    if (!s.investingIntroSeen) {
      s.openScenario('investing-intro')
      return
    }
    set({ investingPanelOpen: true, dialogue: null, prompt: null, phoneOpen: false })
  },
  closeInvestingPanel: () => set({ investingPanelOpen: false }),
  buyAsset: (id, shares = 1) => {
    const s = get()
    if (!s.hasCheckingAccount) return 'Open checking first.'
    if (s.savings < INVEST_SAVINGS_MIN) return `Need $${INVEST_SAVINGS_MIN}+ in savings to invest.`
    const cost = s.assetPrices[id] * shares
    if (s.bank < cost) return 'Not enough checking balance.'
    set({ bank: s.bank - cost, holdings: { ...s.holdings, [id]: s.holdings[id] + shares } })
    get().recordEducation('invest-buy')
    get().autosave()
    return null
  },
  sellAsset: (id, shares = 1) => {
    const s = get()
    if (s.holdings[id] < shares) return 'You do not own that many shares.'
    const proceeds = s.assetPrices[id] * shares
    set({ bank: s.bank + proceeds, holdings: { ...s.holdings, [id]: s.holdings[id] - shares } })
    get().recordEducation('invest-sell')
    get().autosave()
    return null
  },

  openCarDealScenario: () => {
    const s = get()
    if (s.carStatus !== 'none') {
      s.openDialogue({
        name: 'AutoMart kiosk',
        text: `You already ${s.carStatus === 'owned' ? 'own' : 'lease'} a car. Payments run on the calendar.`,
        options: [{ label: 'OK', close: true }],
      })
      return
    }
    if (!s.hasJob) {
      s.openDialogue({
        name: 'AutoMart kiosk',
        text: 'Applications need proof of income. Get a job first, then come back.',
        options: [{ label: 'OK', close: true }],
      })
      return
    }
    if (!s.creditEstablished || s.creditScore < CAR_CREDIT_MIN) {
      s.openDialogue({
        name: 'AutoMart kiosk',
        text: `Credit score too low (need ${CAR_CREDIT_MIN}+). On-time rent and bills raise it.`,
        options: [{ label: 'OK', close: true }],
      })
      return
    }
    get().recordEducation('car-deal')
    s.openScenario('car-buy-vs-lease')
  },
  openHomeDealScenario: () => {
    const s = get()
    if (s.homeStatus === 'owned') {
      s.openDialogue({
        name: 'Housing tablet',
        text: 'You already bought this unit. Mortgage, tax, and upkeep bill on the calendar.',
        options: [{ label: 'OK', close: true }],
      })
      return
    }
    get().recordEducation('home-deal')
    s.openScenario('home-rent-vs-buy')
  },
}))
}

function getOrCreateGameStore(): UseGameStore {
  const g = globalThis as typeof globalThis & { [STORE_GLOBAL]?: UseGameStore }
  const hotStore = import.meta.hot?.data?.useGame as UseGameStore | undefined
  const existing = g[STORE_GLOBAL] ?? hotStore
  const store = existing ?? createGameStore()
  g[STORE_GLOBAL] = store
  if (import.meta.hot) {
    import.meta.hot.data.useGame = store
    import.meta.hot.accept()
  }
  return store
}

export const useGame = getOrCreateGameStore()

export const SCENE_LOCATION: Record<SceneId, string> = {
  city: 'City Streets',
  bank: 'FirstCity Bank',
  grocery: 'FreshMart Grocery',
  college: 'Merridian College',
  office: 'Summit Office',
  home: 'Maple Apartments',
}

export function processDueBillsAsScenarios() {
  const s = useGame.getState()
  if (s.activeScenarioId || s.phoneOpen || s.investingPanelOpen || s.dialogue) return false
  const billId = s.dueBillIds[0]
  if (!billId) return false
  const bill = s.recurringBills.find((b) => b.id === billId)
  if (!bill) {
    useGame.setState({ dueBillIds: s.dueBillIds.filter((id) => id !== billId) })
    return false
  }
  const scenarioId = `bill-due-${bill.id}-${Math.floor(bill.nextDueTotalMinutes)}`
  if (getScenario(scenarioId)) {
    s.openScenario(scenarioId)
    return true
  }
  registerRuntimeScenario({
    id: scenarioId,
    title: `${bill.label} due`,
    badge: bill.category === 'rent' ? 'Rent due' : 'Bill due',
    setup: `${bill.label} of $${bill.amount} is due now. How do you want to pay?`,
    choices: [
      {
        id: 'bank',
        label: `Pay $${bill.amount} from checking`,
        effects: { billPay: { billId: bill.id, from: 'bank' } },
        why: 'Paying on time from checking protects your credit and keeps housing stable.',
      },
      {
        id: 'savings',
        label: `Pay $${bill.amount} from savings`,
        effects: { billPay: { billId: bill.id, from: 'savings' } },
        why: 'Savings can cover a shortfall — but that’s your emergency cushion shrinking.',
      },
      {
        id: 'cash',
        label: `Pay $${bill.amount} in cash`,
        effects: { billPay: { billId: bill.id, from: 'cash' } },
        why: 'Cash works if you have it on hand. Keep a receipt habit.',
      },
      {
        id: 'miss',
        label: 'I can’t pay today',
        effects: { billPay: { billId: bill.id, from: 'miss' } },
        why: 'Missing a payment adds debt and hurts credit. Catch up as soon as you can.',
      },
    ],
  })
  if (import.meta.env.DEV) console.debug('[bills] opening scenario', scenarioId, bill.amount)
  s.openScenario(scenarioId)
  return true
}

export function fireRandomExpenseIfDue() {
  const s = useGame.getState()
  if (s.activeScenarioId || s.phoneOpen || s.investingPanelOpen || s.dialogue) return false
  if (s.dueBillIds.length > 0) return false // bills take priority
  if (s.totalMinutes < s.nextRandomExpenseAt) return false
  const rentAmount = s.recurringBills.find((b) => b.category === 'rent')?.amount ?? RENT_MONTHLY
  const ctx: ExpenseContext = {
    weeklyIncome: Math.round(s.weeklyIncome * s.incomeFactor),
    savings: s.savings,
    bank: s.bank,
    cash: s.cash,
    debt: s.debt,
    hasJob: s.hasJob,
    recentlyMissedBill: s.recentlyMissedBill,
    rentAmount,
  }
  const { scenario } = buildRandomExpenseScenario(s.totalMinutes, ctx)
  registerRuntimeScenario(scenario)
  if (import.meta.env.DEV) {
    console.debug(
      '[expense] fire',
      scenario.id,
      'next in days≈',
      ((rollNextExpenseAt(s.totalMinutes) - s.totalMinutes) / MINUTES_PER_DAY).toFixed(1),
    )
  }
  s.openScenario(scenario.id, `rand-expense-${scenario.id}`)
  s.recordEducation('surprise-expense')
  const count = s.randomExpenseCount + 1
  useGame.setState({
    nextRandomExpenseAt: rollNextExpenseAt(s.totalMinutes, { first: count === 0 }),
    randomExpenseCount: count,
    recentlyMissedBill: scenario.id.includes('late-fee') ? false : s.recentlyMissedBill,
  })
  return true
}
