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

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

function fmtWhen(totalMinutes: number) {
  const s = stampFromMinutes(totalMinutes)
  return `${s.weekday} ${s.month}/${s.dayOfMonth} ${s.clockLabel}`
}

type Tab = 'status' | 'portfolio' | 'bills'

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

  const [tab, setTab] = useState<Tab>('status')

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
      <div className="phone-card">
        <div className="phone-top">
          <div className="scenario-badge">Phone</div>
          <button type="button" className="phone-close" onClick={close}>
            Close
          </button>
        </div>
        <div className="phone-tabs">
          <button
            type="button"
            className={`phone-tab ${tab === 'status' ? 'active' : ''}`}
            onClick={() => setTab('status')}
          >
            Status
          </button>
          <button
            type="button"
            className={`phone-tab ${tab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setTab('portfolio')}
          >
            Money
          </button>
          <button
            type="button"
            className={`phone-tab ${tab === 'bills' ? 'active' : ''}`}
            onClick={() => setTab('bills')}
          >
            Bills / Pay
          </button>
        </div>

        {tab === 'status' && (
          <div className="phone-body">
            <div className={`phone-hero ${hasJob ? 'phone-hero-ok' : ''}`}>
              <span className="hud-label">Employment</span>
              <strong>{hasJob ? career : 'No job yet'}</strong>
              <p className="phone-hero-sub">
                {hasJob
                  ? `~${money(effectiveWeekly)}/wk gross · next payday ${fmtWhen(nextPaydayAt)}`
                  : 'Open checking at the bank, then interview with Diane at Summit Office.'}
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
                <span className="hud-label">Credit card</span>
                <strong className="phone-strong-sm">{hasCreditCard ? 'On file' : 'None'}</strong>
              </div>
            </div>

            {incomeFactor !== 1 && incomeFactorUntil > totalMinutes && (
              <p className="phone-muted phone-alert">
                Income modifier ×{incomeFactor.toFixed(2)} until {fmtWhen(incomeFactorUntil)}
              </p>
            )}

            <h3 className="phone-section">Progress checklist</h3>
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

        {tab === 'portfolio' && (
          <div className="phone-body">
            <div className="phone-hero">
              <span className="hud-label">Net worth</span>
              <strong>{money(netWorth)}</strong>
              <p className="phone-hero-sub">
                Liquid {money(liquid)} · Invested {money(investValue)}
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
                <span className="hud-label">Credit score</span>
                <strong>{creditEstablished ? creditScore : 'Unrated'}</strong>
              </div>
            </div>
            <h3 className="phone-section">Investments</h3>
            {investValue <= 0 ? (
              <p className="phone-muted">
                No holdings yet.
                {savings < INVEST_SAVINGS_MIN
                  ? ` Invest unlocks after ~$${INVEST_SAVINGS_MIN} in savings.`
                  : ' Visit the Bank INVEST desk.'}
              </p>
            ) : (
              <div className="phone-list">
                <div className="phone-row">
                  <span>Growth Stock ETF ×{holdings.stock}</span>
                  <span>
                    {money(prices.stock)} → {money(prices.stock * holdings.stock)}
                  </span>
                </div>
                <div className="phone-row">
                  <span>Steady Bond Fund ×{holdings.bond}</span>
                  <span>
                    {money(prices.bond)} → {money(prices.bond * holdings.bond)}
                  </span>
                </div>
                <div className="phone-row phone-row-total">
                  <span>Portfolio total</span>
                  <span>{money(investValue)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'bills' && (
          <div className="phone-body">
            {dueBillIds.length > 0 && (
              <p className="phone-muted phone-alert">
                {dueBillIds.length} bill{dueBillIds.length > 1 ? 's' : ''} waiting for a decision pop-up — close this phone to resolve.
              </p>
            )}
            <h3 className="phone-section">Upcoming</h3>
            {bills.length === 0 ? (
              <p className="phone-muted">No recurring bills scheduled.</p>
            ) : (
              <div className="phone-list">
                {[...bills]
                  .sort((a, b) => a.nextDueTotalMinutes - b.nextDueTotalMinutes)
                  .map((b) => (
                    <div key={b.id} className={`phone-row ${dueBillIds.includes(b.id) ? 'phone-due' : ''}`}>
                      <span>
                        {b.label}
                        <em className="phone-when">
                          {' '}
                          · {dueBillIds.includes(b.id) ? 'DUE NOW' : `due ${fmtWhen(b.nextDueTotalMinutes)}`}
                        </em>
                      </span>
                      <span>{money(b.amount)}</span>
                    </div>
                  ))}
              </div>
            )}

            <h3 className="phone-section">Recent paychecks</h3>
            {paystubs.length === 0 ? (
              <p className="phone-muted">
                {hasJob
                  ? `Hired at ${career} — first stub after payday (${fmtWhen(nextPaydayAt)}).`
                  : 'No paystubs yet — get hired at Summit Office.'}
              </p>
            ) : (
              <div className="phone-list">
                {paystubs.slice(0, 6).map((p) => (
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
            )}

            <h3 className="phone-section">Recent bills / expenses</h3>
            {ledger.length === 0 ? (
              <p className="phone-muted">Nothing logged yet.</p>
            ) : (
              <div className="phone-list">
                {ledger.slice(0, 10).map((e) => (
                  <div key={e.id} className="phone-row">
                    <span>
                      {e.label}
                      <em className="phone-when">
                        {' '}
                        · {fmtWhen(e.atTotalMinutes)} · {e.status}
                      </em>
                    </span>
                    <span className={e.status === 'missed' ? 'phone-missed' : ''}>{money(e.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="phone-muted phone-now">Now: {fmtWhen(totalMinutes)}</p>
          </div>
        )}
      </div>
    </div>
  )
}
