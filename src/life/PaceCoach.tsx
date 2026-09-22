import { useEffect, useMemo, useRef } from 'react'
import { useGame } from '../GameState'
import type { ActivityOption } from './characterLook'

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

  if (!characterCreated || !top || optionsOpen || phoneOpen || dialogue || lessonOpen || quizOpen) {
    return null
  }

  return (
    <div className="pace-coach">
      <div className="pace-coach-label">Next up</div>
      <strong className="pace-coach-title">{top.title}</strong>
      <p className="pace-coach-reason">{top.reason}</p>
      <div className="pace-coach-actions">
        <button type="button" className="pace-go" onClick={() => goDo(top.action)}>
          Go
        </button>
        <button type="button" className="pace-more" onClick={openOptions}>
          More options
        </button>
      </div>
    </div>
  )
}
