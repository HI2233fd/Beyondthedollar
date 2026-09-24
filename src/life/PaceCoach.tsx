import { useEffect, useMemo, useRef } from 'react'
import { useGame } from '../GameState'
import type { ActivityOption } from './characterLook'
import { activeGuideBeat } from './guideBeats'

/**
 * Persistent “next move” coach — keeps the game paced instead of open-world roam.
 * Auto-surfaces after short idle stretches and always offers a one-tap Go.
 */
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
  const goDo = useGame((s) => s.goDo)
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

  const idleSince = useRef(Date.now())
  const nudged = useRef(false)

  const top: ActivityOption | null = useMemo(() => {
    if (!characterCreated) return null
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

  // Reset idle clock when player engages something
  useEffect(() => {
    idleSince.current = Date.now()
    nudged.current = false
  }, [scene, optionsOpen, phoneOpen, dialogue, lessonOpen, quizOpen, rewardPopup, hasJob, hasChecking])

  // Soft nudge: open options if idle too long (paced push)
  useEffect(() => {
    if (blocked) return
    const t = window.setInterval(() => {
      if (nudged.current) return
      if (Date.now() - idleSince.current < 14000) return
      nudged.current = true
      openOptions()
    }, 2000)
    return () => clearInterval(t)
  }, [blocked, openOptions])

  if (!characterCreated || guideOn || !top || optionsOpen || phoneOpen || dialogue || lessonOpen || quizOpen) {
    return null
  }

  return (
    <div className="coach-card">
      <span className="soft-kicker">Next</span>
      <strong>{top.title}</strong>
      <p>{top.reason}</p>
      <div className="coach-actions">
        <button type="button" className="soft-go" onClick={() => top.action && goDo(top.action)}>
          Go
        </button>
        <button type="button" className="soft-ghost" onClick={openOptions}>
          More
        </button>
      </div>
    </div>
  )
}
