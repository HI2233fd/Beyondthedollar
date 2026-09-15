import { useGame, SCENE_LOCATION } from './GameState'
import { stampFromMinutes, dayPhase } from './simulation/time'
import { portfolioValue } from './simulation/investing'

const money = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

const SCALES = [1, 8, 32] as const

export function GameHUD() {
  const cash = useGame((s) => s.cash)
  const bank = useGame((s) => s.bank)
  const scene = useGame((s) => s.scene)
  const totalMinutes = useGame((s) => s.totalMinutes)
  const timeScale = useGame((s) => s.timeScale)
  const setTimeScale = useGame((s) => s.setTimeScale)
  const billNotice = useGame((s) => s.lastBillNotice)
  const dismissBill = useGame((s) => s.dismissBillNotice)
  const creditScore = useGame((s) => s.creditScore)
  const carStatus = useGame((s) => s.carStatus)
  const homeStatus = useGame((s) => s.homeStatus)
  const prices = useGame((s) => s.assetPrices)
  const holdings = useGame((s) => s.holdings)

  const cal = stampFromMinutes(totalMinutes)
  const phase = dayPhase(cal.minuteOfDay)
  const portfolio = portfolioValue(prices, holdings)

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
          <span className="hud-label">Bank</span>
          <span className="hud-value">{money(bank)}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Credit</span>
          <span className="hud-value">{creditScore}</span>
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
        {(portfolio > 0 || carStatus !== 'none' || homeStatus === 'owned') && (
          <div className="hud-item hud-status">
            <span className="hud-label">Status</span>
            <span className="hud-value hud-status-line">
              {homeStatus === 'owned' ? 'Owner' : 'Renter'}
              {carStatus !== 'none' ? ` · Car ${carStatus}` : ''}
              {portfolio > 0 ? ` · Inv ${money(portfolio)}` : ''}
            </span>
          </div>
        )}
      </div>
      {billNotice && (
        <button type="button" className="bill-toast" onClick={dismissBill}>
          {billNotice} · dismiss
        </button>
      )}
    </>
  )
}
