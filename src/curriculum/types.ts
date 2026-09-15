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

export interface CurriculumProgress {
  /** Topic IDs whose lesson+quiz are fully completed. */
  completedTopicIds: string[]
  /** Highest unit number unlocked (1-based). Completing a unit unlocks the next. */
  unlockedUnitNumber: number
  /** Open overlay: lesson reading or quiz. */
  activeLessonId: string | null
  activeQuizId: string | null
  /** Current quiz answers keyed by question id → chosen index. */
  quizAnswers: Record<string, number>
  quizSubmitted: boolean
}

/** Map building → scene used by LearningStation placement. */
export const BUILDING_SCENE: Record<BuildingId, SceneId> = {
  home: 'home',
  bank: 'bank',
  college: 'college',
  grocery: 'grocery',
  office: 'office',
}
