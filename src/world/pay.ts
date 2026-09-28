import type { LedgerEntry } from '../GameState'
import { useGame } from '../GameState'

/** Charge or pay through the existing cash/checking balances and ledger. */
export function applyMoney(amount: number, label: string, claimId?: string): string | null {
  const s = useGame.getState()
  if (claimId && s.worldSim.claimed.includes(claimId)) return 'Already completed.'
  const rounded = Math.round(amount * 100) / 100
  if (rounded === 0) return null
  if (rounded < 0) {
    const cost = -rounded
    if (s.hasCheckingAccount && s.bank + 0.001 >= cost) {
      useGame.setState({ bank: Math.round((s.bank - cost) * 100) / 100 })
    } else if (s.cash + 0.001 >= cost) {
      useGame.setState({ cash: Math.round((s.cash - cost) * 100) / 100 })
    } else return 'Not enough money.'
  } else if (s.hasCheckingAccount) {
    useGame.setState({ bank: Math.round((s.bank + rounded) * 100) / 100 })
  } else {
    useGame.setState({ cash: Math.round((s.cash + rounded) * 100) / 100 })
  }
  const now = useGame.getState()
  const entry: LedgerEntry = {
    id: `world-${now.totalMinutes}-${label}`,
    atTotalMinutes: now.totalMinutes,
    label,
    amount: rounded,
    kind: rounded < 0 ? 'expense' : 'paycheck',
    status: 'paid',
  }
  useGame.setState({ ledger: [entry, ...now.ledger].slice(0, 40) })
  if (claimId) {
    useGame.getState().patchWorld({ claimed: [...useGame.getState().worldSim.claimed, claimId] })
  } else {
    useGame.getState().autosave()
  }
  return null
}

export function confirmPurchase(title: string, detail: string, cost: number, onYes: () => void) {
  useGame.getState().openDialogue({
    name: title,
    text: `${detail} Cost $${cost.toFixed(2)}.`,
    options: [
      { label: 'Confirm', action: onYes, close: true },
      { label: 'Cancel', close: true },
    ],
  })
}
