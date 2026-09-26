import type { GuideBeat, GuideContext } from './characterLook'

/** Short onboarding only. After the player leaves home, the guide stops giving orders. */
export const GUIDE_BEATS: GuideBeat[] = [
  {
    id: 'wake',
    title: 'You are home',
    text: 'Look around the apartment. Rent is on a timer. Nothing in the city is assigned yet.',
    dismissKey: 'wake',
    when: (c) => c.scene === 'home' && !c.guideDismissed.includes('wake'),
  },
  {
    id: 'leave',
    title: 'The door is yours',
    text: 'The glowing EXIT mat leads outside. Your phone will list what you notice — you choose what to chase.',
    dismissKey: 'leave',
    when: (c) => c.scene === 'home' && !c.leftHome && c.guideDismissed.includes('wake') && !c.guideDismissed.includes('leave'),
  },
  {
    id: 'open-world',
    title: 'Several things at once',
    text: 'Work, the bank, groceries, a neighbor, a phone listing. Open your phone (P) and pick. There is no single next marker.',
    dismissKey: 'open-world',
    when: (c) => c.leftHome && !c.guideDismissed.includes('open-world'),
  },
]

export function activeGuideBeat(ctx: GuideContext): GuideBeat | null {
  return GUIDE_BEATS.find((b) => b.when(ctx)) ?? null
}
