import type { CharacterAppearance, LifeGoalId, Mission, NpcRelation, Season, Skills } from './types'

/** Expanded appearance — old saves merge via normalizeAppearance. */
export interface CharacterLook {
  skin: string
  hair: string
  hairStyle: 'short' | 'medium' | 'long' | 'bun' | 'fade'
  shirt: string
  pants: string
  shoes: string
  jacket: string | null
  face: 'soft' | 'angular' | 'round' | 'oval'
  eyeColor: string
  brow: 'soft' | 'strong' | 'arched'
  body: 'slim' | 'average' | 'athletic' | 'plus'
  accessory: 'none' | 'glasses' | 'hat' | 'earrings'
}

export const DEFAULT_LOOK: CharacterLook = {
  skin: '#d0996b',
  hair: '#241a12',
  hairStyle: 'short',
  shirt: '#2563eb',
  pants: '#1f2937',
  shoes: '#111827',
  jacket: null,
  face: 'soft',
  eyeColor: '#2c1810',
  brow: 'soft',
  body: 'average',
  accessory: 'none',
}

/** Normalize any saved appearance blob into CharacterLook. */
export function normalizeAppearance(raw: Partial<CharacterAppearance & CharacterLook> | null | undefined): CharacterLook {
  const base = { ...DEFAULT_LOOK }
  if (!raw) return base
  return {
    ...base,
    skin: raw.skin ?? base.skin,
    hair: raw.hair ?? base.hair,
    hairStyle: (raw as CharacterLook).hairStyle ?? base.hairStyle,
    shirt: raw.shirt ?? base.shirt,
    pants: raw.pants ?? base.pants,
    shoes: (raw as CharacterLook).shoes ?? base.shoes,
    jacket: (raw as CharacterLook).jacket ?? base.jacket,
    face: (raw.face as CharacterLook['face']) ?? base.face,
    eyeColor: (raw as CharacterLook).eyeColor ?? base.eyeColor,
    brow: (raw as CharacterLook).brow ?? base.brow,
    body: (raw.body as CharacterLook['body']) ?? base.body,
    accessory: (raw as CharacterLook).accessory ?? base.accessory,
  }
}

export type ActivityCategory =
  | 'main'
  | 'career'
  | 'social'
  | 'money'
  | 'event'
  | 'goal'
  | 'discover'

export interface ActivityOption {
  id: string
  category: ActivityCategory
  title: string
  reason: string
  locationHint?: string
  personHint?: string
  priority: number
  action?: 'phone' | 'goto-bank' | 'goto-office' | 'goto-grocery' | 'goto-college' | 'goto-home' | 'goto-city' | 'talk-jordan' | 'open-map'
}

export interface GuideBeat {
  id: string
  title: string
  text: string
  when: (ctx: GuideContext) => boolean
  dismissKey: string
}

export interface GuideContext {
  scene: string
  hasChecking: boolean
  hasJob: boolean
  metAnyone: boolean
  phoneOpenedOnce: boolean
  leftHome: boolean
  firstDayDone: boolean
  guideDismissed: string[]
  lifeLevel: number
}

export interface GoalMilestone {
  id: string
  goalId: LifeGoalId
  label: string
  done: boolean
}

export interface PhoneMessage {
  id: string
  from: string
  body: string
  atTotalMinutes: number
  read: boolean
  opportunityId?: string
}

export interface WorldNpc {
  id: string
  name: string
  age: number
  occupation: string
  personality: string
  interests: string[]
  appearance: CharacterLook
  homeHint: string
  workHint: string
  sociability: number
  ambition: number
  schedule: 'day' | 'evening' | 'flexible'
}

export interface RewardPopup {
  id: string
  title: string
  lines: string[]
  xp?: number
  cash?: number
  createdAt: number
}

export type { CharacterAppearance, LifeGoalId, Mission, NpcRelation, Season, Skills }
