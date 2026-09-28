import type { BuildingId, Lesson, Topic, Unit } from './types'
import { UNITS_PART_1 } from './content/unitsPart1'
import { UNITS_PART_2 } from './content/unitsPart2'

export const CURRICULUM: Unit[] = [...UNITS_PART_1, ...UNITS_PART_2].sort((a, b) => a.number - b.number)

export function getUnit(unitNumber: number): Unit | undefined {
  return CURRICULUM.find((u) => u.number === unitNumber)
}

export function getLesson(lessonId: string): Lesson | undefined {
  for (const u of CURRICULUM) {
    for (const t of u.topics) {
      if (t.lesson.id === lessonId) return t.lesson
    }
  }
  return undefined
}

export function unitForLesson(lessonId: string): Unit | undefined {
  return CURRICULUM.find((u) => u.topics.some((t) => t.lesson.id === lessonId))
}

export function unitsForBuilding(buildingId: BuildingId): Unit[] {
  return CURRICULUM.filter((u) => u.buildingId === buildingId)
}

export function buildingHasActiveCurriculum(
  buildingId: BuildingId,
  unlockedUnitNumber: number,
  completedTopicIds: string[],
): boolean {
  return CURRICULUM.some((u) => {
    if (u.buildingId !== buildingId) return false
    if (u.number > unlockedUnitNumber) return false
    return u.topics.some((t) => !completedTopicIds.includes(t.id))
  })
}

export function nextAvailableTopic(
  unlockedUnitNumber: number,
  completedTopicIds: string[],
): { unit: Unit; topic: Topic } | null {
  for (const u of CURRICULUM) {
    if (u.number > unlockedUnitNumber) break
    for (const t of u.topics) {
      if (!completedTopicIds.includes(t.id)) return { unit: u, topic: t }
    }
  }
  return null
}

export function nextAvailableTopicAtBuilding(
  buildingId: BuildingId,
  unlockedUnitNumber: number,
  completedTopicIds: string[],
): { unit: Unit; topic: Topic } | null {
  for (const u of unitsForBuilding(buildingId)) {
    if (u.number > unlockedUnitNumber) continue
    for (const t of u.topics) {
      if (!completedTopicIds.includes(t.id)) return { unit: u, topic: t }
    }
  }
  return null
}

export function isUnitComplete(unit: Unit, completedTopicIds: string[]): boolean {
  return unit.topics.every((t) => completedTopicIds.includes(t.id))
}

export function unlockedAfterCompleting(
  completedTopicIds: string[],
  previousUnlocked: number,
): number {
  let unlocked = previousUnlocked
  for (const u of CURRICULUM) {
    if (u.number > unlocked) break
    if (isUnitComplete(u, completedTopicIds)) {
      unlocked = Math.max(unlocked, Math.min(21, u.number + 1))
    }
  }
  return unlocked
}

export type { BuildingId, Lesson, LessonBeat, LessonChoice, Topic, Unit, Quiz, QuizQuestion } from './types'
export { resolveLessonBeats } from './interactiveBeats'
