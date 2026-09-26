import { useState } from 'react'
import { useGame } from '../GameState'
import { DOWNTOWN_UNLOCK_LEVEL, missionStatus } from './types'

function ProgressRing({ pct }: { pct: number }) {
  const r = 22
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c
  return (
    <svg className="ring" width="62" height="62" viewBox="0 0 64 64" role="img" aria-label={`${pct}% complete`}>
      <defs>
        <linearGradient id="missionRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8eb4ff" />
          <stop offset="100%" stopColor="#3b6cff" />
        </linearGradient>
      </defs>
      <circle className="ring-track" cx="32" cy="32" r={r} />
      <circle
        className="ring-value"
        cx="32"
        cy="32"
        r={r}
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
      <text x="32" y="36" textAnchor="middle">
        {pct}%
      </text>
    </svg>
  )
}

export function MissionTracker() {
  const characterCreated = useGame((s) => s.characterCreated)
  const missions = useGame((s) => s.missions)
  const lifeLevel = useGame((s) => s.lifeLevel)
  const playerName = useGame((s) => s.playerName)
  const [stepsOpen, setStepsOpen] = useState(false)

  if (!characterCreated) return null

  const active = missions.filter((m) => {
    const status = missionStatus(m)
    return status === 'active' || status === 'accepted'
  }).slice(0, 3)
  if (active.length === 0) return null
  const focus = active[0]
  const nextObj = focus.objectives.find((o) => !o.done)
  const done = focus.objectives.filter((o) => o.done).length
  const total = focus.objectives.length
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="mission-tracker soft-widget">
      <div className="mission-compact">
        <div className="mission-copy">
          <span className="soft-kicker">{focus.category} · {active.length} open</span>
          <strong className="mission-title">{focus.title}</strong>
          <p className="mission-now">{nextObj ? nextObj.label : 'All steps done'}</p>
        </div>
        <ProgressRing pct={pct} />
      </div>
      <button type="button" className="mission-steps-toggle" onClick={() => setStepsOpen((open) => !open)} aria-expanded={stepsOpen}>
        {stepsOpen ? 'Hide' : 'All open'}
      </button>
      {stepsOpen && (
        <>
          {active.map((mission) => (
            <div key={mission.id}>
              <p className="mission-now">{mission.category} · {mission.title}</p>
              <ul className="mission-objectives">
                {mission.objectives.map((o) => (
                  <li key={o.id} className={o.done ? 'done' : ''}>
                    <span className="obj-check" aria-hidden>
                      {o.done ? '✓' : '○'}
                    </span>
                    {o.optional ? 'Optional: ' : ''}
                    {o.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {lifeLevel < DOWNTOWN_UNLOCK_LEVEL && (
            <p className="mission-downtown-hint">
              {playerName ? `${playerName} · ` : ''}Downtown unlocks at Life Level {DOWNTOWN_UNLOCK_LEVEL}
            </p>
          )}
        </>
      )}
    </div>
  )
}
