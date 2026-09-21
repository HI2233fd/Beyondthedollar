import { useGame } from '../GameState'
import { DOWNTOWN_UNLOCK_LEVEL } from './types'

export function MissionTracker() {
  const characterCreated = useGame((s) => s.characterCreated)
  const missions = useGame((s) => s.missions)
  const lifeLevel = useGame((s) => s.lifeLevel)
  const xp = useGame((s) => s.xp)
  const xpToNext = useGame((s) => s.xpToNext())
  const playerName = useGame((s) => s.playerName)

  if (!characterCreated) return null

  const active = missions.find((m) => !m.completed && m.category !== 'completed')
  if (!active) return null

  const done = active.objectives.filter((o) => o.done).length
  const total = active.objectives.length
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="mission-tracker">
      <div className="mission-tracker-top">
        <span className="mission-badge">{active.category}</span>
        <span className="mission-level">
          Lv {lifeLevel} · {xp}/{xpToNext} XP
        </span>
      </div>
      <strong className="mission-title">{active.title}</strong>
      <p className="mission-desc">{active.description}</p>
      <ul className="mission-objectives">
        {active.objectives.map((o) => (
          <li key={o.id} className={o.done ? 'done' : ''}>
            <span className="obj-check">{o.done ? '✓' : '○'}</span>
            {o.label}
          </li>
        ))}
      </ul>
      <div className="mission-progress-bar">
        <div style={{ width: `${pct}%` }} />
      </div>
      {lifeLevel < DOWNTOWN_UNLOCK_LEVEL && (
        <p className="mission-downtown-hint">
          {playerName ? `${playerName} · ` : ''}Downtown unlocks at Life Level {DOWNTOWN_UNLOCK_LEVEL}
        </p>
      )}
    </div>
  )
}
