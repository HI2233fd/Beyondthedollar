import type { CharacterAppearance, LifeGoalId, Mission, NpcRelation, Season, Skills } from './types'

/** Expanded appearance — old saves merge via normalizeAppearance. */
export interface CharacterLook {
  skin: string
  hair: string
  hairStyle: 'side-part' | 'buzz' | 'long' | 'buns' | 'short' | 'medium' | 'bun' | 'fade'
  shirt: string
  pants: string
  shoes: string
  jacket: string | null
  face: 'soft' | 'angular' | 'round' | 'oval'
  eyeColor: string
  brow: 'soft' | 'strong' | 'arched'
  body: 'slim' | 'average' | 'athletic' | 'plus'
  accessory: 'none' | 'glasses' | 'hat' | 'earrings'
  style: 'casual' | 'athletic' | 'professional'
  height: 'short' | 'average' | 'tall'
}

export const STYLE_CLOTHES = {
  casual: { pants: '#334b65', shoes: '#e4e1d7' },
  athletic: { pants: '#283c43', shoes: '#e4e1d7' },
  professional: { pants: '#343843', shoes: '#39312b' },
} as const

export const DEFAULT_LOOK: CharacterLook = {
  skin: '#d6a47b',
  hair: '#5c4033',
  hairStyle: 'side-part',
  shirt: '#e7e1d6',
  pants: '#334b65',
  shoes: '#e4e1d7',
  jacket: '#1e3a5f',
  face: 'soft',
  eyeColor: '#2c1810',
  brow: 'soft',
  body: 'average',
  accessory: 'none',
  style: 'casual',
  height: 'average',
}

const HAIR_ALIASES: Record<string, CharacterLook['hairStyle']> = {
  short: 'side-part',
  medium: 'side-part',
  fade: 'buzz',
  bun: 'buns',
  'side-part': 'side-part',
  buzz: 'buzz',
  long: 'long',
  buns: 'buns',
}

/** Normalize any saved appearance blob into CharacterLook. */
export function normalizeAppearance(raw: Partial<CharacterAppearance & CharacterLook> | null | undefined): CharacterLook {
  const base = { ...DEFAULT_LOOK }
  if (!raw) return base
  return {
    ...base,
    skin: raw.skin ?? base.skin,
    hair: raw.hair ?? base.hair,
    hairStyle: HAIR_ALIASES[(raw as CharacterLook).hairStyle ?? ''] ?? base.hairStyle,
    shirt: raw.shirt ?? base.shirt,
    pants: raw.pants ?? base.pants,
    shoes: (raw as CharacterLook).shoes ?? base.shoes,
    jacket: raw && 'jacket' in raw ? ((raw as CharacterLook).jacket ?? null) : raw ? null : base.jacket,
    face: (raw.face as CharacterLook['face']) ?? base.face,
    eyeColor: (raw as CharacterLook).eyeColor ?? base.eyeColor,
    brow: (raw as CharacterLook).brow ?? base.brow,
    body: (raw.body as CharacterLook['body']) ?? base.body,
    accessory: (raw as CharacterLook).accessory ?? base.accessory,
    style: (raw as CharacterLook).style ?? (raw.body === 'athletic' ? 'athletic' : base.style),
    height: (raw as CharacterLook).height ?? base.height,
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
  /** Direct life-play action. Prefer this over warping the player. */
  play?: { type: string; [key: string]: unknown }
  action?:
    | 'phone'
    | 'goto-bank'
    | 'goto-office'
    | 'goto-grocery'
    | 'goto-college'
    | 'goto-home'
    | 'goto-city'
    | 'talk-jordan'
    | 'open-map'
    | 'advance-payday'
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
  paystubCount: number
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
