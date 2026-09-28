import { useEffect, useState } from 'react'
import { useGame } from '../GameState'
import { buildExplainer } from './explainers'

export function ExplainerCard() {
  const pending = useGame((s) => s.financialEdu.pendingExplainer)
  const dismiss = useGame((s) => s.dismissExplainer)
  const name = useGame((s) => s.playerName)
  const bank = useGame((s) => s.bank)
  const savings = useGame((s) => s.savings)
  const cash = useGame((s) => s.cash)
  const stubs = useGame((s) => s.paystubs)
  const cartTotal = useGame((s) => s.financialEdu.cartTotal)
  const [open, setOpen] = useState(true)
  useEffect(() => {
    setOpen(true)
  }, [pending])
  if (!pending || !open) return null
  const stub = stubs[0]
  const explainer = buildExplainer(pending, {
    playerName: name,
    gross: stub?.gross ?? 0,
    tax: stub?.tax ?? 0,
    net: stub?.net ?? 0,
    cash,
    bank,
    savings,
    cartTotal,
  })
  if (!explainer) return null
  return (
    <div className="coach-card explainer-card">
      <span className="soft-kicker">From your life</span>
      <strong>{explainer.title}</strong>
      {explainer.paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <div className="coach-actions">
        <button
          type="button"
          className="soft-go"
          onClick={() => {
            dismiss(explainer.id)
            setOpen(false)
          }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
