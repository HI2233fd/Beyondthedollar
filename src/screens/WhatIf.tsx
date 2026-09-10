import { useState } from 'react'
import { useGame } from '../game/store'
import { Card, Tag } from '../ui/components'
import { LineChart } from '../ui/charts'
import { ASSETS } from '../game/engine'
import { money } from '../game/format'

type Scenario = 'saveVsInvest' | 'carVsTransit' | 'payoffVsMinimum'

const SCENARIOS: { id: Scenario; title: string; emoji: string; desc: string }[] = [
  { id: 'saveVsInvest', title: 'Save it vs. Invest it', emoji: '🌱', desc: 'Put $200/month in savings vs. an index fund for 10 years.' },
  { id: 'carVsTransit', title: 'New car vs. Transit', emoji: '🚗', desc: 'Finance a $32k car vs. riding transit for 5 years.' },
  { id: 'payoffVsMinimum', title: 'Pay off vs. Minimums', emoji: '💳', desc: 'Attack a $3,000 credit card vs. paying only the minimum.' },
]

interface Path {
  label: string
  color: string
  series: { month: number; netWorth: number }[]
  final: number
  note: string
}

function project(scenario: Scenario): { months: number; a: Path; b: Path } {
  const idxMonthly = ASSETS.index.meanMonthly
  const hysaMonthly = ASSETS.hysa.meanMonthly

  if (scenario === 'saveVsInvest') {
    const months = 120
    const perMonth = 200
    let save = 0
    let inv = 0
    const sSeries: { month: number; netWorth: number }[] = []
    const iSeries: { month: number; netWorth: number }[] = []
    for (let m = 1; m <= months; m++) {
      save = save * (1 + hysaMonthly) + perMonth
      inv = inv * (1 + idxMonthly) + perMonth
      sSeries.push({ month: m, netWorth: Math.round(save) })
      iSeries.push({ month: m, netWorth: Math.round(inv) })
    }
    return {
      months,
      a: { label: 'Savings (4.3%)', color: '#38bdf8', series: sSeries, final: save, note: 'Safe and steady — barely beats inflation.' },
      b: { label: 'Index Fund (~9%)', color: '#34d399', series: iSeries, final: inv, note: 'More ups and downs, but compounding does the heavy lifting.' },
    }
  }

  if (scenario === 'carVsTransit') {
    const months = 60
    const price = 32000
    const down = 6400
    const loanApr = 0.07
    const carPayment = (25600 * (loanApr / 12)) / (1 - Math.pow(1 + loanApr / 12, -60))
    const carMonthlyCost = 560
    const transitCost = 70
    let carNet = -down
    let transitNet = 0
    let loan = price - down
    const carSeries: { month: number; netWorth: number }[] = []
    const transitSeries: { month: number; netWorth: number }[] = []
    for (let m = 1; m <= months; m++) {
      const interest = loan * (loanApr / 12)
      loan = Math.max(0, loan + interest - carPayment)
      carNet -= carMonthlyCost
      transitNet -= transitCost
      const freed = carMonthlyCost + carPayment - transitCost
      transitNet += freed
      const carValue = Math.max(price * Math.pow(0.85, m / 12), 4000)
      carSeries.push({ month: m, netWorth: Math.round(carNet + carValue - loan) })
      transitSeries.push({ month: m, netWorth: Math.round(transitNet) })
    }
    return {
      months,
      a: { label: 'New Car', color: '#fb7185', series: carSeries, final: carSeries[carSeries.length - 1].netWorth, note: 'Freedom & reliability — but depreciation, payments, and interest add up.' },
      b: { label: 'Transit + invest the difference', color: '#34d399', series: transitSeries, final: transitSeries[transitSeries.length - 1].netWorth, note: 'Less convenient, but the money you save can grow instead.' },
    }
  }

  // payoffVsMinimum
  const months = 36
  const apr = 0.24
  let fast = 3000
  let slow = 3000
  const fastSeries: { month: number; netWorth: number }[] = []
  const slowSeries: { month: number; netWorth: number }[] = []
  for (let m = 1; m <= months; m++) {
    fast = Math.max(0, fast * (1 + apr / 12) - 300)
    const minPay = Math.max(25, slow * 0.03)
    slow = Math.max(0, slow * (1 + apr / 12) - minPay)
    fastSeries.push({ month: m, netWorth: -Math.round(fast) })
    slowSeries.push({ month: m, netWorth: -Math.round(slow) })
  }
  return {
    months,
    a: { label: 'Pay $300/mo', color: '#34d399', series: fastSeries, final: -fast, note: 'Aggressive payments crush the balance and save huge interest.' },
    b: { label: 'Minimum only', color: '#fb7185', series: slowSeries, final: -slow, note: 'Minimums barely dent it — interest keeps the debt alive for years.' },
  }
}

export function WhatIf() {
  const { state } = useGame()
  const [scenario, setScenario] = useState<Scenario>('saveVsInvest')
  const result = project(scenario)
  const winner = result.a.final > result.b.final ? result.a : result.b

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">What-If Mode</div>
        <h1>🔮 Compare life paths</h1>
        <p>See how the same starting point can lead to very different outcomes. There’s rarely one “right” answer — just trade-offs worth understanding.</p>
        <div className="muted small mt">Playing as {state.character.avatar} {state.character.name}</div>
      </div>

      <div className="grid g3">
        {SCENARIOS.map((s) => (
          <button key={s.id} className={`option-row ${scenario === s.id ? 'selected' : ''}`} onClick={() => setScenario(s.id)}>
            <div>
              <div className="r-title">{s.emoji} {s.title}</div>
              <div className="r-sub">{s.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid g2 mt-lg">
        {[result.a, result.b].map((p) => (
          <Card key={p.label}>
            <div className="between">
              <div className="card-title" style={{ marginBottom: 0 }}>
                <span className="legend-dot" style={{ background: p.color, display: 'inline-block', marginRight: 6 }} />
                {p.label}
              </div>
              {winner.label === p.label && <Tag tone="good">Higher net worth</Tag>}
            </div>
            <div className="val mt" style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '2rem', color: p.final >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {money(p.final)}
            </div>
            <div className="muted small">after {Math.round(result.months / 12)} years</div>
            <div style={{ marginTop: 10 }}>
              <LineChart data={p.series} height={130} />
            </div>
            <div className="muted small mt">{p.note}</div>
          </Card>
        ))}
      </div>

      <Card className="mt-lg">
        <div className="info-box" style={{ marginTop: 0 }}>
          <div className="h">💡 The takeaway</div>
          <p>
            The gap between these paths is <strong>{money(Math.abs(result.a.final - result.b.final))}</strong>. Small, consistent decisions
            compound into life-changing differences over time — for better or worse.
          </p>
        </div>
      </Card>
    </div>
  )
}
