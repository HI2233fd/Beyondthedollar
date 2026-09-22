import { useGame } from '../GameState'
import { DOWNTOWN_UNLOCK_LEVEL } from './types'
import type { ActivityOption } from './characterLook'

function actionForObjective(objectiveId: string, ctx: {
  hasChecking: boolean
  hasJob: boolean
  paystubCount: number
}): ActivityOption['action'] {
  switch (objectiveId) {
    case 'explore-home':
      return 'goto-home'
    case 'leave-home':
    case 'explore-neighborhood':
      return 'goto-city'
    case 'meet-someone':
      return 'talk-jordan'
    case 'open-phone':
    case 'first-opportunity':
      return 'phone'
    case 'open-checking':
      return 'goto-bank'
    case 'get-hired':
      return 'goto-office'
    case 'first-paycheck':
      return ctx.hasJob && ctx.paystubCount === 0 ? 'advance-payday' : 'phone'
    case 'shop-or-save':
      return ctx.hasChecking ? 'goto-bank' : 'goto-grocery'
    default:
      return undefined
  }
}

export function MissionTracker() {
  const characterCreated = useGame((s) => s.characterCreated)
  const missions = useGame((s) => s.missions)
  const lifeLevel = useGame((s) => s.lifeLevel)
  const xp = useGame((s) => s.xp)
  const xpToNext = useGame((s) => s.xpToNext())
  const playerName = useGame((s) => s.playerName)
  const hasChecking = useGame((s) => s.hasCheckingAccount)
  const hasJob = useGame((s) => s.hasJob)
  const paystubs = useGame((s) => s.paystubs)
  const goDo = useGame((s) => s.goDo)

  if (!characterCreated) return null

  const active = missions.find((m) => !m.completed && m.category !== 'completed')
  if (!active) return null

  const nextObj = active.objectives.find((o) => !o.done)
  const done = active.objectives.filter((o) => o.done).length
  const total = active.objectives.length
  const pct = total ? Math.round((done / total) * 100) : 0
  const goAction = nextObj
    ? actionForObjective(nextObj.id, {
        hasChecking,
        hasJob,
        paystubCount: paystubs.length,
      })
    : undefined

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
      {nextObj && goAction && (
        <button
          type="button"
          className="mission-go-btn"
          onClick={() => goDo(goAction)}
        >
          Go — {nextObj.label}
        </button>
      )}
      {lifeLevel < DOWNTOWN_UNLOCK_LEVEL && (
        <p className="mission-downtown-hint">
          {playerName ? `${playerName} · ` : ''}Downtown unlocks at Life Level {DOWNTOWN_UNLOCK_LEVEL}
        </p>
      )}
    </div>
  )
}
