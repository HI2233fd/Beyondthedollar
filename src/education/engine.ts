import { CONCEPTS, CONCEPT_BY_ID, conceptsForLevel } from './concepts'
import { questionsForLevel } from './checkpoints'
import { REQUIRED_THEMES } from './themes'
import { unlocksForPassedLevel } from './unlocks'
import type {
  ActiveCheckpoint,
  CheckpointAttempt,
  CheckpointQuestion,
  ConceptProgress,
  EducationState,
  MasteryStatus,
} from './types'

export const DEFAULT_PASS_THRESHOLD = 0.8
export const MAX_FINANCIAL_LEVEL = 12

const ONCE_EVENTS = new Set([
  'explore-home',
  'leave-home',
  'goal-set',
  'get-hired',
  'interview',
  'open-checking',
  'open-savings',
  'credit-card',
  'car-deal',
  'home-deal',
])

export function initialEducation(): EducationState {
  return {
    financialLevel: 1,
    passThreshold: DEFAULT_PASS_THRESHOLD,
    concepts: {},
    seenOnce: [],
    seenExplainers: [],
    pendingExplainer: null,
    attempts: [],
    remediation: [],
    unlocks: [],
    rewardedLevels: [],
    activeCheckpoint: null,
    lastResult: null,
    cartTotal: 0,
  }
}

function blankProgress(): ConceptProgress {
  return { status: 'not-introduced', gameplay: 0, assessment: 0, introducedAt: null }
}

export function deriveStatus(gameplay: number, assessment: number, introduced: boolean): MasteryStatus {
  if ((assessment >= 1 && gameplay >= 1) || assessment >= 2) return 'mastered'
  if (assessment >= 1 || gameplay >= 2) return 'developing'
  if (gameplay >= 1) return 'practiced'
  if (introduced) return 'introduced'
  return 'not-introduced'
}

function bump(prev: ConceptProgress | undefined, kind: 'introduce' | 'gameplay' | 'assessment', minute: number): ConceptProgress {
  const cur = prev ?? blankProgress()
  const gameplay = cur.gameplay + (kind === 'gameplay' ? 1 : 0)
  const assessment = cur.assessment + (kind === 'assessment' ? 1 : 0)
  const introducedAt = cur.introducedAt ?? minute
  return {
    gameplay,
    assessment,
    introducedAt,
    status: deriveStatus(gameplay, assessment, true),
  }
}

export function conceptsTouchedByEvent(event: string): { id: string; kind: 'introduce' | 'gameplay' }[] {
  const hits: { id: string; kind: 'introduce' | 'gameplay' }[] = []
  for (const concept of CONCEPTS) {
    const practicing = concept.practice.includes(event) || concept.reinforce.includes(event)
    const introducing = concept.introduce.includes(event)
    if (practicing) hits.push({ id: concept.id, kind: 'gameplay' })
    else if (introducing) hits.push({ id: concept.id, kind: 'introduce' })
  }
  return hits
}

export function recordEvent(
  state: EducationState,
  event: string,
  minute: number,
  meta?: { cartTotal?: number },
): EducationState {
  if (!event) return state
  if (ONCE_EVENTS.has(event) && state.seenOnce.includes(event)) return state
  const concepts = { ...state.concepts }
  if (event.startsWith('concept:')) {
    const id = event.slice('concept:'.length)
    if (CONCEPT_BY_ID[id]) concepts[id] = bump(concepts[id], 'introduce', minute)
  }
  const hits = conceptsTouchedByEvent(event)
  if (hits.length === 0 && !event.startsWith('lesson:') && !event.startsWith('quiz:') && !event.startsWith('concept:')) {
    return ONCE_EVENTS.has(event) ? { ...state, seenOnce: [...state.seenOnce, event] } : state
  }
  for (const hit of hits) {
    concepts[hit.id] = bump(concepts[hit.id], hit.kind, minute)
  }
  let pendingExplainer = state.pendingExplainer
  if (event === 'payday' && !state.seenExplainers.includes('paycheck')) pendingExplainer = 'paycheck'
  if (event === 'open-checking' && !state.seenExplainers.includes('checking')) pendingExplainer = pendingExplainer ?? 'checking'
  if (event === 'shop' && !state.seenExplainers.includes('shop')) pendingExplainer = pendingExplainer ?? 'shop'
  return {
    ...state,
    concepts,
    cartTotal: meta?.cartTotal ?? state.cartTotal,
    seenOnce: ONCE_EVENTS.has(event) ? [...state.seenOnce, event] : state.seenOnce,
    pendingExplainer,
  }
}

export function backfillEducation(
  state: EducationState,
  flags: {
    hasChecking: boolean
    hasJob: boolean
    hasCreditCard: boolean
    savings: number
    paystubCount: number
    completedTopicIds: string[]
    goalsCount?: number
  },
): EducationState {
  let next = state
  if ((flags.goalsCount ?? 0) > 0) next = recordEvent(next, 'goal-set', 0)
  if (flags.hasChecking) next = recordEvent(next, 'open-checking', 0)
  if (flags.hasJob) next = recordEvent(next, 'get-hired', 0)
  if (flags.hasCreditCard) next = recordEvent(next, 'credit-card', 0)
  if (flags.savings > 0) next = recordEvent(next, 'transfer-savings', 0)
  if (flags.paystubCount > 0) next = recordEvent(next, 'payday', 0)
  for (const topic of flags.completedTopicIds) next = recordEvent(next, `quiz:${topic}`, 0)
  return { ...next, pendingExplainer: null, seenExplainers: [...new Set([...next.seenExplainers, 'paycheck', 'checking', 'shop'])] }
}

export function markExplainerSeen(state: EducationState, id: string): EducationState {
  if (state.seenExplainers.includes(id)) {
    return { ...state, pendingExplainer: state.pendingExplainer === id ? null : state.pendingExplainer }
  }
  return {
    ...state,
    seenExplainers: [...state.seenExplainers, id],
    pendingExplainer: state.pendingExplainer === id ? null : state.pendingExplainer,
  }
}

function rand(seed: number): () => number {
  let s = seed % 2147483646
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function buildCheckpoint(state: EducationState, level: number): ActiveCheckpoint {
  const pool = questionsForLevel(level)
  const roll = rand(state.attempts.filter((a) => a.level === level).length + 11 + level * 17)
  const weak = new Set(state.remediation)
  const ranked = [...pool].sort((a, b) => {
    const aw = weak.has(a.conceptId) ? 0 : 1
    const bw = weak.has(b.conceptId) ? 0 : 1
    if (aw !== bw) return aw - bw
    return roll() - 0.5
  })
  const picked: CheckpointQuestion[] = []
  const usedConcepts = new Set<string>()
  for (const q of ranked) {
    if (picked.length >= 6) break
    if (usedConcepts.has(q.conceptId) && picked.length < pool.length) continue
    picked.push(q)
    usedConcepts.add(q.conceptId)
  }
  for (const q of ranked) {
    if (picked.length >= 6) break
    if (!picked.includes(q)) picked.push(q)
  }
  return {
    id: `cp-${level}-${state.attempts.length + 1}`,
    level,
    questionIds: picked.map((q) => q.id),
    answers: {},
    submitted: false,
  }
}

export function checkpointReady(state: EducationState, level = state.financialLevel): boolean {
  const concepts = conceptsForLevel(level)
  if (concepts.length === 0) return false
  const progressed = concepts.filter((c) => {
    const status = state.concepts[c.id]?.status ?? 'not-introduced'
    return status === 'practiced' || status === 'developing' || status === 'mastered'
  }).length
  return progressed >= Math.max(2, Math.ceil(concepts.length / 3))
}

export interface CheckpointScore {
  score: number
  correct: number
  total: number
  passed: boolean
  weakConceptIds: string[]
}

export function scoreActive(state: EducationState): CheckpointScore | null {
  const active = state.activeCheckpoint
  if (!active) return null
  const questions = active.questionIds
    .map((id) => questionsForLevel(active.level).find((q) => q.id === id))
    .filter((q): q is CheckpointQuestion => !!q)
  let correct = 0
  const weak = new Set<string>()
  for (const q of questions) {
    if (active.answers[q.id] === q.correctIndex) correct += 1
    else weak.add(q.conceptId)
  }
  const total = questions.length || 1
  const score = correct / total
  return {
    score,
    correct,
    total: questions.length,
    passed: questions.length > 0 && score + 1e-9 >= state.passThreshold,
    weakConceptIds: [...weak],
  }
}

export function submitActive(state: EducationState, minute: number): EducationState {
  const active = state.activeCheckpoint
  if (!active || active.submitted) return state
  const result = scoreActive(state)
  if (!result) return state
  const concepts = { ...state.concepts }
  const questions = active.questionIds
    .map((id) => questionsForLevel(active.level).find((q) => q.id === id))
    .filter((q): q is CheckpointQuestion => !!q)
  for (const q of questions) {
    if (active.answers[q.id] === q.correctIndex) {
      concepts[q.conceptId] = bump(concepts[q.conceptId], 'assessment', minute)
    }
  }
  const attempt: CheckpointAttempt = {
    id: active.id,
    level: active.level,
    questionIds: active.questionIds,
    answers: { ...active.answers },
    score: result.score,
    passed: result.passed,
    weakConceptIds: result.weakConceptIds,
    atMinute: minute,
  }
  let financialLevel = state.financialLevel
  let unlocks = state.unlocks
  let remediation = result.weakConceptIds
  let rewardedLevels = state.rewardedLevels
  if (result.passed && !rewardedLevels.includes(active.level)) {
    rewardedLevels = [...rewardedLevels, active.level]
    const gained = unlocksForPassedLevel(active.level).map((u) => u.id)
    unlocks = [...new Set([...unlocks, ...gained])]
    if (active.level === state.financialLevel && state.financialLevel < MAX_FINANCIAL_LEVEL) {
      financialLevel += 1
    }
    remediation = []
  }
  return {
    ...state,
    concepts,
    financialLevel,
    unlocks,
    rewardedLevels,
    remediation,
    attempts: [...state.attempts, attempt],
    activeCheckpoint: { ...active, submitted: true },
    lastResult: {
      level: active.level,
      score: result.score,
      passed: result.passed,
      weakConceptIds: result.weakConceptIds,
    },
  }
}

export function missingThemes(): string[] {
  const have = new Set(CONCEPTS.flatMap((c) => c.covers))
  return REQUIRED_THEMES.filter((t) => !have.has(t))
}

export function conceptIdsUnknown(): string[] {
  const ids = new Set(CONCEPTS.map((c) => c.id))
  const bad: string[] = []
  for (const c of CONCEPTS) {
    for (const pre of c.prerequisites) {
      const prior = CONCEPT_BY_ID[pre]
      if (!prior) bad.push(`${c.id} missing prereq ${pre}`)
      else if (prior.level > c.level) bad.push(`${c.id} prereq ${pre} is a later level`)
    }
  }
  for (const q of questionsForLevel(0).concat(...Array.from({ length: 12 }, (_, i) => questionsForLevel(i + 1)))) {
    if (!ids.has(q.conceptId)) bad.push(`question ${q.id} unknown concept ${q.conceptId}`)
  }
  return bad
}

export function normalizeEducation(raw: unknown): EducationState {
  const base = initialEducation()
  if (!raw || typeof raw !== 'object') return base
  const r = raw as Partial<EducationState>
  const level = typeof r.financialLevel === 'number' ? Math.min(MAX_FINANCIAL_LEVEL, Math.max(1, r.financialLevel)) : 1
  const threshold =
    typeof r.passThreshold === 'number' && r.passThreshold > 0 && r.passThreshold <= 1
      ? r.passThreshold
      : DEFAULT_PASS_THRESHOLD
  return {
    ...base,
    ...r,
    financialLevel: level,
    passThreshold: threshold,
    concepts: r.concepts && typeof r.concepts === 'object' ? r.concepts : {},
    seenOnce: Array.isArray(r.seenOnce) ? r.seenOnce : [],
    seenExplainers: Array.isArray(r.seenExplainers) ? r.seenExplainers : [],
    pendingExplainer: typeof r.pendingExplainer === 'string' ? r.pendingExplainer : null,
    attempts: Array.isArray(r.attempts) ? r.attempts : [],
    remediation: Array.isArray(r.remediation) ? r.remediation : [],
    unlocks: Array.isArray(r.unlocks) ? r.unlocks : [],
    rewardedLevels: Array.isArray(r.rewardedLevels) ? r.rewardedLevels : [],
    activeCheckpoint: r.activeCheckpoint ?? null,
    lastResult: r.lastResult ?? null,
    cartTotal: typeof r.cartTotal === 'number' ? r.cartTotal : 0,
  }
}

export function levelTitle(level: number): string {
  const titles = [
    '',
    'Starting Out',
    'Earning Money',
    'Banking & Saving',
    'Managing Your Money',
    'Credit',
    'Transportation & Debt',
    'Moving Out',
    'Education & Career',
    'Investing',
    'Wealth & Retirement',
    'Homeownership',
    'Entrepreneurship & Financial Independence',
  ]
  return titles[level] ?? `Level ${level}`
}
