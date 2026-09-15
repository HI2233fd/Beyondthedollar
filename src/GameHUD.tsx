import { useGame, SCENE_LOCATION } from './GameState'

const money = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`

export function GameHUD() {
  const cash = useGame((s) => s.cash)
  const bank = useGame((s) => s.bank)
  const scene = useGame((s) => s.scene)

  return (
    <div className="hud">
      <div className="hud-item">
        <span className="hud-label">Cash</span>
        <span className="hud-value">{money(cash)}</span>
      </div>
      <div className="hud-item">
        <span className="hud-label">Bank</span>
        <span className="hud-value">{money(bank)}</span>
      </div>
      <div className="hud-item hud-loc">
        <span className="hud-label">Location</span>
        <span className="hud-value">{SCENE_LOCATION[scene]}</span>
      </div>
    </div>
  )
}
