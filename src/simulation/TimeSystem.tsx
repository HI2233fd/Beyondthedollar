import { useEffect, useRef } from 'react'
import { useGame } from '../GameState'
import { DEFAULT_GAME_MINUTES_PER_REAL_SECOND } from './time'
import { CALENDAR_TRIGGERS } from './scenarios'

function shouldPauseTime(): boolean {
  const s = useGame.getState()
  return (
    !!s.dialogue ||
    s.lifeEventActive ||
    !!s.lifeEventOutcome ||
    !!s.activeLessonId ||
    !!s.activeQuizId ||
    !!s.activeScenarioId ||
    s.transitioning
  )
}

/**
 * Advances the game clock and fires once-only calendar scenario triggers.
 * Pauses while any modal/decision is open.
 */
export function TimeSystem() {
  const lastTs = useRef<number | null>(null)

  useEffect(() => {
    let raf = 0
    const tick = (now: number) => {
      if (lastTs.current == null) lastTs.current = now
      const dt = (now - lastTs.current) / 1000
      lastTs.current = now

      if (!shouldPauseTime() && dt > 0 && dt < 2) {
        const scale = useGame.getState().timeScale
        const advance = dt * DEFAULT_GAME_MINUTES_PER_REAL_SECOND * scale
        if (advance > 0) {
          useGame.getState().advanceTime(advance)
          maybeFireCalendarTriggers()
        }
      } else if (shouldPauseTime()) {
        // Don't accumulate a huge jump when unpausing.
        lastTs.current = now
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return null
}

function maybeFireCalendarTriggers() {
  const s = useGame.getState()
  if (s.activeScenarioId) return
  for (const tr of CALENDAR_TRIGGERS) {
    if (tr.kind !== 'calendar') continue
    if (tr.once !== false && s.firedTriggerIds.includes(tr.id)) continue
    if (s.totalMinutes >= tr.atTotalMinutes) {
      s.openScenario(tr.scenarioId, tr.id)
      return // one interruption at a time
    }
  }
}
