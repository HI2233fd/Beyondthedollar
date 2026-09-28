import { useEffect } from 'react'
import { useGame } from '../GameState'

export function RewardToast() {
  const reward = useGame((s) => s.rewardPopup)
  const clear = useGame((s) => s.clearRewardPopup)
  const xp = useGame((s) => s.xp)
  const xpToNext = useGame((s) => s.xpToNext())
  const lifeLevel = useGame((s) => s.lifeLevel)

  useEffect(() => {
    if (!reward) return
    const t = window.setTimeout(() => clear(), 4200)
    return () => clearTimeout(t)
  }, [reward, clear])

  if (!reward) return null

  const pct = Math.min(100, Math.round((xp / Math.max(1, xpToNext)) * 100))

  return (
    <div className="reward-toast" role="status">
      <div className="reward-badge">{reward.title}</div>
      <ul>
        {reward.lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      {reward.xp != null && (
        <div className="reward-xp">
          <div className="reward-xp-label">
            Life Level {lifeLevel} · {xp}/{xpToNext} XP
          </div>
          <div className="reward-xp-bar">
            <div style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      <button type="button" className="reward-dismiss" onClick={clear}>
        Continue
      </button>
    </div>
  )
}
