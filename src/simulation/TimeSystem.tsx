import { useEffect, useRef } from 'react'
import { fireRandomExpenseIfDue, useGame } from '../GameState'
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
    s.investingPanelOpen ||
    s.transitioning
  )
}

/**
 * Advances the game clock, fires calendar scenarios, and rolls random life expenses.
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
          fireRandomExpenseIfDue()
        }
      } else if (shouldPauseTime()) {
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
      return
    }
  }
}
