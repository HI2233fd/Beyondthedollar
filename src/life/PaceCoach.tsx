import { useMemo } from 'react'
import { useGame } from '../GameState'
import type { ActivityOption } from './characterLook'
import { activeGuideBeat } from './guideBeats'

/** Quiet reminder that several choices exist. It does not warp the player. */
export function PaceCoach() {
  const characterCreated = useGame((s) => s.characterCreated)
  const optionsOpen = useGame((s) => s.optionsOpen)
  const phoneOpen = useGame((s) => s.phoneOpen)
  const dialogue = useGame((s) => s.dialogue)
  const lessonOpen = useGame((s) => s.activeLessonId)
  const quizOpen = useGame((s) => s.activeQuizId)
  const rewardPopup = useGame((s) => s.rewardPopup)
  const scene = useGame((s) => s.scene)
  const hasJob = useGame((s) => s.hasJob)
  const hasChecking = useGame((s) => s.hasCheckingAccount)
  const paystubs = useGame((s) => s.paystubs)
  const missions = useGame((s) => s.missions)
  const openOptions = useGame((s) => s.openOptions)
  const guideOn = useGame((s) => {
    if (!s.characterCreated) return false
    return (
      activeGuideBeat({
        scene: s.scene,
        hasChecking: s.hasCheckingAccount,
        hasJob: s.hasJob,
        metAnyone: Object.values(s.relationships).some((r) => r.met),
        phoneOpenedOnce: s.phoneOpenedOnce,
        leftHome: s.leftHome,
        firstDayDone: !!s.missions.find((m) => m.id === 'first-day')?.completed,
        guideDismissed: s.guideDismissed,
        lifeLevel: s.lifeLevel,
        paystubCount: s.paystubs.length,
      }) != null
    )
  })

  const top: ActivityOption | null = useMemo(() => {
    if (!characterCreated) return null
    // Recompute when life changes. activityOptions reads the store at call time.
    void scene
    void hasJob
    void hasChecking
    void missions
    void optionsOpen
    void paystubs.length
    const list = useGame.getState().activityOptions()
    return list[0] ?? null
  }, [characterCreated, scene, hasJob, hasChecking, paystubs.length, missions, optionsOpen])

  const blocked =
    !characterCreated ||
    optionsOpen ||
    phoneOpen ||
    !!dialogue ||
    !!lessonOpen ||
    !!quizOpen ||
    !!rewardPopup

  if (!characterCreated || guideOn || !top || blocked) return null

  return (
    <div className="coach-card coach-quiet">
      <span className="soft-kicker">Open</span>
      <strong>{top.title}</strong>
      <p>{top.reason}</p>
      <div className="coach-actions">
        <button type="button" className="soft-ghost" onClick={openOptions}>
          See choices
        </button>
      </div>
    </div>
  )
}
