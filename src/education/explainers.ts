import type { ExplainerContext } from './types'

export interface Explainer {
  id: string
  title: string
  paragraphs: string[]
  conceptId: string
}

const money = (n: number) => `$${Math.max(0, Math.round(n)).toLocaleString('en-US')}`

export function buildExplainer(id: string, ctx: ExplainerContext): Explainer | null {
  if (id === 'paycheck') {
    const gross = ctx.gross || 0
    const tax = ctx.tax || 0
    const net = ctx.net || Math.max(0, gross - tax)
    return {
      id,
      conceptId: 'paycheck-story',
      title: 'Where this paycheck went',
      paragraphs: [
        `You earned ${money(gross)} before deductions. ${money(net)} is what reached the account.`,
        `${money(tax)} was withheld as an estimate of payroll and income taxes. It is not a tip to your employer. Filing later compares this estimate with the year’s actual tax.`,
        'Gross is the whole amount. Net is what you can spend or save. Rent and groceries have to fit in the net, not the gross.',
      ],
    }
  }
  if (id === 'checking') {
    return {
      id,
      conceptId: 'checking-life',
      title: 'Checking is now the hallway',
      paragraphs: [
        `${ctx.playerName || 'You'} can receive a direct deposit. Cash in hand cannot.`,
        `Checking is about ${money(ctx.bank)}. Savings is ${money(ctx.savings)}. Spending money and buffer money do not have to live in the same pile.`,
        'Watch the transaction list. An overdraft fee costs more than skipping one small purchase.',
      ],
    }
  }
  if (id === 'shop') {
    return {
      id,
      conceptId: 'how-you-pay',
      title: 'That cart had a total, not a vibe',
      paragraphs: [
        `This run was about ${money(ctx.cartTotal || 0)}. That amount left money you already had.`,
        'Compare the unit price next time, and notice anything that will bill you again. A discount on a thing you did not need is not savings.',
        'If this purchase crowded out a bill, it was a want that spent a need.',
      ],
    }
  }
  return null
}
