import { useEffect } from 'react'
import { useGame } from './GameState'

/**
 * Triggers a basic life event a short while after the player becomes active,
 * and renders the decision + consequence UI.
 */
export function LifeEventSystem() {
  const active = useGame((s) => s.lifeEventActive)
  const outcome = useGame((s) => s.lifeEventOutcome)
  const shown = useGame((s) => s.lifeEventShown)
  const trigger = useGame((s) => s.triggerLifeEvent)
  const resolve = useGame((s) => s.resolveLifeEvent)
  const dismiss = useGame((s) => s.dismissLifeEventOutcome)

  useEffect(() => {
    if (shown) return
    const t = setTimeout(() => trigger(), 6000000)
    return () => clearTimeout(t)
  }, [shown, trigger])

  if (active) {
    return (
      <div className="modal-overlay">
        <div className="event-card">
          <div className="event-badge">Life Event</div>
          <div className="event-emoji">🚗🔧</div>
          <h2>Your car needs a $700 repair.</h2>
          <p>The mechanic says your car won’t run until it’s fixed. How do you want to handle it?</p>
          <div className="event-options">
            <button className="event-btn" onClick={() => resolve('savings')}>
              <strong>Pay from savings</strong>
              <span>Savings −$700</span>
            </button>
            <button className="event-btn" onClick={() => resolve('credit')}>
              <strong>Use credit</strong>
              <span>Credit score −15 · +$700 debt</span>
            </button>
            <button className="event-btn" onClick={() => resolve('delay')}>
              <strong>Delay repair</strong>
              <span>Transportation unavailable</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (outcome) {
    return (
      <div className="modal-overlay">
        <div className="event-card">
          <div className="event-badge outcome">Consequence</div>
          <p className="event-outcome">{outcome}</p>
          <button className="event-continue" onClick={dismiss}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  return null
}
