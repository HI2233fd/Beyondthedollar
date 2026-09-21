export type LifeGoalId =
  | 'career'
  | 'entrepreneurship'
  | 'financialFreedom'
  | 'education'
  | 'home'
  | 'cars'
  | 'investing'
  | 'travel'
  | 'relationships'
  | 'creativity'
  | 'helping'
  | 'adventure'

export interface LifeGoalDef {
  id: LifeGoalId
  label: string
  blurb: string
  icon: string
}

export interface CharacterAppearance {
  skin: string
  hair: string
  shirt: string
  pants: string
  face: 'soft' | 'angular' | 'round'
  body: 'slim' | 'average' | 'athletic'
}

export type SkillId =
  | 'communication'
  | 'business'
  | 'technology'
  | 'creativity'
  | 'leadership'
  | 'financial'
  | 'problemSolving'

export type Skills = Record<SkillId, number>

export type RelationshipTier = 'stranger' | 'acquaintance' | 'friend' | 'closeFriend'
export type ProfessionalTier = 'unknown' | 'contact' | 'connection' | 'trusted'

export interface NpcRelation {
  affinity: number
  met: boolean
  talks: number
  tier: RelationshipTier
  professional: ProfessionalTier
  memories: string[]
  lastTalkAt: number
}

export type MissionCategory = 'main' | 'side' | 'opportunity' | 'challenge' | 'hidden' | 'completed'

export interface MissionObjective {
  id: string
  label: string
  done: boolean
}

export interface Mission {
  id: string
  title: string
  category: MissionCategory
  description: string
  objectives: MissionObjective[]
  rewardXp: number
  rewardCash?: number
  followUpId?: string
  locationHint?: string
  personHint?: string
  completed: boolean
}

export type Season = 'spring' | 'summer' | 'fall' | 'winter'

export interface Achievement {
  id: string
  title: string
  unlockedAt: number | null
}

export const LIFE_GOALS: LifeGoalDef[] = [
  { id: 'career', label: 'Career Success', blurb: 'Climb through real jobs and skills.', icon: '💼' },
  { id: 'entrepreneurship', label: 'Entrepreneurship', blurb: 'Build something that is yours.', icon: '🚀' },
  { id: 'financialFreedom', label: 'Financial Freedom', blurb: 'Money works for you, not the reverse.', icon: '🕊️' },
  { id: 'education', label: 'Education', blurb: 'Learn paths that open doors.', icon: '🎓' },
  { id: 'home', label: 'Dream Home', blurb: 'A place that feels like yours.', icon: '🏠' },
  { id: 'cars', label: 'Cars', blurb: 'Mobility, style, and tradeoffs.', icon: '🚗' },
  { id: 'investing', label: 'Investing', blurb: 'Grow wealth through markets.', icon: '📈' },
  { id: 'travel', label: 'Travel', blurb: 'See more of the world.', icon: '✈️' },
  { id: 'relationships', label: 'Relationships', blurb: 'Friends, mentors, partners.', icon: '🤝' },
  { id: 'creativity', label: 'Creativity', blurb: 'Make art, media, ideas.', icon: '🎨' },
  { id: 'helping', label: 'Helping Others', blurb: 'Lift people up as you grow.', icon: '💚' },
  { id: 'adventure', label: 'Adventure', blurb: 'Discover secrets and surprises.', icon: '🗺️' },
]

export const DEFAULT_APPEARANCE: CharacterAppearance = {
  skin: '#d0996b',
  hair: '#241a12',
  shirt: '#2563eb',
  pants: '#1f2937',
  face: 'soft',
  body: 'average',
}

export const DEFAULT_SKILLS: Skills = {
  communication: 1,
  business: 1,
  technology: 1,
  creativity: 1,
  leadership: 1,
  financial: 1,
  problemSolving: 1,
}

export const SKILL_LABELS: Record<SkillId, string> = {
  communication: 'Communication',
  business: 'Business',
  technology: 'Technology',
  creativity: 'Creativity',
  leadership: 'Leadership',
  financial: 'Financial Knowledge',
  problemSolving: 'Problem Solving',
}

export const XP_PER_LEVEL = 100
export const DOWNTOWN_UNLOCK_LEVEL = 10

export function xpNeededForLevel(level: number): number {
  return Math.round(XP_PER_LEVEL * (1 + (level - 1) * 0.35))
}

export function relationTierFromAffinity(affinity: number): RelationshipTier {
  if (affinity >= 60) return 'closeFriend'
  if (affinity >= 30) return 'friend'
  if (affinity >= 8) return 'acquaintance'
  return 'stranger'
}

export function professionalFromTalks(talks: number, affinity: number): ProfessionalTier {
  if (talks >= 6 && affinity >= 40) return 'trusted'
  if (talks >= 3 && affinity >= 20) return 'connection'
  if (talks >= 1) return 'contact'
  return 'unknown'
}
