import type { GuideBeat, GuideContext } from './characterLook'

export const GUIDE_BEATS: GuideBeat[] = [
  {
    id: 'wake',
    title: 'Welcome to your life',
    text: 'This is your home. Look around, then head outside when you’re ready. I’ll only jump in when it helps.',
    dismissKey: 'wake',
    when: (c) => c.scene === 'home' && !c.guideDismissed.includes('wake'),
  },
  {
    id: 'leave',
    title: 'The city is waiting',
    text: 'Find the glowing EXIT mat and press E. Your neighborhood has a bank, grocery, college, and jobs.',
    dismissKey: 'leave',
    when: (c) => c.scene === 'home' && !c.leftHome && c.guideDismissed.includes('wake') && !c.guideDismissed.includes('leave'),
  },
  {
    id: 'phone',
    title: 'Your Life Hub',
    text: 'Press P or tap Phone anytime. It answers: what can I do, where do I go, who do I know, how is my life?',
    dismissKey: 'phone',
    when: (c) => !c.phoneOpenedOnce && c.leftHome && !c.guideDismissed.includes('phone'),
  },
  {
    id: 'meet',
    title: 'People open doors',
    text: 'Talk to Jordan at home — acquaintances become friends, and friends create opportunities.',
    dismissKey: 'meet',
    when: (c) => !c.metAnyone && c.phoneOpenedOnce && !c.guideDismissed.includes('meet'),
  },
  {
    id: 'bank',
    title: 'Money needs a home',
    text: 'Open checking at FirstCity Bank before employers will hire you. Saving is a choice you make in the world.',
    dismissKey: 'bank',
    when: (c) => !c.hasChecking && c.metAnyone && !c.guideDismissed.includes('bank'),
  },
  {
    id: 'job',
    title: 'Earn your first paycheck',
    text: 'Interview with Diane at Summit Tower. Performance, skills, and relationships all grow from real work.',
    dismissKey: 'job',
    when: (c) => c.hasChecking && !c.hasJob && !c.guideDismissed.includes('job'),
  },
  {
    id: 'next',
    title: 'You choose what comes next',
    text: 'Open “What can I do?” anytime. Several good paths will always be waiting — pick what YOUR life wants.',
    dismissKey: 'next',
    when: (c) => c.hasJob && !c.guideDismissed.includes('next'),
  },
]

export function activeGuideBeat(ctx: GuideContext): GuideBeat | null {
  return GUIDE_BEATS.find((b) => b.when(ctx)) ?? null
}
