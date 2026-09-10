import { useMemo, useState } from 'react'

const MONTHLY_INCOME = 1200

type Category = {
  key: string
  name: string
  emoji: string
  recommended: number
}

const categories: Category[] = [
  { key: 'needs', name: 'Needs (food, transport)', emoji: '🛒', recommended: 0.5 },
  { key: 'wants', name: 'Wants (fun, eating out)', emoji: '🎮', recommended: 0.3 },
  { key: 'savings', name: 'Savings', emoji: '🐷', recommended: 0.15 },
  { key: 'giving', name: 'Giving / Goals', emoji: '🎁', recommended: 0.05 },
]

export default function BudgetGame() {
  const [values, setValues] = useState<Record<string, number>>({
    needs: 600,
    wants: 300,
    savings: 200,
    giving: 100,
  })

  const total = useMemo(
    () => Object.values(values).reduce((a, b) => a + b, 0),
    [values],
  )
  const remaining = MONTHLY_INCOME - total

  const savingsRate = values.savings / MONTHLY_INCOME

  const feedback = useMemo(() => {
    if (remaining < 0) {
      return {
        tone: 'bad' as const,
        text: `You are over budget by $${Math.abs(remaining)}. Try trimming your "wants" so your plan fits your $${MONTHLY_INCOME} income.`,
      }
    }
    if (savingsRate >= 0.2 && remaining >= 0) {
      return {
        tone: 'good' as const,
        text: `Nice! You are saving ${Math.round(savingsRate * 100)}% and staying on budget. Future you says thanks. 🎉`,
      }
    }
    if (remaining > 0) {
      return {
        tone: 'warn' as const,
        text: `You have $${remaining} unassigned. Put it to work — bumping savings toward 20% is a great move.`,
      }
    }
    return {
      tone: 'warn' as const,
      text: 'Balanced budget! See if you can push savings toward 20% for bonus points.',
    }
  }, [remaining, savingsRate])

  const setValue = (key: string, v: number) =>
    setValues((prev) => ({ ...prev, [key]: v }))

  return (
    <div className="game">
      <div className="game-top">
        <div>
          <div className="eyebrow">Interactive</div>
          <h2 style={{ margin: '4px 0 0' }}>Build Your Monthly Budget</h2>
          <p style={{ color: 'var(--muted)', margin: '6px 0 0' }}>
            You earn <strong>${MONTHLY_INCOME}</strong> a month from a part-time
            job. Slide to allocate every dollar.
          </p>
        </div>
        <div
          className={`game-remaining ${remaining < 0 ? 'over' : 'ok'}`}
          aria-live="polite"
        >
          Unassigned: ${remaining}
        </div>
      </div>

      <div className="allocations">
        {categories.map((c) => (
          <div className="alloc" key={c.key}>
            <div className="alloc-head">
              <span className="name">
                {c.emoji} {c.name}
              </span>
              <span className="val">${values[c.key]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={MONTHLY_INCOME}
              step={25}
              value={values[c.key]}
              onChange={(e) => setValue(c.key, Number(e.target.value))}
              aria-label={c.name}
            />
          </div>
        ))}
      </div>

      <div className={`game-feedback ${feedback.tone}`} aria-live="polite">
        {feedback.text}
      </div>
    </div>
  )
}
