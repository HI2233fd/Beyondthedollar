export { CONCEPTS, CONCEPT_BY_ID, conceptsForLevel } from './concepts'
export { CHECKPOINT_POOL, questionsForLevel } from './checkpoints'
export { UNLOCKS, unlocksForPassedLevel } from './unlocks'
export { REQUIRED_THEMES } from './themes'
export { buildExplainer } from './explainers'
export {
  DEFAULT_PASS_THRESHOLD,
  MAX_FINANCIAL_LEVEL,
  initialEducation,
  normalizeEducation,
  recordEvent,
  markExplainerSeen,
  buildCheckpoint,
  checkpointReady,
  scoreActive,
  submitActive,
  missingThemes,
  conceptIdsUnknown,
  deriveStatus,
  levelTitle,
  backfillEducation,
} from './engine'
export type { EducationState, EduConcept, MasteryStatus, ExplainerContext } from './types'
