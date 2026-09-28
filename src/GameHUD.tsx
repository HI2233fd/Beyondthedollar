import { useGame, SCENE_LOCATION } from './GameState'
import { stampFromMinutes, dayPhase } from './simulation/time'

const money = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

/** Review speeds only — default is always 1× (1 real sec ≈ 1 game minute). */
const SCALES = [1, 4] as const

function PhoneGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </svg>
  )
}

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
  const dueBillIds = useGame((s) => s.dueBillIds)
  const debt = useGame((s) => s.debt)
  const lifeLevel = useGame((s) => s.lifeLevel)
  const xp = useGame((s) => s.xp)
  const xpToNext = useGame((s) => s.xpToNext())
  const playerName = useGame((s) => s.playerName)

  const cal = stampFromMinutes(totalMinutes)
  const phaseName = dayPhase(cal.minuteOfDay)
  const phase = phaseName.charAt(0).toUpperCase() + phaseName.slice(1)
  const available = cash + (hasChecking ? bank : 0)
  const xpPct = Math.min(100, Math.round((xp / Math.max(1, xpToNext)) * 100))
  const initial = (playerName || 'Y').slice(0, 1).toUpperCase()

  const cycleScale = () => {
    const i = SCALES.indexOf(timeScale as (typeof SCALES)[number])
    setTimeScale(SCALES[i < 0 ? 0 : (i + 1) % SCALES.length])
  }

  return (
    <>
      <div className="hud">
        <div className="soft-widget player-widget">
          <div className="soft-avatar" aria-hidden>
            {initial}
          </div>
          <div className="player-widget-body">
            <span className="soft-kicker">Level {lifeLevel}</span>
            <span className="soft-value">{playerName || 'You'}</span>
            <div className="soft-track" role="progressbar" aria-valuenow={xpPct} aria-valuemin={0} aria-valuemax={100} aria-label="Experience">
              <div style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>

        <div className="soft-widget money-widget">
          <span className="soft-kicker">Available</span>
          <span className="soft-amount">{money(available)}</span>
          <div className="money-split">
            <span>Cash {money(cash)}</span>
            <span className="money-dot" aria-hidden />
            <span>Checking {hasChecking ? money(bank) : '—'}</span>
          </div>
          {hasChecking && savings > 0 && <span className="soft-note">Savings {money(savings)}</span>}
        </div>

        <div className="soft-widget life-widget">
          <div className="life-widget-top">
            <span className="soft-kicker">
              {cal.weekday} · {phase}
            </span>
            <button type="button" className="soft-scale" onClick={cycleScale} title="Time speed (1× default, 4× review)">
              {timeScale}×
            </button>
          </div>
          <span className="soft-value">{cal.clockLabel}</span>
          <span className="soft-note life-place">
            {cal.month}/{cal.dayOfMonth} · {SCENE_LOCATION[scene]}
          </span>
          <div className="soft-pills">
            <span className={`soft-pill ${hasJob ? 'soft-pill-ok' : ''}`}>{hasJob ? career : 'Unemployed'}</span>
            {creditEstablished && <span className="soft-pill">Credit {creditScore}</span>}
            {debt > 0 && <span className="soft-pill soft-pill-warn">Debt {money(debt)}</span>}
            {dueBillIds.length > 0 && (
              <span className="soft-pill soft-pill-warn">
                {dueBillIds.length} bill{dueBillIds.length === 1 ? '' : 's'} due
              </span>
            )}
          </div>
        </div>
      </div>

      {(billNotice || marketNotice) && (
        <button
          type="button"
          className={`bill-toast ${!billNotice && marketNotice ? 'market-toast' : ''}`}
          onClick={billNotice ? dismissBill : dismissMarket}
        >
          {billNotice || marketNotice}
          <span>Dismiss</span>
        </button>
      )}

      <button
        type="button"
        className={`phone-fab dock-btn ${phoneOpen ? 'active' : ''}`}
        onClick={openPhone}
        title="Open phone"
      >
        <PhoneGlyph />
        Phone
        {hasJob && <span className="phone-fab-dot" aria-hidden />}
      </button>
    </>
  )
}
