import { useState } from 'react'
import { useGame } from '../GameState'
import { portfolioValue } from './investing'
import { stampFromMinutes } from './time'
import {
  CAR_CREDIT_MIN,
  CAR_SAVINGS_MIN,
  CREDIT_PRODUCT_MIN,
  HOME_CREDIT_MIN,
  HOME_DOWN_PAYMENT,
  INVEST_SAVINGS_MIN,
} from './progression'
import { DOWNTOWN_UNLOCK_LEVEL, LIFE_GOALS, SKILL_LABELS, type SkillId } from '../life/types'
import { ACHIEVEMENT_DEFS } from '../life/missions'

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

function fmtWhen(totalMinutes: number) {
  const s = stampFromMinutes(totalMinutes)
  return `${s.weekday} ${s.month}/${s.dayOfMonth} ${s.clockLabel}`
}

type AppId =
  | 'home'
  | 'missions'
  | 'goals'
  | 'people'
  | 'jobs'
  | 'bank'
  | 'invest'
  | 'skills'
  | 'map'
  | 'news'
  | 'achievements'

const APPS: { id: AppId; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'missions', label: 'Missions', icon: '🎯' },
  { id: 'goals', label: 'Goals', icon: '⭐' },
  { id: 'people', label: 'People', icon: '👥' },
  { id: 'jobs', label: 'Jobs', icon: '💼' },
  { id: 'bank', label: 'Bank', icon: '🏦' },
  { id: 'invest', label: 'Invest', icon: '📈' },
  { id: 'skills', label: 'Skills', icon: '🧠' },
  { id: 'map', label: 'Map', icon: '🗺️' },
  { id: 'news', label: 'News', icon: '📰' },
  { id: 'achievements', label: 'Wins', icon: '🏆' },
]

export function PhonePanel() {
  const open = useGame((s) => s.phoneOpen)
  const close = useGame((s) => s.closePhone)
  const cash = useGame((s) => s.cash)
  const bank = useGame((s) => s.bank)
  const savings = useGame((s) => s.savings)
  const debt = useGame((s) => s.debt)
  const creditScore = useGame((s) => s.creditScore)
  const creditEstablished = useGame((s) => s.creditEstablished)
  const hasChecking = useGame((s) => s.hasCheckingAccount)
  const hasCreditCard = useGame((s) => s.hasCreditCard)
  const prices = useGame((s) => s.assetPrices)
  const holdings = useGame((s) => s.holdings)
  const bills = useGame((s) => s.recurringBills)
  const dueBillIds = useGame((s) => s.dueBillIds)
  const ledger = useGame((s) => s.ledger)
  const paystubs = useGame((s) => s.paystubs)
  const totalMinutes = useGame((s) => s.totalMinutes)
  const carStatus = useGame((s) => s.carStatus)
  const homeStatus = useGame((s) => s.homeStatus)
  const hasJob = useGame((s) => s.hasJob)
  const career = useGame((s) => s.career)
  const education = useGame((s) => s.education)
  const weeklyIncome = useGame((s) => s.weeklyIncome)
  const incomeFactor = useGame((s) => s.incomeFactor)
  const nextPaydayAt = useGame((s) => s.nextPaydayAt)
  const incomeFactorUntil = useGame((s) => s.incomeFactorUntil)
  const name = useGame((s) => s.playerName)
  const age = useGame((s) => s.playerAge)
  const lifeLevel = useGame((s) => s.lifeLevel)
  const xp = useGame((s) => s.xp)
  const xpToNext = useGame((s) => s.xpToNext())
  const goals = useGame((s) => s.goals)
  const missions = useGame((s) => s.missions)
  const relationships = useGame((s) => s.relationships)
  const skills = useGame((s) => s.skills)
  const discovered = useGame((s) => s.discoveredLocations)
  const achievements = useGame((s) => s.achievements)
  const season = useGame((s) => s.season)
  const marketNotice = useGame((s) => s.lastMarketNotice)
  const autosave = useGame((s) => s.autosave)

  const [app, setApp] = useState<AppId>('home')

  if (!open) return null

  const investValue = portfolioValue(prices, holdings)
  const netWorth = cash + bank + savings + investValue - debt
  const effectiveWeekly = Math.round(weeklyIncome * incomeFactor)
  const liquid = cash + bank + savings

  const gates = [
    { ok: hasChecking, label: 'Checking account', hint: 'FirstCity Bank teller' },
    { ok: hasJob, label: 'Job (direct deposit)', hint: 'Summit Office interview' },
    {
      ok: creditEstablished && creditScore >= CREDIT_PRODUCT_MIN,
      label: `Credit on file (≥${CREDIT_PRODUCT_MIN})`,
      hint: 'Bank credit application',
    },
    {
      ok: savings >= INVEST_SAVINGS_MIN,
      label: `Invest cushion ($${INVEST_SAVINGS_MIN}+ savings)`,
      hint: 'Bank INVEST desk',
    },
    {
      ok: carStatus !== 'none' || (creditScore >= CAR_CREDIT_MIN && savings >= CAR_SAVINGS_MIN),
      label: carStatus !== 'none' ? `Car: ${carStatus}` : `Car-ready (score ${CAR_CREDIT_MIN}+ / $${CAR_SAVINGS_MIN}+)`,
      hint: 'Home → AutoMart tablet',
    },
    {
      ok: homeStatus === 'owned' || (creditScore >= HOME_CREDIT_MIN && liquid >= HOME_DOWN_PAYMENT),
      label: homeStatus === 'owned' ? 'Homeowner' : `Buy-ready (score ${HOME_CREDIT_MIN}+ / $${HOME_DOWN_PAYMENT}+)`,
      hint: 'Home → Housing tablet',
    },
  ]

  return (
    <div className="modal-overlay scenario-overlay">
      <div className="phone-card phone-life">
        <div className="phone-top">
          <div className="scenario-badge">Life Hub</div>
          <button
            type="button"
            className="phone-close"
            onClick={() => {
              autosave()
              close()
            }}
          >
            Close
          </button>
        </div>

        <div className="phone-app-grid">
          {APPS.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`phone-app ${app === a.id ? 'active' : ''}`}
              onClick={() => setApp(a.id)}
            >
              <span aria-hidden>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>

        {app === 'home' && (
          <div className="phone-body">
            <div className={`phone-hero ${hasJob ? 'phone-hero-ok' : ''}`}>
              <span className="hud-label">
                {name || 'You'} · Age {age} · Lv {lifeLevel}
              </span>
              <strong>
                {xp}/{xpToNext} XP · {season}
              </strong>
              <p className="phone-hero-sub">
                {hasJob
                  ? `${career} · ~${money(effectiveWeekly)}/wk · payday ${fmtWhen(nextPaydayAt)}`
                  : 'Open checking, then interview Diane at Summit.'}
              </p>
            </div>
            <div className="phone-grid">
              <div>
                <span className="hud-label">Education</span>
                <strong className="phone-strong-sm">{education}</strong>
              </div>
              <div>
                <span className="hud-label">Housing</span>
                <strong className="phone-strong-sm">
                  {homeStatus === 'owned' ? 'Owned Maple unit' : 'Renting Maple'}
                </strong>
              </div>
              <div>
                <span className="hud-label">Transport</span>
                <strong className="phone-strong-sm">
                  {carStatus === 'none' ? 'Walking / transit' : `Car · ${carStatus}`}
                </strong>
              </div>
              <div>
                <span className="hud-label">Downtown</span>
                <strong className="phone-strong-sm">
                  {lifeLevel >= DOWNTOWN_UNLOCK_LEVEL ? 'Unlocked' : `Locked · Lv ${DOWNTOWN_UNLOCK_LEVEL}`}
                </strong>
              </div>
            </div>
            {incomeFactor !== 1 && incomeFactorUntil > totalMinutes && (
              <p className="phone-muted phone-alert">
                Income ×{incomeFactor.toFixed(2)} until {fmtWhen(incomeFactorUntil)}
              </p>
            )}
            <h3 className="phone-section">Progress</h3>
            <div className="phone-list">
              {gates.map((g) => (
                <div key={g.label} className={`phone-row phone-gate ${g.ok ? 'ok' : ''}`}>
                  <span>
                    <span className="phone-gate-mark">{g.ok ? '✓' : '○'}</span> {g.label}
                    {!g.ok && <em className="phone-when"> · {g.hint}</em>}
                  </span>
                </div>
              ))}
            </div>
            <p className="phone-muted phone-now">Now: {fmtWhen(totalMinutes)}</p>
          </div>
        )}

        {app === 'missions' && (
          <div className="phone-body">
            {missions.map((m) => (
              <div key={m.id} className={`phone-mission ${m.completed ? 'done' : ''}`}>
                <div className="phone-mission-head">
                  <span className="mission-badge">{m.category}</span>
                  <strong>{m.title}</strong>
                </div>
                <p className="phone-muted">{m.description}</p>
                <ul className="mission-objectives">
                  {m.objectives.map((o) => (
                    <li key={o.id} className={o.done ? 'done' : ''}>
                      {o.done ? '✓' : '○'} {o.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {app === 'goals' && (
          <div className="phone-body">
            <p className="phone-muted">Your ambitions personalize opportunities — paths stay open.</p>
            <div className="phone-list">
              {goals.map((id) => {
                const g = LIFE_GOALS.find((x) => x.id === id)
                return (
                  <div key={id} className="phone-row">
                    <span>
                      {g?.icon} {g?.label ?? id}
                    </span>
                    <span className="phone-muted">active</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {app === 'people' && (
          <div className="phone-body">
            {Object.keys(relationships).length === 0 ? (
              <p className="phone-muted">No contacts yet — talk to people in the world.</p>
            ) : (
              <div className="phone-list">
                {Object.entries(relationships).map(([id, r]) => (
                  <div key={id} className="phone-row phone-people-row">
                    <span>
                      <strong>{id.replace(/^(home|bank|office|grocery|college)-/, '')}</strong>
                      <em className="phone-when">
                        {' '}
                        · {r.tier} · {r.professional}
                      </em>
                      {r.memories[0] && <div className="phone-muted">{r.memories[r.memories.length - 1]}</div>}
                    </span>
                    <span>{r.affinity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {app === 'jobs' && (
          <div className="phone-body">
            <div className={`phone-hero ${hasJob ? 'phone-hero-ok' : ''}`}>
              <span className="hud-label">Employment</span>
              <strong>{hasJob ? career : 'No job yet'}</strong>
              <p className="phone-hero-sub">
                {hasJob
                  ? `Gross ~${money(effectiveWeekly)}/wk before ~18% tax withholding`
                  : 'Summit Office · Office Assistant entry role'}
              </p>
            </div>
            {paystubs.length > 0 && (
              <>
                <h3 className="phone-section">Paystubs</h3>
                <div className="phone-list">
                  {paystubs.slice(0, 4).map((p) => (
                    <div key={p.id} className="phone-paystub">
                      <div className="phone-row">
                        <span>
                          {p.employer}
                          <em className="phone-when"> · {fmtWhen(p.atTotalMinutes)}</em>
                        </span>
                        <span>{money(p.net)}</span>
                      </div>
                      <div className="phone-stub-detail">
                        Gross {money(p.gross)} · Tax {money(p.tax)} · Net {money(p.net)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {app === 'bank' && (
          <div className="phone-body">
            <div className="phone-hero">
              <span className="hud-label">Net worth</span>
              <strong>{money(netWorth)}</strong>
              <p className="phone-hero-sub">
                Liquid {money(liquid)}
                {debt > 0 ? ` · Debt ${money(debt)}` : ''}
              </p>
            </div>
            <div className="phone-grid">
              <div>
                <span className="hud-label">Cash</span>
                <strong>{money(cash)}</strong>
              </div>
              <div>
                <span className="hud-label">Checking</span>
                <strong>{hasChecking ? money(bank) : '— not open'}</strong>
              </div>
              <div>
                <span className="hud-label">Savings</span>
                <strong>{money(savings)}</strong>
              </div>
              <div>
                <span className="hud-label">Credit</span>
                <strong>
                  {creditEstablished ? creditScore : 'Unrated'}
                  {hasCreditCard ? ' · card' : ''}
                </strong>
              </div>
            </div>
            <h3 className="phone-section">Bills</h3>
            {dueBillIds.length > 0 && (
              <p className="phone-muted phone-alert">Close phone to resolve due bills.</p>
            )}
            <div className="phone-list">
              {[...bills]
                .sort((a, b) => a.nextDueTotalMinutes - b.nextDueTotalMinutes)
                .map((b) => (
                  <div key={b.id} className={`phone-row ${dueBillIds.includes(b.id) ? 'phone-due' : ''}`}>
                    <span>
                      {b.label}
                      <em className="phone-when">
                        {' '}
                        · {dueBillIds.includes(b.id) ? 'DUE NOW' : fmtWhen(b.nextDueTotalMinutes)}
                      </em>
                    </span>
                    <span>{money(b.amount)}</span>
                  </div>
                ))}
            </div>
            <h3 className="phone-section">Ledger</h3>
            {ledger.length === 0 ? (
              <p className="phone-muted">Nothing logged yet.</p>
            ) : (
              <div className="phone-list">
                {ledger.slice(0, 8).map((e) => (
                  <div key={e.id} className="phone-row">
                    <span>
                      {e.label}
                      <em className="phone-when">
                        {' '}
                        · {e.status}
                      </em>
                    </span>
                    <span className={e.status === 'missed' ? 'phone-missed' : ''}>{money(e.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {app === 'invest' && (
          <div className="phone-body">
            <div className="phone-hero">
              <span className="hud-label">Portfolio</span>
              <strong>{money(investValue)}</strong>
            </div>
            {investValue <= 0 ? (
              <p className="phone-muted">
                {savings < INVEST_SAVINGS_MIN
                  ? `Need ~$${INVEST_SAVINGS_MIN} savings, then Bank INVEST desk.`
                  : 'Visit the Bank INVEST desk to buy.'}
              </p>
            ) : (
              <div className="phone-list">
                <div className="phone-row">
                  <span>Growth Stock ETF ×{holdings.stock}</span>
                  <span>{money(prices.stock * holdings.stock)}</span>
                </div>
                <div className="phone-row">
                  <span>Steady Bond Fund ×{holdings.bond}</span>
                  <span>{money(prices.bond * holdings.bond)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {app === 'skills' && (
          <div className="phone-body">
            {(Object.keys(SKILL_LABELS) as SkillId[]).map((id) => (
              <div key={id} className="skill-row">
                <div className="skill-row-top">
                  <span>{SKILL_LABELS[id]}</span>
                  <strong>{skills[id].toFixed(1)}/5</strong>
                </div>
                <div className="skill-bar">
                  <div style={{ width: `${(skills[id] / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {app === 'map' && (
          <div className="phone-body">
            <p className="phone-muted">Discovered locations (secrets stay off the map).</p>
            <div className="phone-list">
              {discovered.map((d) => (
                <div key={d} className="phone-row">
                  <span>{d}</span>
                  <span className="phone-muted">found</span>
                </div>
              ))}
              <div className="phone-row">
                <span>Downtown</span>
                <span>{lifeLevel >= DOWNTOWN_UNLOCK_LEVEL ? 'open' : 'locked'}</span>
              </div>
            </div>
          </div>
        )}

        {app === 'news' && (
          <div className="phone-body">
            <h3 className="phone-section">BDC News</h3>
            <div className="phone-list">
              <div className="phone-row">
                <span>Season shift: {season}</span>
              </div>
              {marketNotice && (
                <div className="phone-row">
                  <span>{marketNotice}</span>
                </div>
              )}
              <div className="phone-row">
                <span>
                  Downtown district {lifeLevel >= DOWNTOWN_UNLOCK_LEVEL ? 'open to residents' : 'still gated — keep leveling'}
                </span>
              </div>
              <div className="phone-row">
                <span>Starter block hiring steady at Summit Office</span>
              </div>
            </div>
          </div>
        )}

        {app === 'achievements' && (
          <div className="phone-body">
            <div className="phone-list">
              {ACHIEVEMENT_DEFS.map((a) => (
                <div key={a.id} className={`phone-row ${achievements[a.id] != null ? 'ok' : ''}`}>
                  <span>
                    {achievements[a.id] != null ? '✓' : '○'} {a.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
