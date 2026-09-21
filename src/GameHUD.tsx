import { useGame, SCENE_LOCATION } from './GameState'
import { stampFromMinutes, dayPhase } from './simulation/time'

const money = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

/** Review speeds only — default is always 1× (1 real sec ≈ 1 game minute). */
const SCALES = [1, 4] as const

export function GameHUD() {
  const cash = useGame((s) => s.cash)
  const bank = useGame((s) => s.bank)
  const savings = useGame((s) => s.savings)
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
  const hasJob = useGame((s) => s.hasJob)
  const career = useGame((s) => s.career)
  const weeklyIncome = useGame((s) => s.weeklyIncome)
  const incomeFactor = useGame((s) => s.incomeFactor)
  const nextPaydayAt = useGame((s) => s.nextPaydayAt)
  const dueBillIds = useGame((s) => s.dueBillIds)
  const recurringBills = useGame((s) => s.recurringBills)
  const debt = useGame((s) => s.debt)
  const lifeLevel = useGame((s) => s.lifeLevel)
  const xp = useGame((s) => s.xp)
  const xpToNext = useGame((s) => s.xpToNext())
  const playerName = useGame((s) => s.playerName)
  const season = useGame((s) => s.season)

  const cal = stampFromMinutes(totalMinutes)
  const phase = dayPhase(cal.minuteOfDay)
  const weekly = Math.round(weeklyIncome * incomeFactor)
  const nextBill = [...recurringBills].sort((a, b) => a.nextDueTotalMinutes - b.nextDueTotalMinutes)[0]
  const nextBillStamp = nextBill ? stampFromMinutes(nextBill.nextDueTotalMinutes) : null
  const paydayStamp = hasJob ? stampFromMinutes(nextPaydayAt) : null

  const cycleScale = () => {
    const i = SCALES.indexOf(timeScale as (typeof SCALES)[number])
    setTimeScale(SCALES[i < 0 ? 0 : (i + 1) % SCALES.length])
  }

  return (
    <>
      <div className="hud">
        <div className="hud-item">
          <span className="hud-label">{playerName || 'You'}</span>
          <span className="hud-value">
            Lv {lifeLevel}
          </span>
          <span className="hud-sub">
            {xp}/{xpToNext} XP
          </span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Cash</span>
          <span className="hud-value">{money(cash)}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Checking</span>
          <span className="hud-value">{hasChecking ? money(bank) : '—'}</span>
          {hasChecking && savings > 0 && (
            <span className="hud-sub">Savings {money(savings)}</span>
          )}
        </div>
        <div className="hud-item">
          <span className="hud-label">Credit</span>
          <span className="hud-value">{creditEstablished ? creditScore : '—'}</span>
          {debt > 0 && <span className="hud-sub hud-warn">Debt {money(debt)}</span>}
        </div>
        <div className="hud-item hud-status">
          <span className="hud-label">Job</span>
          <span className={`hud-value hud-status-line ${hasJob ? 'hud-ok' : ''}`}>
            {hasJob ? career : 'Unemployed'}
          </span>
          {hasJob ? (
            <span className="hud-sub">
              ~{money(weekly)}/wk · pay {paydayStamp?.month}/{paydayStamp?.dayOfMonth}
            </span>
          ) : (
            <span className="hud-sub">Open checking → interview at Summit</span>
          )}
        </div>
        <div className="hud-item hud-loc">
          <span className="hud-label">Location</span>
          <span className="hud-value">{SCENE_LOCATION[scene]}</span>
          {dueBillIds.length > 0 ? (
            <span className="hud-sub hud-warn">{dueBillIds.length} bill(s) due now</span>
          ) : nextBill && nextBillStamp ? (
            <span className="hud-sub">
              Next: {nextBill.label} {nextBillStamp.month}/{nextBillStamp.dayOfMonth}
            </span>
          ) : null}
        </div>
        <div className="hud-item hud-time">
          <span className="hud-label">
            {cal.weekday} · {phase} · {season}
          </span>
          <span className="hud-value">
            {cal.month}/{cal.dayOfMonth} {cal.clockLabel}
          </span>
          <button type="button" className="hud-time-scale" onClick={cycleScale} title="Time speed (1× default, 4× review)">
            {timeScale}×
          </button>
        </div>
      </div>

      <button
        type="button"
        className={`phone-fab ${phoneOpen ? 'active' : ''} ${hasJob ? 'phone-fab-hired' : ''}`}
        onClick={openPhone}
        title="Open phone"
      >
        Phone
        {hasJob && <span className="phone-fab-dot" aria-hidden />}
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
