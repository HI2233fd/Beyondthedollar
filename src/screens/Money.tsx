import { useState } from 'react'
import { useGame } from '../game/store'
import { Card, StatTile, Bar, Tag } from '../ui/components'
import { Donut } from '../ui/charts'
import {
  computePaycheck,
  creditUtilization,
  debtLabel,
  jobMonthlyGross,
  monthlyExpenses,
  monthlyNetIncome,
} from '../game/engine'
import { money, pct } from '../game/format'

export function Money() {
  const { state, dispatch } = useGame()
  const [transfer, setTransfer] = useState(100)
  const [payAmounts, setPayAmounts] = useState<Record<string, number>>({})
  const hasAccount = state.unlockedAchievements.includes('firstaccount')

  const exp = monthlyExpenses(state)
  const income = monthlyNetIncome(state)
  const util = creditUtilization(state)
  const paycheck = state.job ? computePaycheck(jobMonthlyGross(state.job.hourlyWage, state.job.hoursPerWeek)) : null

  const expenseSlices = [
    { label: 'Housing', value: exp.rent, color: '#818cf8' },
    { label: 'Transport', value: exp.transport, color: '#38bdf8' },
    { label: 'Living', value: exp.living, color: '#34d399' },
    { label: 'Debt', value: exp.debt, color: '#fb7185' },
  ].filter((s) => s.value > 0)

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">FirstCity Bank</div>
        <h1>💵 Money</h1>
        <p>Your accounts, budget, credit, and debt — all in one place.</p>
      </div>

      {!hasAccount && (
        <Card className="mt" >
          <div className="between">
            <div>
              <div className="card-title" style={{ marginBottom: 4 }}>🏦 Open a high-yield savings account</div>
              <div className="muted small">Separate your savings from spending money. Earns ~4.3% APY and keeps your emergency fund safe.</div>
            </div>
            <button className="btn" onClick={() => dispatch({ type: 'OPEN_ACCOUNT' })}>Open account (+10 XP)</button>
          </div>
        </Card>
      )}

      <div className="grid g2 mt-lg">
        <Card>
          <div className="card-title">🏦 Accounts</div>
          <div className="grid g2" style={{ gap: 12 }}>
            <StatTile label="Checking (cash)" value={money(state.cash)} icon="💳" tone={state.cash < 0 ? 'neg' : undefined} />
            <StatTile label="Savings" value={money(state.savings)} icon="🐷" />
          </div>
          <div className="mt-lg">
            <label className="field-label">Move money (${transfer})</label>
            <input type="range" min={25} max={2000} step={25} value={transfer} onChange={(e) => setTransfer(Number(e.target.value))} />
            <div className="row mt" style={{ gap: 10 }}>
              <button className="btn ghost block" onClick={() => dispatch({ type: 'MOVE_MONEY', from: 'cash', amount: transfer })}>
                Cash → Savings
              </button>
              <button className="btn ghost block" onClick={() => dispatch({ type: 'MOVE_MONEY', from: 'savings', amount: transfer })}>
                Savings → Cash
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="card-title">🧾 This month’s budget</div>
          <div className="row" style={{ alignItems: 'center', gap: 18 }}>
            <Donut slices={expenseSlices.length ? expenseSlices : [{ label: 'None', value: 1, color: '#334155' }]} />
            <div className="donut-legend">
              <div className="legend-row"><span className="legend-dot" style={{ background: '#22c55e' }} /> Income {money(income)}</div>
              {expenseSlices.map((s) => (
                <div className="legend-row" key={s.label}>
                  <span className="legend-dot" style={{ background: s.color }} /> {s.label} {money(s.value)}
                </div>
              ))}
              <div className="legend-row" style={{ color: income - exp.total < 0 ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>
                Left over {money(income - exp.total)}
              </div>
            </div>
          </div>
          {paycheck && (
            <div className="info-box mt">
              <div className="h">💡 Your paycheck (gross → net)</div>
              <p>
                Gross {money(paycheck.gross)} − FICA {money(paycheck.fica)} − Fed {money(paycheck.federal)} − State {money(paycheck.state)} = <strong style={{ color: 'var(--green)' }}>{money(paycheck.net)}</strong> take-home.
              </p>
            </div>
          )}
        </Card>
      </div>

      <div className="grid g2 mt-lg">
        <Card>
          <div className="card-title">📊 Credit score</div>
          <div className="between" style={{ alignItems: 'flex-end' }}>
            <div className="val" style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '2.4rem' }}>{state.creditScore}</div>
            <Tag tone={state.creditScore >= 700 ? 'good' : state.creditScore >= 620 ? 'warn' : 'bad'}>
              {state.creditScore >= 740 ? 'Excellent' : state.creditScore >= 700 ? 'Good' : state.creditScore >= 620 ? 'Fair' : 'Building'}
            </Tag>
          </div>
          <div className="mt"><Bar value={state.creditScore - 300} max={550} /></div>
          <div className="grid g2 mt-lg" style={{ gap: 10 }}>
            <div className="stat-tile"><div className="lbl">Utilization</div><div className="val" style={{ fontSize: '1.1rem' }}>{pct(util)}</div><div className="sub">{util < 0.3 ? 'Healthy (<30%)' : 'Too high'}</div></div>
            <div className="stat-tile"><div className="lbl">On-time payments</div><div className="val pos" style={{ fontSize: '1.1rem' }}>{state.onTimePayments}</div><div className="sub">{state.missedPayments} missed</div></div>
          </div>
        </Card>

        <Card>
          <div className="card-title">💳 Debts</div>
          {state.debts.length === 0 ? (
            <div className="muted small">You’re debt-free. 🎉 Keep it that way, or use credit wisely to build history.</div>
          ) : (
            <div className="grid" style={{ gap: 14 }}>
              {state.debts.map((d) => {
                const amt = payAmounts[d.id] ?? Math.min(Math.round(d.balance), 100)
                return (
                  <div key={d.id} className="stat-tile">
                    <div className="between">
                      <div>
                        <div className="r-title">{debtLabel[d.type]} <span className="muted small">· {pct(d.apr)} APR</span></div>
                        <div className="muted small">Min payment {money(d.minPayment)}/mo</div>
                      </div>
                      <div className="val neg" style={{ fontSize: '1.2rem' }}>{money(d.balance)}</div>
                    </div>
                    <div className="row mt" style={{ gap: 10, alignItems: 'center' }}>
                      <input
                        type="range"
                        min={25}
                        max={Math.max(25, Math.round(d.balance))}
                        step={25}
                        value={amt}
                        onChange={(e) => setPayAmounts((p) => ({ ...p, [d.id]: Number(e.target.value) }))}
                        style={{ flex: 1 }}
                      />
                      <button className="btn sm" onClick={() => dispatch({ type: 'PAY_DEBT', debtId: d.id, amount: amt })}>
                        Pay {money(amt)}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
