import type { SceneId } from '../../GameState'

/** Numeric stats a scenario choice may change (deltas). */
export type ScenarioStat =
  | 'cash'
  | 'bank'
  | 'savings'
  | 'creditScore'
  | 'debt'
  | 'weeklyIncome'
  | 'monthlyExpenses'

export interface ScenarioEffects {
  /** Additive deltas applied immediately on choose. */
  stats?: Partial<Record<ScenarioStat, number>>
  /** Optional boolean flags toggled on the game state. */
  flags?: Partial<{
    hasJob: boolean
    transportationAvailable: boolean
  }>
}

export interface ScenarioChoice {
  id: string
  /** Action label only — no long explanation before the pick. */
  label: string
  effects: ScenarioEffects
  /** 1–2 sentences shown AFTER the choice. */
  why: string
}

/**
 * Data-driven decision pop-up.
 * Setup is 1–3 short sentences; never a lesson article.
 */
export interface ScenarioDef {
  id: string
  title: string
  /** Small badge, e.g. "Scenario", "News", "Bill due". */
  badge?: string
  /** 1–3 sentences of setup. */
  setup: string
  choices: [ScenarioChoice, ScenarioChoice, ...ScenarioChoice[]]
  /** Optional curriculum linkage (progress wiring comes later). */
  unitNumber?: number
  topicId?: string
}

export type ScenarioTriggerKind = 'calendar' | 'location' | 'action'

export interface CalendarScenarioTrigger {
  id: string
  kind: 'calendar'
  scenarioId: string
  /** Fire the first time totalMinutes >= this value. */
  atTotalMinutes: number
  once?: boolean
}

export interface LocationScenarioTrigger {
  id: string
  kind: 'location'
  scenarioId: string
  scene: SceneId
  /** Fire once when player enters this scene (after optional delay ms). */
  once?: boolean
  delayMs?: number
}

export type ScenarioTrigger = CalendarScenarioTrigger | LocationScenarioTrigger
