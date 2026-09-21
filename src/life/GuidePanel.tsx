import { useGame } from '../GameState'
import { activeGuideBeat } from './guideBeats'
import type { GuideContext } from './characterLook'

export function GuidePanel() {
  const characterCreated = useGame((s) => s.characterCreated)
  const scene = useGame((s) => s.scene)
  const hasChecking = useGame((s) => s.hasCheckingAccount)
  const hasJob = useGame((s) => s.hasJob)
  const relationships = useGame((s) => s.relationships)
  const phoneOpenedOnce = useGame((s) => s.phoneOpenedOnce)
  const leftHome = useGame((s) => s.leftHome)
  const missions = useGame((s) => s.missions)
  const guideDismissed = useGame((s) => s.guideDismissed)
  const lifeLevel = useGame((s) => s.lifeLevel)
  const dismissGuide = useGame((s) => s.dismissGuide)
  const openOptions = useGame((s) => s.openOptions)

  if (!characterCreated) return null

  const ctx: GuideContext = {
    scene,
    hasChecking,
    hasJob,
    metAnyone: Object.values(relationships).some((r) => r.met),
    phoneOpenedOnce,
    leftHome,
    firstDayDone: !!missions.find((m) => m.id === 'first-day')?.completed,
    guideDismissed,
    lifeLevel,
  }

  const beat = activeGuideBeat(ctx)
  if (!beat) return null

  return (
    <div className="guide-card">
      <div className="guide-avatar" aria-hidden>
        <span>✦</span>
      </div>
      <div className="guide-body">
        <div className="guide-label">Guide</div>
        <strong>{beat.title}</strong>
        <p>{beat.text}</p>
        <div className="guide-actions">
          <button type="button" className="btn-primary guide-btn" onClick={() => dismissGuide(beat.dismissKey)}>
            Got it
          </button>
          <button
            type="button"
            className="btn-ghost guide-btn"
            onClick={() => {
              dismissGuide(beat.dismissKey)
              openOptions()
            }}
          >
            Show my options
          </button>
        </div>
      </div>
    </div>
  )
}
