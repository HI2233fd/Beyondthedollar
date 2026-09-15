import type { SceneId } from '../GameState'

/** Which city building hosts a unit's learning station. */
export type BuildingId = 'home' | 'bank' | 'college' | 'grocery' | 'office'

export interface QuizQuestion {
  id: string
  prompt: string
  choices: string[]
  /** Index into `choices`. */
  correctIndex: number
  explanation: string
}

export interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
}

export interface Lesson {
  id: string
  title: string
  /** ~300–500 words of original lesson body (plain text; paragraphs separated by blank lines). */
  body: string
  /** One short closing line shown after the body. */
  whyItMatters: string
  quiz: Quiz
}

export interface Topic {
  id: string
  title: string
  summary: string
  lesson: Lesson
}

export interface Unit {
  id: string
  number: number
  title: string
  summary: string
  buildingId: BuildingId
  topics: Topic[]
}

export type LessonStatus = 'locked' | 'available' | 'completed'

/** Map building → scene used by LearningStation placement. */
export const BUILDING_SCENE: Record<BuildingId, SceneId> = {
  home: 'home',
  bank: 'bank',
  college: 'college',
  grocery: 'grocery',
  office: 'office',
}
