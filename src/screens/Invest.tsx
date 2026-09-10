import { useState } from 'react'
import { useGame } from '../game/store'
import { Card, StatTile, Tag } from '../ui/components'
import { Donut } from '../ui/charts'
import { ASSETS, portfolioInvested, portfolioValue } from '../game/engine'
import { money, pct } from '../game/format'
import type { AssetClass } from '../game/types'

export function Invest() {
  const { state, dispatch } = useGame()
  const [amount, setAmount] = useState(100)
  const invested = portfolioInvested(state)
  const value = portfolioValue(state)
  const gain = value - invested
  const gainPct = invested > 0 ? gain / invested : 0

  const slices = state.holdings.map((h) => ({ label: ASSETS[h.asset].name, value: h.value, color: ASSETS[h.asset].color }))

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Summit Brokerage</div>
        <h1>📈 Invest</h1>
        <p>Put your money to work. Higher potential returns come with bigger swings — diversify to smooth the ride.</p>
      </div>

      <div className="grid g4 stats-4">
        <StatTile label="Portfolio value" value={money(value)} icon="📈" />
        <StatTile label="Invested" value={money(invested)} icon="💵" />
        <StatTile label="Gain / loss" value={`${gain >= 0 ? '+' : ''}${money(gain)}`} tone={gain >= 0 ? 'pos' : 'neg'} icon={gain >= 0 ? '🟢' : '🔴'} />
        <StatTile label="Return" value={pct(gainPct, 1)} tone={gain >= 0 ? 'pos' : 'neg'} icon="⚖️" />
      </div>

      <div className="grid g2 mt-lg">
        <Card>
          <div className="card-title">🧺 Your portfolio</div>
          {state.holdings.length === 0 ? (
            <div className="muted small">You haven’t invested yet. Even $25 in an index fund starts the compounding clock. 🌱</div>
          ) : (
            <div className="row" style={{ alignItems: 'center', gap: 18 }}>
              <Donut slices={slices} />
              <div className="donut-legend">
                {state.holdings.map((h) => (
                  <div className="legend-row" key={h.asset}>
                    <span className="legend-dot" style={{ background: ASSETS[h.asset].color }} />
                    {ASSETS[h.asset].name}
                    <strong style={{ color: 'var(--text)', marginLeft: 4 }}>{money(h.value)}</strong>
                    <button className="btn ghost sm" style={{ marginLeft: 6 }} onClick={() => dispatch({ type: 'SELL', asset: h.asset, amount: h.value })}>
                      Sell
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {state.holdings.length === 1 && (
            <div className="info-box mt">
              <div className="h">💡 Diversification</div>
              <p>You own one type of asset. Spreading across several (like adding a bond fund) lowers your risk without giving up much return.</p>
            </div>
          )}
        </Card>

        <Card>
          <div className="card-title">🛒 Buy investments</div>
          <label className="field-label">Amount to invest: {money(amount)} <span className="muted">(cash: {money(state.cash)})</span></label>
          <input type="range" min={25} max={Math.max(50, Math.round(state.cash))} step={25} value={Math.min(amount, Math.max(50, state.cash))} onChange={(e) => setAmount(Number(e.target.value))} />
          <div className="grid mt" style={{ gap: 10 }}>
            {(Object.keys(ASSETS) as AssetClass[]).map((k) => {
              const a = ASSETS[k]
              return (
                <div key={k} className="option-row" style={{ cursor: 'default' }}>
                  <div>
                    <div className="r-title">
                      <span className="legend-dot" style={{ background: a.color, display: 'inline-block', marginRight: 6 }} />
                      {a.name} <Tag tone={a.risk === 'Very Low' || a.risk === 'Low' ? 'good' : a.risk === 'Medium' ? 'info' : a.risk === 'High' ? 'warn' : 'bad'}>{a.risk} risk</Tag>
                    </div>
                    <div className="r-sub">{a.blurb} · ~{pct(a.meanMonthly * 12, 1)}/yr avg</div>
                  </div>
                  <button className="btn sm" disabled={state.cash < 25} onClick={() => dispatch({ type: 'INVEST', asset: k, amount: Math.min(amount, state.cash) })}>
                    Buy
                  </button>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
