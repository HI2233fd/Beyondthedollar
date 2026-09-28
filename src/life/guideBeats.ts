import type { GuideBeat, GuideContext } from './characterLook'

/** Short onboarding only. After the player leaves home, the guide stops giving orders. */
export const GUIDE_BEATS: GuideBeat[] = [
  {
    id: 'wake',
    title: 'Morning',
    text: 'It is 7:00. Eat from the fridge, change in the closet if you want, then head to Merridian High before first period.',
    dismissKey: 'wake',
    when: (c) => c.scene === 'home' && !c.guideDismissed.includes('wake'),
  },
  {
    id: 'leave',
    title: 'Get to campus',
    text: 'EXIT to the street, then walk to Merridian High. Sit at a desk when class starts. Lunch is a real cafeteria line.',
    dismissKey: 'leave',
    when: (c) => c.scene === 'home' && !c.leftHome && c.guideDismissed.includes('wake') && !c.guideDismissed.includes('leave'),
  },
  {
    id: 'open-world',
    title: 'After school the city opens up',
    text: 'Work a café shift, shop FreshMart (food comes home), or buy a car and drive it. Sleep at home when you are done.',
    dismissKey: 'open-world',
    when: (c) => c.leftHome && !c.guideDismissed.includes('open-world'),
  },
]

export function activeGuideBeat(ctx: GuideContext): GuideBeat | null {
  return GUIDE_BEATS.find((b) => b.when(ctx)) ?? null
}
