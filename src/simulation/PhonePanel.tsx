import { useState } from 'react'
import { useGame } from '../GameState'
import { portfolioValue } from './investing'
import { stampFromMinutes } from './time'
import { INVEST_SAVINGS_MIN } from './progression'

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

function fmtWhen(totalMinutes: number) {
  const s = stampFromMinutes(totalMinutes)
  return `${s.month}/${s.dayOfMonth} ${s.clockLabel}`
}

type Tab = 'portfolio' | 'bills'

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
  const prices = useGame((s) => s.assetPrices)
  const holdings = useGame((s) => s.holdings)
  const bills = useGame((s) => s.recurringBills)
  const ledger = useGame((s) => s.ledger)
  const paystubs = useGame((s) => s.paystubs)
  const totalMinutes = useGame((s) => s.totalMinutes)
  const carStatus = useGame((s) => s.carStatus)
  const homeStatus = useGame((s) => s.homeStatus)
  const hasJob = useGame((s) => s.hasJob)
  const career = useGame((s) => s.career)
  const weeklyIncome = useGame((s) => s.weeklyIncome)
  const incomeFactor = useGame((s) => s.incomeFactor)

  const [tab, setTab] = useState<Tab>('portfolio')

  if (!open) return null

  const investValue = portfolioValue(prices, holdings)
  const netWorth = cash + bank + savings + investValue - debt
  const effectiveWeekly = Math.round(weeklyIncome * incomeFactor)

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
            className={`phone-tab ${tab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setTab('portfolio')}
          >
            Portfolio
          </button>
          <button
            type="button"
            className={`phone-tab ${tab === 'bills' ? 'active' : ''}`}
            onClick={() => setTab('bills')}
          >
            Bills / Pay
          </button>
        </div>

        {tab === 'portfolio' && (
          <div className="phone-body">
            <div className="phone-hero">
              <span className="hud-label">Net worth</span>
              <strong>{money(netWorth)}</strong>
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
            <h3 className="phone-section">Life</h3>
            <p className="phone-muted">
              {hasJob ? `${career} · ~${money(effectiveWeekly)}/wk` : 'No job yet'} ·{' '}
              {homeStatus === 'owned' ? 'Homeowner' : 'Renting Maple'} ·{' '}
              {carStatus === 'none' ? 'No car' : `Car ${carStatus}`}
              {debt > 0 ? ` · Debt ${money(debt)}` : ''}
            </p>
          </div>
        )}

        {tab === 'bills' && (
          <div className="phone-body">
            <h3 className="phone-section">Upcoming</h3>
            {bills.length === 0 ? (
              <p className="phone-muted">No recurring bills scheduled.</p>
            ) : (
              <div className="phone-list">
                {[...bills]
                  .sort((a, b) => a.nextDueTotalMinutes - b.nextDueTotalMinutes)
                  .map((b) => (
                    <div key={b.id} className="phone-row">
                      <span>
                        {b.label}
                        <em className="phone-when"> · due {fmtWhen(b.nextDueTotalMinutes)}</em>
                      </span>
                      <span>{money(b.amount)}</span>
                    </div>
                  ))}
              </div>
            )}

            <h3 className="phone-section">Recent paychecks</h3>
            {paystubs.length === 0 ? (
              <p className="phone-muted">No paystubs yet — get hired at Summit Office.</p>
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
