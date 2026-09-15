import { useGame, SCENE_LOCATION } from './GameState'
import { stampFromMinutes, dayPhase } from './simulation/time'

const money = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`

const SCALES = [1, 8, 32] as const

export function GameHUD() {
  const cash = useGame((s) => s.cash)
  const bank = useGame((s) => s.bank)
  const scene = useGame((s) => s.scene)
  const totalMinutes = useGame((s) => s.totalMinutes)
  const timeScale = useGame((s) => s.timeScale)
  const setTimeScale = useGame((s) => s.setTimeScale)

  const cal = stampFromMinutes(totalMinutes)
  const phase = dayPhase(cal.minuteOfDay)

  const cycleScale = () => {
    const i = SCALES.indexOf(timeScale as (typeof SCALES)[number])
    setTimeScale(SCALES[(i + 1) % SCALES.length])
  }

  return (
    <div className="hud">
      <div className="hud-item">
        <span className="hud-label">Cash</span>
        <span className="hud-value">{money(cash)}</span>
      </div>
      <div className="hud-item">
        <span className="hud-label">Bank</span>
        <span className="hud-value">{money(bank)}</span>
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
  )
}
