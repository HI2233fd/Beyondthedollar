/** Financial-education backbone. XP `lifeLevel` stays general progression. */

export type MasteryStatus = 'not-introduced' | 'introduced' | 'practiced' | 'developing' | 'mastered'

export type SourceFramework =
  | 'khan-academy-tx-pfl'
  | 'ngpf-semester'
  | 'jumpstart-cee-2021'
  | 'texas-pfl-teks'

export interface SourceRef {
  framework: SourceFramework
  /** Concept-level pointer so the curriculum can be updated when a source changes. Not copied lesson text. */
  ref: string
}

export interface LessonChoiceContent {
  id: string
  label: string
  reaction: string
  strong?: boolean
}

export interface ConceptLesson {
  /** One or two sentences: why this showed up in a life, not a chapter title. */
  why: string
  /** Short original teaching points. */
  points: string[]
  /** Optional deeper note, hidden until the player asks. */
  deep?: string
  choice: {
    prompt: string
    options: LessonChoiceContent[]
  }
}

export interface EduConcept {
  id: string
  title: string
  category: string
  /** Financial Life Level that owns this concept (1–12). */
  level: number
  prerequisites: string[]
  /** What a high-school student should be able to do. */
  objectives: string[]
  /** Coverage tags used by the standards self-audit. */
  covers: string[]
  sources: SourceRef[]
  lesson: ConceptLesson
  /** Gameplay event ids that introduce / practice / reinforce. */
  introduce: string[]
  practice: string[]
  reinforce: string[]
  /** Existing systems this concept uses. Future systems are named, not faked. */
  systems: string[]
  missions: string[]
  /** Existing 21-unit topic ids this concept extends. */
  legacyTopicIds: string[]
  /** How the player lives the idea. Later levels describe the experience even if the place is not built yet. */
  experience: string
}

export type CheckpointKind = 'scenario' | 'calc' | 'compare' | 'interpret' | 'decision'

export interface CheckpointQuestion {
  id: string
  level: number
  conceptId: string
  kind: CheckpointKind
  prompt: string
  choices: string[]
  correctIndex: number
  explanation: string
}

export interface UnlockDef {
  id: string
  /** Granted when this financial level's checkpoint is passed. */
  level: number
  title: string
  detail: string
  /** True only when something in the current game actually changes. */
  live: boolean
}

export interface ConceptProgress {
  status: MasteryStatus
  gameplay: number
  assessment: number
  introducedAt: number | null
}

export interface CheckpointAttempt {
  id: string
  level: number
  questionIds: string[]
  answers: Record<string, number>
  score: number
  passed: boolean
  weakConceptIds: string[]
  atMinute: number
}

export interface ActiveCheckpoint {
  id: string
  level: number
  questionIds: string[]
  answers: Record<string, number>
  submitted: boolean
}

export interface EducationState {
  financialLevel: number
  passThreshold: number
  concepts: Record<string, ConceptProgress>
  seenOnce: string[]
  seenExplainers: string[]
  pendingExplainer: string | null
  attempts: CheckpointAttempt[]
  remediation: string[]
  unlocks: string[]
  rewardedLevels: number[]
  activeCheckpoint: ActiveCheckpoint | null
  lastResult: { level: number; score: number; passed: boolean; weakConceptIds: string[] } | null
  cartTotal: number
}

export interface ExplainerContext {
  playerName: string
  gross: number
  tax: number
  net: number
  cash: number
  bank: number
  savings: number
  cartTotal: number
}
