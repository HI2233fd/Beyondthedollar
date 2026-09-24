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
  const goDo = useGame((s) => s.goDo)

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

  const primaryAction = (() => {
    switch (beat.id) {
      case 'leave':
        return 'goto-city' as const
      case 'phone':
        return 'phone' as const
      case 'meet':
        return 'talk-jordan' as const
      case 'bank':
        return 'goto-bank' as const
      case 'job':
        return 'goto-office' as const
      case 'payday':
        return 'advance-payday' as const
      default:
        return null
    }
  })()

  return (
    <div className="coach-card">
      <span className="soft-kicker">Guide</span>
      <strong>{beat.title}</strong>
      <p>{beat.text}</p>
      <div className="coach-actions">
        {primaryAction && (
          <button
            type="button"
            className="soft-go"
            onClick={() => {
              dismissGuide(beat.dismissKey)
              goDo(primaryAction)
            }}
          >
            Go
          </button>
        )}
        <button type="button" className="soft-ghost" onClick={() => dismissGuide(beat.dismissKey)}>
          Got it
        </button>
      </div>
    </div>
  )
}
