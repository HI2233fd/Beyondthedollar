import { useGame } from '../game/store'
import { Modal } from '../ui/components'
import { financialHealth, netWorth } from '../game/engine'
import { money } from '../game/format'

export function Recovery() {
  const { state, dispatch } = useGame()
  const hasCar = !!state.transport && state.transport.price > 0
  const hasRent = !!state.housing && state.housing.monthlyRent > 0
  const hasDebt = state.debts.length > 0

  return (
    <Modal>
      <div className="modal-hero" style={{ background: 'radial-gradient(600px 200px at 20% 0%, rgba(251,113,133,0.18), transparent)' }}>
        <span className="tag bad">Recovery</span>
        <div className="emoji">🆘</div>
        <h2>Money got tight — but this isn’t game over.</h2>
      </div>
      <div className="modal-body">
        <p className="story-text">
          Everyone hits rough patches. Your cash is at <strong style={{ color: 'var(--red)' }}>{money(state.cash)}</strong> and your
          financial health dropped to <strong>{financialHealth(state)}/100</strong>. Pick a move to steady yourself — recovering from
          mistakes is one of the most important money skills there is.
        </p>
        <div className="grid mt-lg" style={{ gap: 10 }}>
          {hasCar && (
            <button className="option-row" onClick={() => dispatch({ type: 'RECOVER', action: 'sellCar' })}>
              <div>
                <div className="r-title">🚌 Sell the car, switch to transit</div>
                <div className="r-sub">Recover cash and clear the auto loan. Less convenient, far cheaper.</div>
              </div>
            </button>
          )}
          {hasRent && (
            <button className="option-row" onClick={() => dispatch({ type: 'RECOVER', action: 'downsize' })}>
              <div>
                <div className="r-title">🏠 Move in with family temporarily</div>
                <div className="r-sub">Cut rent to $0 while you rebuild your savings.</div>
              </div>
            </button>
          )}
          {hasDebt && (
            <button className="option-row" onClick={() => dispatch({ type: 'RECOVER', action: 'hardship' })}>
              <div>
                <div className="r-title">🤝 Enroll in a hardship plan</div>
                <div className="r-sub">Ask lenders to lower your APR while you get back on track.</div>
              </div>
            </button>
          )}
          <button className="option-row" onClick={() => dispatch({ type: 'RECOVER', action: 'hustle' })}>
            <div>
              <div className="r-title">⚡ Pick up urgent gig work</div>
              <div className="r-sub">Earn a fast {money(400)} to stabilize this month.</div>
            </div>
          </button>
        </div>
        <div className="muted small mt-lg">Net worth: {money(netWorth(state))}. Take one step at a time — you’ll get through this.</div>
      </div>
    </Modal>
  )
}
