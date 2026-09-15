import { useState } from 'react'
import { useGame } from '../GameState'
import { INITIAL_ASSETS, portfolioValue, type AssetId } from './investing'

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function InvestingPanel() {
  const open = useGame((s) => s.investingPanelOpen)
  const prices = useGame((s) => s.assetPrices)
  const holdings = useGame((s) => s.holdings)
  const bank = useGame((s) => s.bank)
  const buyAsset = useGame((s) => s.buyAsset)
  const sellAsset = useGame((s) => s.sellAsset)
  const close = useGame((s) => s.closeInvestingPanel)
  const [msg, setMsg] = useState<string | null>(null)

  if (!open) return null

  const value = portfolioValue(prices, holdings)

  const onBuy = (id: AssetId) => {
    const err = buyAsset(id, 1)
    setMsg(err ?? `Bought 1 share @ ${money(prices[id])}`)
  }
  const onSell = (id: AssetId) => {
    const err = sellAsset(id, 1)
    setMsg(err ?? `Sold 1 share @ ${money(prices[id])}`)
  }

  return (
    <div className="modal-overlay scenario-overlay">
      <div className="invest-card">
        <div className="scenario-badge">Invest</div>
        <h2 className="scenario-title">FirstCity Invest</h2>
        <p className="scenario-setup">
          Prices update each game day. Higher risk usually means bigger swings.
        </p>
        <div className="invest-summary">
          <div>
            <span className="hud-label">Checking</span>
            <strong>{money(bank)}</strong>
          </div>
          <div>
            <span className="hud-label">Portfolio</span>
            <strong>{money(value)}</strong>
          </div>
        </div>
        <div className="invest-list">
          {(Object.keys(INITIAL_ASSETS) as AssetId[]).map((id) => {
            const a = INITIAL_ASSETS[id]
            return (
              <div key={id} className="invest-row">
                <div className="invest-meta">
                  <strong>{a.name}</strong>
                  <span>
                    {a.risk === 'high' ? 'Higher risk / return' : 'Lower risk / return'} ·{' '}
                    {money(prices[id])}
                  </span>
                  <span>Owned: {holdings[id]}</span>
                </div>
                <div className="invest-actions">
                  <button type="button" className="scenario-btn" onClick={() => onBuy(id)}>
                    Buy 1
                  </button>
                  <button type="button" className="scenario-btn" onClick={() => onSell(id)}>
                    Sell 1
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        {msg && <p className="invest-msg">{msg}</p>}
        <button type="button" className="scenario-continue" onClick={close}>
          Close desk
        </button>
      </div>
    </div>
  )
}
