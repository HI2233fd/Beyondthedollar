import { useGame } from '../game/store'
import { Card, StatTile, Tag } from '../ui/components'
import { HOUSING, TRANSPORT } from '../game/content'
import { money } from '../game/format'

export function Housing() {
  const { state, dispatch } = useGame()
  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Maple Leasing Office</div>
        <h1>🔑 Housing</h1>
        <p>Where you live shapes your monthly budget more than almost anything. Tour a place and sign when you’re ready.</p>
      </div>
      <div className="grid g2">
        {HOUSING.map((h) => {
          const current = state.housing?.id === h.id
          const canAfford = state.cash + state.savings >= h.deposit
          return (
            <Card key={h.id}>
              <div className="between">
                <div className="card-title" style={{ marginBottom: 4 }}>{h.name}</div>
                {current && <Tag tone="good">Current</Tag>}
              </div>
              <div className="muted small">{h.description}</div>
              <div className="grid g3 mt-lg" style={{ gap: 10 }}>
                <StatTile label="Rent" value={h.monthlyRent > 0 ? `${money(h.monthlyRent)}/mo` : 'Free'} />
                <StatTile label="Deposit" value={money(h.deposit)} />
                <StatTile label="Comfort" value={'★'.repeat(h.quality) + '☆'.repeat(5 - h.quality)} />
              </div>
              {!current && (
                <button className="btn mt" disabled={!canAfford} onClick={() => dispatch({ type: 'RENT_HOUSING', housing: h })}>
                  {canAfford ? `Sign lease (${money(h.deposit)} deposit)` : 'Can’t afford deposit'}
                </button>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export function Dealership() {
  const { state, dispatch } = useGame()
  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Auto Mile</div>
        <h1>🚗 Getting Around</h1>
        <p>A car means freedom — and payments, insurance, and repairs. Transit is cheaper but less flexible. There’s no wrong answer, only trade-offs.</p>
      </div>
      <div className="grid g2">
        {TRANSPORT.map((t) => {
          const current = state.transport?.id === t.id
          return (
            <Card key={t.id}>
              <div className="between">
                <div className="card-title" style={{ marginBottom: 4 }}>{t.name}</div>
                {current && <Tag tone="good">Current</Tag>}
              </div>
              <div className="muted small">{t.description}</div>
              <div className="grid g3 mt-lg" style={{ gap: 10 }}>
                <StatTile label="Upfront" value={t.price > 0 ? money(t.price) : 'Free'} />
                <StatTile label="Monthly" value={t.monthlyCost > 0 ? `${money(t.monthlyCost)}/mo` : 'Free'} />
                <StatTile label="Reliability" value={'★'.repeat(t.reliability) + '☆'.repeat(5 - t.reliability)} />
              </div>
              {t.price > 32000 && (
                <div className="info-box mt">
                  <div className="h">💡 Financing</div>
                  <p>Not enough cash? You’ll put ~20% down and finance the rest as an auto loan — adding a monthly payment and interest.</p>
                </div>
              )}
              {!current && (
                <button className="btn mt" onClick={() => dispatch({ type: 'BUY_TRANSPORT', transport: t })}>
                  {t.price > 0 ? `Get it (${money(t.price)})` : 'Choose this'}
                </button>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

const SHOP_ITEMS = [
  { id: 'coffee', name: 'Daily coffee habit', emoji: '☕', cost: 90, cat: 'want', note: 'Small joys add up — ~$90/mo.' },
  { id: 'clothes', name: 'New outfit', emoji: '👕', cost: 160, cat: 'want', note: 'Look good, feel good.' },
  { id: 'groceries', name: 'Stock the pantry', emoji: '🛒', cost: 120, cat: 'need', note: 'Cooking at home saves money.' },
  { id: 'concert', name: 'Concert tickets', emoji: '🎟️', cost: 240, cat: 'want', note: 'An experience to remember.' },
  { id: 'gift', name: 'Gift for a friend', emoji: '🎁', cost: 60, cat: 'want', note: 'Relationships matter too.' },
  { id: 'gym', name: 'Gym membership', emoji: '🏋️', cost: 45, cat: 'need', note: 'Invest in your health.' },
]

export function Shop() {
  const { state, dispatch } = useGame()
  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Market Square & The Corner Diner</div>
        <h1>🛍️ Spending</h1>
        <p>Wants aren’t bad — they’re part of a good life. The skill is fitting them into your plan instead of blowing the budget.</p>
      </div>
      <div className="grid g3">
        {SHOP_ITEMS.map((it) => (
          <Card key={it.id}>
            <div className="row" style={{ alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.8rem' }}>{it.emoji}</span>
              <div>
                <div className="r-title">{it.name}</div>
                <Tag tone={it.cat === 'need' ? 'info' : 'warn'}>{it.cat}</Tag>
              </div>
            </div>
            <div className="muted small mt">{it.note}</div>
            <button
              className="btn ghost sm mt"
              disabled={state.cash + state.savings < it.cost}
              onClick={() => dispatch({ type: 'SPEND', amount: it.cost, label: `Bought: ${it.name}`, category: it.cat })}
            >
              Buy · {money(it.cost)}
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}
