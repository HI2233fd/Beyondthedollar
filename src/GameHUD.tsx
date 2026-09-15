import { useGame, SCENE_LOCATION } from './GameState'
import { stampFromMinutes, dayPhase } from './simulation/time'

const money = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

const SCALES = [1, 8, 32] as const

export function GameHUD() {
  const cash = useGame((s) => s.cash)
  const bank = useGame((s) => s.bank)
  const hasChecking = useGame((s) => s.hasCheckingAccount)
  const scene = useGame((s) => s.scene)
  const totalMinutes = useGame((s) => s.totalMinutes)
  const timeScale = useGame((s) => s.timeScale)
  const setTimeScale = useGame((s) => s.setTimeScale)
  const billNotice = useGame((s) => s.lastBillNotice)
  const marketNotice = useGame((s) => s.lastMarketNotice)
  const dismissBill = useGame((s) => s.dismissBillNotice)
  const dismissMarket = useGame((s) => s.dismissMarketNotice)
  const creditScore = useGame((s) => s.creditScore)
  const creditEstablished = useGame((s) => s.creditEstablished)
  const openPhone = useGame((s) => s.openPhone)
  const phoneOpen = useGame((s) => s.phoneOpen)

  const cal = stampFromMinutes(totalMinutes)
  const phase = dayPhase(cal.minuteOfDay)

  const cycleScale = () => {
    const i = SCALES.indexOf(timeScale as (typeof SCALES)[number])
    setTimeScale(SCALES[(i + 1) % SCALES.length])
  }

  return (
    <>
      <div className="hud">
        <div className="hud-item">
          <span className="hud-label">Cash</span>
          <span className="hud-value">{money(cash)}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Checking</span>
          <span className="hud-value">{hasChecking ? money(bank) : '—'}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Credit</span>
          <span className="hud-value">{creditEstablished ? creditScore : '—'}</span>
        </div>
        <div className="hud-item hud-loc">
          <span className="hud-label">Location</span>
          <span className="hud-value">{SCENE_LOCATION[scene]}</span>
        </div>
        <div className="hud-item hud-time">
          <span className="hud-label">
            {cal.weekday} · {phase}
          </span>
          <span className="hud-value">
            {cal.month}/{cal.dayOfMonth} {cal.clockLabel}
          </span>
          <button type="button" className="hud-time-scale" onClick={cycleScale} title="Cycle time speed">
            {timeScale}×
          </button>
        </div>
      </div>

      <button
        type="button"
        className={`phone-fab ${phoneOpen ? 'active' : ''}`}
        onClick={openPhone}
        title="Open phone"
      >
        Phone
      </button>

      {billNotice && (
        <button type="button" className="bill-toast" onClick={dismissBill}>
          {billNotice} · dismiss
        </button>
      )}
      {marketNotice && !billNotice && (
        <button type="button" className="bill-toast market-toast" onClick={dismissMarket}>
          {marketNotice} · dismiss
        </button>
      )}
    </>
  )
}
