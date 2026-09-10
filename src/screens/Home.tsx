import { useNavigate } from 'react-router-dom'
import { useGame } from '../game/store'
import { StatTile, Bar, Card, Tag } from '../ui/components'
import { LineChart } from '../ui/charts'
import {
  STAGE_LABEL,
  emergencyMonths,
  financialHealth,
  healthLabel,
  monthlyExpenses,
  monthlyNetIncome,
  netWorth,
  portfolioValue,
} from '../game/engine'
import { money } from '../game/format'
import { CHALLENGES } from '../game/content'

export function Home() {
  const { state, dispatch } = useGame()
  const navigate = useNavigate()
  const health = financialHealth(state)
  const hl = healthLabel(health)
  const nw = netWorth(state)
  const income = monthlyNetIncome(state)
  const exp = monthlyExpenses(state).total
  const surplus = income - exp
  const eMonths = emergencyMonths(state)

  const activeChallenges = CHALLENGES.filter((c) => !state.completedChallenges.includes(c.id)).slice(0, 3)

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Home · {STAGE_LABEL[state.stage]}</div>
        <h1>
          Hey {state.character.name} {state.character.avatar}
        </h1>
        <p>Here’s your life at a glance. Explore the city to make things happen, then advance the month to see the consequences unfold.</p>
      </div>

      <div className="grid g4 stats-4" style={{ marginBottom: 18 }}>
        <StatTile label="Cash" value={money(state.cash)} icon="💵" tone={state.cash < 0 ? 'neg' : undefined} />
        <StatTile label="Savings" value={money(state.savings)} icon="🏦" sub={`${eMonths.toFixed(1)} mo of expenses`} />
        <StatTile label="Investments" value={money(portfolioValue(state))} icon="📈" />
        <StatTile label="Net worth" value={money(nw)} icon="💎" tone={nw < 0 ? 'neg' : 'pos'} />
      </div>

      <div className="grid g2" style={{ marginBottom: 18 }}>
        <Card>
          <div className="card-title">❤️ Financial Health</div>
          <div className="between" style={{ alignItems: 'flex-end' }}>
            <div>
              <div className="val" style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '2.6rem' }}>{health}</div>
              <Tag tone={hl.tone as 'good' | 'bad' | 'warn'}>{hl.label}</Tag>
            </div>
            <div className="muted small" style={{ textAlign: 'right', maxWidth: 200 }}>
              Emergency fund, debt load, credit, and investing all feed this score.
            </div>
          </div>
          <div className="mt">
            <Bar value={health} variant={health < 40 ? 'warm' : undefined} />
          </div>
          <div className="grid g3 mt-lg" style={{ gap: 10 }}>
            <div className="stat-tile">
              <div className="lbl">Monthly income</div>
              <div className="val pos" style={{ fontSize: '1.15rem' }}>{money(income)}</div>
            </div>
            <div className="stat-tile">
              <div className="lbl">Monthly costs</div>
              <div className="val neg" style={{ fontSize: '1.15rem' }}>{money(exp)}</div>
            </div>
            <div className="stat-tile">
              <div className="lbl">Left over</div>
              <div className={`val ${surplus < 0 ? 'neg' : 'pos'}`} style={{ fontSize: '1.15rem' }}>{money(surplus)}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="card-title">📊 Net worth over time</div>
          <LineChart data={state.netWorthHistory} />
          <div className="between mt">
            <span className="chip">💳 Credit {state.creditScore}</span>
            <span className="chip">😌 Stress {Math.round(state.stress)}%</span>
          </div>
        </Card>
      </div>

      <div className="grid g3" style={{ marginBottom: 18 }}>
        <Card>
          <div className="card-title">💼 Work</div>
          {state.job ? (
            <>
              <div className="r-title">{state.job.title}</div>
              <div className="muted small">{state.job.employer} · ${state.job.hourlyWage}/hr · {state.job.hoursPerWeek}h/wk</div>
            </>
          ) : (
            <div className="muted small">No job yet. Visit Career Tower to find work.</div>
          )}
          <button className="btn ghost sm mt" onClick={() => navigate('/career')}>Manage career</button>
        </Card>
        <Card>
          <div className="card-title">🔑 Housing</div>
          {state.housing ? (
            <>
              <div className="r-title">{state.housing.name}</div>
              <div className="muted small">{state.housing.monthlyRent > 0 ? `${money(state.housing.monthlyRent)}/mo rent` : 'Rent-free'}</div>
            </>
          ) : (
            <div className="muted small">Nowhere to live yet. Visit the leasing office.</div>
          )}
          <button className="btn ghost sm mt" onClick={() => navigate('/housing')}>Find housing</button>
        </Card>
        <Card>
          <div className="card-title">🚗 Transport</div>
          {state.transport ? (
            <>
              <div className="r-title">{state.transport.name}</div>
              <div className="muted small">{state.transport.monthlyCost > 0 ? `${money(state.transport.monthlyCost)}/mo` : 'Free'}</div>
            </>
          ) : (
            <div className="muted small">Getting around on foot. Consider transit or a car.</div>
          )}
          <button className="btn ghost sm mt" onClick={() => navigate('/dealership')}>Get around</button>
        </Card>
      </div>

      <div className="grid g2">
        <Card>
          <div className="between">
            <div className="card-title" style={{ marginBottom: 0 }}>🎯 Active challenges</div>
            <button className="btn ghost sm" onClick={() => navigate('/challenges')}>View all</button>
          </div>
          <div className="grid mt" style={{ gap: 12 }}>
            {activeChallenges.map((c) => {
              const prog = state.challengeProgress[c.id] ?? 0
              return (
                <div key={c.id}>
                  <div className="between small">
                    <span>{c.emoji} {c.title}</span>
                    <span className="muted">{c.unit === '$' ? money(prog) : prog}/{c.unit === '$' ? money(c.target) : `${c.target} ${c.unit}`}</span>
                  </div>
                  <Bar value={prog} max={c.target} />
                </div>
              )
            })}
            {activeChallenges.length === 0 && <div className="muted small">All challenges complete — legend! 🏆</div>}
          </div>
        </Card>

        <Card>
          <div className="card-title">✨ What now?</div>
          <p className="muted small">Living a life is a loop: explore, decide, and adapt. Try one of these.</p>
          <div className="grid mt" style={{ gap: 10 }}>
            <button className="btn cool block" onClick={() => navigate('/city')}>🌆 Explore Merridian</button>
            <button className="btn ghost block" onClick={() => navigate('/learn')}>💡 Learn a money concept</button>
            <button className="btn block" onClick={() => dispatch({ type: 'ADVANCE_MONTH' })} disabled={!!state.pendingEventId}>
              ⏭ Advance to next month
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
