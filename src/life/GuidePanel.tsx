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
  const paystubs = useGame((s) => s.paystubs)
  const dismissGuide = useGame((s) => s.dismissGuide)

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
    paystubCount: paystubs.length,
  }

  const beat = activeGuideBeat(ctx)
  if (!beat) return null

  return (
    <div className="coach-card">
      <span className="soft-kicker">Guide</span>
      <strong>{beat.title}</strong>
      <p>{beat.text}</p>
      <div className="coach-actions">
        <button type="button" className="soft-ghost" onClick={() => dismissGuide(beat.dismissKey)}>
          Got it
        </button>
      </div>
    </div>
  )
}
