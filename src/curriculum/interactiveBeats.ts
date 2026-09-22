import type { Lesson, LessonBeat } from './types'

/** Handcrafted interactive scripts for key money lessons (credit + banking). */
const HANDCRAFTED: Record<string, LessonBeat[]> = {
  'unit-07-l1': [
    {
      id: 'u7-hook',
      kind: 'scene',
      label: 'Situation',
      prompt: 'You just landed a job offer — but Diane needs a checking account for direct deposit.',
      detail: 'Cash in your pocket won’t cut it. Time to walk into FirstCity Bank.',
    },
    {
      id: 'u7-pick',
      kind: 'choice',
      label: 'Your move',
      prompt: 'Marcus asks: checking, savings, or both?',
      choices: [
        {
          id: 'check',
          label: 'Checking only — I need to spend and get paid',
          reaction:
            'Solid start. Checking is built for frequent payments. You can add savings once the first deposit lands.',
          strong: true,
        },
        {
          id: 'save',
          label: 'Savings only — I want interest',
          reaction:
            'Savings is great for a cushion, but employers need checking for payroll. Open checking first, then park leftovers in savings.',
        },
        {
          id: 'both',
          label: 'Both — spend account + save account',
          reaction:
            'Pro move. Checking for rent and groceries; savings for emergencies so a weekend purchase doesn’t raid next month’s rent.',
          strong: true,
        },
      ],
    },
    {
      id: 'u7-fees',
      kind: 'choice',
      label: 'Watch out',
      prompt: 'The fee schedule mentions overdraft fees. What do they mean?',
      choices: [
        {
          id: 'over',
          label: 'A fee when I spend more than my balance',
          reaction: 'Exactly. Alerts + tracking your balance beat surprise fees every time.',
          strong: true,
        },
        {
          id: 'raise',
          label: 'A fee when I get a raise',
          reaction: 'Nope — overdraft is about spending past available funds. Raises are good news.',
        },
      ],
    },
    {
      id: 'u7-build',
      kind: 'build',
      label: 'Banking playbook',
      prompt: 'Everyday banking checklist',
      detail:
        '1) Open checking for direct deposit.\n2) Turn on balance alerts.\n3) Separate “spend” (checking) from “save” (savings).\n4) Read fees before you sign.\n5) Confirm deposits cleared before you spend them.',
    },
  ],

  'unit-09-l1': [
    {
      id: 'u9-hook',
      kind: 'scene',
      label: 'Situation',
      prompt: 'A glossy credit card offer hits your phone: “$500 limit — build credit today!”',
      detail: 'Credit means buy now, pay later. It is a loan with rules — not free money.',
    },
    {
      id: 'u9-what',
      kind: 'choice',
      label: 'Quick call',
      prompt: 'What is a credit card, really?',
      choices: [
        {
          id: 'loan',
          label: 'A revolving loan I can reuse as I repay',
          reaction:
            'Yes. You borrow up to a limit, repay, and borrow again. Miss the full payoff and interest (APR) starts stacking.',
          strong: true,
        },
        {
          id: 'cash',
          label: 'Extra cash the bank gifts me',
          reaction: 'Tempting myth. Every swipe is borrowed money you must repay — often with interest if you carry a balance.',
        },
      ],
    },
    {
      id: 'u9-build-how',
      kind: 'scene',
      label: 'How to build credit',
      prompt: 'Building credit is a habit loop — not a one-time swipe.',
      detail:
        'Start small: a secured card or student card, or become an authorized user on a trusted family card. Charge something you already budgeted (phone bill, groceries), then pay the statement in full before the due date. On-time payments are the #1 score driver. Keep utilization low — ideally under ~30% of your limit. One card used well beats three cards maxed out.',
    },
    {
      id: 'u9-choice-habit',
      kind: 'choice',
      label: 'Your habit',
      prompt: 'You charged $40 for groceries on a $500 limit. Best next step?',
      choices: [
        {
          id: 'full',
          label: 'Pay the $40 in full before the due date',
          reaction:
            'That’s the credit-building play: use → repay in full → repeat. You show reliability without interest drag.',
          strong: true,
        },
        {
          id: 'min',
          label: 'Pay only the minimum and keep the rest',
          reaction:
            'Minimums keep the account open but interest piles on — and high balances hurt utilization. Pay in full when you can.',
        },
        {
          id: 'max',
          label: 'Max the card to “show activity”',
          reaction:
            'Activity helps only when paired with on-time full (or near-full) paydowns. Maxing out signals risk.',
        },
      ],
    },
    {
      id: 'u9-more',
      kind: 'reveal',
      label: 'Also know',
      prompt: 'Secured vs unsecured, fees, and traps',
      detail:
        'Secured cards use a deposit as collateral — common first step with thin credit. Unsecured cards rely on your history. Read the Schumer box for APR, annual fees, and late fees. Never borrow for a weekend trip you can’t repay soon. Write the monthly payment you can afford after rent and food first — credit times purchases; it is not a raise.',
    },
    {
      id: 'u9-build',
      kind: 'build',
      label: 'Credit-building playbook',
      prompt: 'Your starter credit plan',
      detail:
        '1) Open a beginner-friendly card (or authorized-user path).\n2) Autopay the statement balance.\n3) Keep one recurring small purchase.\n4) Stay under ~30% utilization.\n5) Never skip a due date — set calendar alerts.\n6) Skip stacking applications; each hard inquiry is a tiny ding.',
    },
  ],

  'unit-10-l1': [
    {
      id: 'u10-hook',
      kind: 'scene',
      label: 'Situation',
      prompt: 'A landlord asks for a credit check on your first apartment app.',
      detail: 'Your credit report is your financial reputation on paper. Your score is the three-digit summary lenders skim.',
    },
    {
      id: 'u10-factors',
      kind: 'choice',
      label: 'What matters most?',
      prompt: 'Which factor usually weighs heaviest on scores?',
      choices: [
        {
          id: 'pay',
          label: 'Payment history — paying on time',
          reaction:
            'Correct. On-time payments dominate. One late mark on a first card can sting for years.',
          strong: true,
        },
        {
          id: 'color',
          label: 'The color of my debit card',
          reaction: 'Nope. Scores care about payments, balances, history length, mix, and new credit — not plastics aesthetics.',
        },
      ],
    },
    {
      id: 'u10-build',
      kind: 'scene',
      label: 'How to build (and protect) credit',
      prompt: 'Thin file → strong file takes months of boring excellence.',
      detail:
        'No history? Start with a secured card, credit-builder loan, or authorized-user status (only with someone who pays on time). Pay every bill on time — cards, phone, utilities if reported. Keep balances low vs limits. Check your own reports (soft inquiry — doesn’t hurt). Dispute errors. Freeze credit when you’re not applying so nobody opens accounts in your name. Hard inquiries (new applications) should be intentional and spaced out.',
    },
    {
      id: 'u10-scenario',
      kind: 'choice',
      label: 'Scenario',
      prompt: 'Your report shows a card you never opened. What do you do?',
      choices: [
        {
          id: 'dispute',
          label: 'Dispute it and watch for identity theft',
          reaction:
            'Right call. Unknown accounts can be errors or fraud — dispute with the bureau and contact the issuer.',
          strong: true,
        },
        {
          id: 'ignore',
          label: 'Ignore it — scores fix themselves',
          reaction: 'Errors don’t self-heal. Leaving fraud on a report can wreck apartment and loan approvals.',
        },
      ],
    },
    {
      id: 'u10-more',
      kind: 'reveal',
      label: 'Level up',
      prompt: 'Beyond the first card',
      detail:
        'After 6–12 months of clean payments you may qualify for a better unsecured card — ask for a limit increase (without a new hard pull when possible) or graduate a secured card. Add an installment account later (auto loan paid on time) for mix. Landlords, auto lenders, and landlords’ screening firms all read this story. Soft-check your score a few times a year; hard-check only when you’re ready to apply.',
    },
    {
      id: 'u10-playbook',
      kind: 'build',
      label: 'Score playbook',
      prompt: 'Raise your score without gimmicks',
      detail:
        '1) On-time, every time (autopay).\n2) Low utilization — pay before the statement cuts if needed.\n3) Keep old accounts open if fee-free.\n4) Limit new applications.\n5) Review reports 2–3× a year.\n6) Freeze when idle.\n7) Be patient — scores climb with clean months, not hacks.',
    },
  ],

  'unit-08-l1': [
    {
      id: 'u8-hook',
      kind: 'scene',
      label: 'Situation',
      prompt: 'Payday just hit (~$300 take-home). Your checking balance looks flush for one evening.',
      detail: 'Saving means deciding tomorrow’s you gets a cut before lifestyle expands to fill the whole check.',
    },
    {
      id: 'u8-choice',
      kind: 'choice',
      label: 'Split the check',
      prompt: 'What’s the strongest first move with a starter paycheck?',
      choices: [
        {
          id: 'auto',
          label: 'Auto-transfer a small slice to savings the same day',
          reaction:
            'Pay yourself first. Even $25–$50 starts an emergency fund so a broken phone doesn’t become credit-card panic.',
          strong: true,
        },
        {
          id: 'blow',
          label: 'Spend it all — I’ll save next month',
          reaction: 'Next month rarely comes. Automation beats willpower once rent and food are covered.',
        },
      ],
    },
    {
      id: 'u8-compound',
      kind: 'reveal',
      label: 'Interest',
      prompt: 'Compound interest = interest on interest',
      detail:
        'Leave savings parked and growth can accelerate (slowly at bank rates). Pair that with a named goal — “$900 apartment deposit in 10 months” — so the habit has a finish line.',
    },
    {
      id: 'u8-build',
      kind: 'build',
      label: 'Saving playbook',
      prompt: 'Make saving automatic',
      detail:
        '1) Name the goal + dollar target.\n2) Divide by months left.\n3) Autopay that amount on payday.\n4) Keep emergency cash separate from “fun.”\n5) In strong tip/overtime weeks, save a bonus slice.',
    },
  ],
}

/** Turn a classic paragraph lesson into short interactive beats. */
export function beatsFromBody(lesson: Lesson): LessonBeat[] {
  const paragraphs = lesson.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  const beats: LessonBeat[] = []
  paragraphs.forEach((p, i) => {
    const short = p.length > 280 ? `${p.slice(0, 277).trim()}…` : p
    beats.push({
      id: `${lesson.id}-p${i}`,
      kind: i === 0 ? 'scene' : i === paragraphs.length - 1 ? 'reveal' : 'scene',
      label: i === 0 ? 'Start here' : `Beat ${i + 1}`,
      prompt: short.includes('. ') ? short.split('. ').slice(0, 2).join('. ') + (short.includes('. ') ? '.' : '') : short,
      detail: short.length > 160 && short.includes('. ') ? short : undefined,
    })

    // Sprinkle a reflection choice after early paragraphs
    if (i === 0 || i === Math.min(2, paragraphs.length - 1)) {
      beats.push({
        id: `${lesson.id}-reflect-${i}`,
        kind: 'choice',
        label: 'Check yourself',
        prompt: 'What will you do with this idea in-game?',
        choices: [
          {
            id: 'apply',
            label: 'Apply it on my next money decision',
            reaction: 'That’s the point — lessons unlock better choices at the bank, office, and phone.',
            strong: true,
          },
          {
            id: 'park',
            label: 'Park it for later',
            reaction: 'Fair — but try one small action this week so it sticks.',
          },
        ],
      })
    }
  })

  beats.push({
    id: `${lesson.id}-why`,
    kind: 'build',
    label: 'Why it matters',
    prompt: lesson.whyItMatters,
    detail: 'Tap through to the quiz when you’re ready to lock it in.',
  })

  return beats.slice(0, 10) // keep paced — not a novella
}

export function resolveLessonBeats(lesson: Lesson): LessonBeat[] {
  if (lesson.beats && lesson.beats.length > 0) return lesson.beats
  const crafted = HANDCRAFTED[lesson.id]
  if (crafted) return crafted
  return beatsFromBody(lesson)
}
