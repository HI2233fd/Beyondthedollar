import type { GuideBeat, GuideContext } from './characterLook'

/** Directive beats — each push one concrete next action (paced, not roam). */
export const GUIDE_BEATS: GuideBeat[] = [
  {
    id: 'wake',
    title: 'Step 1 — Look around',
    text: 'You’re home. Take a quick look around, then tap Got it.',
    dismissKey: 'wake',
    when: (c) => c.scene === 'home' && !c.guideDismissed.includes('wake'),
  },
  {
    id: 'leave',
    title: 'Step 2 — Exit to the city',
    text: 'Find the glowing EXIT mat and press E. Next stop: meet Jordan or open your phone.',
    dismissKey: 'leave',
    when: (c) => c.scene === 'home' && !c.leftHome && c.guideDismissed.includes('wake') && !c.guideDismissed.includes('leave'),
  },
  {
    id: 'phone',
    title: 'Step 3 — Open your Life Hub',
    text: 'Press P (or tap Phone). This is mission control — jobs, money, and “What can I do?”',
    dismissKey: 'phone',
    when: (c) => !c.phoneOpenedOnce && c.leftHome && !c.guideDismissed.includes('phone'),
  },
  {
    id: 'meet',
    title: 'Step 4 — Meet Jordan',
    text: 'Talk to Jordan at home. People unlock opportunities — tap Go if you need a warp.',
    dismissKey: 'meet',
    when: (c) => !c.metAnyone && c.phoneOpenedOnce && !c.guideDismissed.includes('meet'),
  },
  {
    id: 'bank',
    title: 'Step 5 — Open checking',
    text: 'Walk into FirstCity Bank (or tap Go). No checking account = no direct deposit job.',
    dismissKey: 'bank',
    when: (c) => !c.hasChecking && c.metAnyone && !c.guideDismissed.includes('bank'),
  },
  {
    id: 'job',
    title: 'Step 6 — Get hired',
    text: 'Interview with Diane at Summit Tower. Nail it and your first ~$300 take-home lands Sept 2.',
    dismissKey: 'job',
    when: (c) => c.hasChecking && !c.hasJob && !c.guideDismissed.includes('job'),
  },
  {
    id: 'payday',
    title: 'Step 7 — Collect payday',
    text: 'First deposit hits Sept 2 morning (~$300 after tax). Tap Go / “Collect payday” to skip ahead.',
    dismissKey: 'payday',
    when: (c) => c.hasJob && c.paystubCount === 0 && !c.guideDismissed.includes('payday'),
  },
  {
    id: 'next',
    title: 'Keep the streak',
    text: 'Save a slice, grocery run, or bank lesson on credit. The coach always shows your next move.',
    dismissKey: 'next',
    when: (c) =>
      c.hasJob &&
      (c.paystubCount > 0 || c.guideDismissed.includes('payday')) &&
      !c.guideDismissed.includes('next'),
  },
]

export function activeGuideBeat(ctx: GuideContext): GuideBeat | null {
  return GUIDE_BEATS.find((b) => b.when(ctx)) ?? null
}
