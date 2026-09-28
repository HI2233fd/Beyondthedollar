import { useEffect, useState } from 'react'
import { useGame } from '../GameState'
import { DOWNTOWN_UNLOCK_LEVEL, missionStatus } from './types'
import { currentStory, storyDoor } from '../world/story'
import { useRig } from '../rig'
import { useWorldUi } from '../world/simStore'

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
  const [meters, setMeters] = useState<number | null>(null)
  const rig = useRig()
  const scene = useGame((s) => s.scene)
  const story = currentStory()
  const patchWorld = useGame((s) => s.patchWorld)
  const setGuiding = useWorldUi((s) => s.setGuiding)

  useEffect(() => {
    let raf = 0
    let last = 0
    const loop = () => {
      const now = performance.now()
      if (now - last > 250) {
        last = now
        const g = rig.groupRef.current
        const door = storyDoor(story.destinationId)
        if (g && door && scene === 'city') setMeters(Math.round(Math.hypot(door.x - g.position.x, door.z - g.position.z)))
        else setMeters(null)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [rig, scene, story.destinationId])

  if (!characterCreated) return null

  const active = missions.filter((m) => {
    const status = missionStatus(m)
    return status === 'active' || status === 'accepted'
  }).slice(0, 3)
  const focus = active[0]
  const nextObj = focus?.objectives.find((o) => !o.done)
  const done = focus?.objectives.filter((o) => o.done).length ?? 0
  const total = focus?.objectives.length ?? 0
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="mission-tracker soft-widget">
      <div className="mission-compact">
        <div className="mission-copy">
          <span className="soft-kicker">Build Your Independent Life · {story.chapter}</span>
          <strong className="mission-title">{story.title}</strong>
          <p className="mission-now">{story.objective}</p>
          <p className="mission-now">
            {story.destinationName}
            {meters != null ? ` · ${meters} m` : ''}
            {' · '}
            {story.progress}
          </p>
          <p className="mission-now">{story.reward}</p>
          {story.destinationId && (
            <button
              type="button"
              className="mission-steps-toggle"
              onClick={() => {
                patchWorld({ trackedId: story.destinationId })
                if (scene === 'city') setGuiding(true)
              }}
            >
              Track destination
            </button>
          )}
          {active.length > 0 && (
            <p className="mission-now">Also open: {focus.title}{nextObj ? ` — ${nextObj.label}` : ''}</p>
          )}
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
