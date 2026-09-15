import { useEffect, useRef } from 'react'
import { fireRandomExpenseIfDue, processDueBillsAsScenarios, useGame } from '../GameState'
import { DEFAULT_GAME_MINUTES_PER_REAL_SECOND } from './time'
import { CALENDAR_TRIGGERS } from './scenarios'

/** Prevent duplicate RAF loops from HMR / Strict Mode remounts. */
let tickerOwner: symbol | null = null

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
    s.phoneOpen ||
    s.transitioning
  )
}

/**
 * Advances the game clock, fires calendar scenarios, due bills, and random expenses.
 */
export function TimeSystem() {
  const lastTs = useRef<number | null>(null)
  const owner = useRef(Symbol('time-ticker'))

  useEffect(() => {
    const me = owner.current
    // If another instance already owns the ticker, this mount is a duplicate — skip.
    if (tickerOwner && tickerOwner !== me) {
      if (import.meta.env.DEV) console.debug('[TimeSystem] duplicate mount ignored')
      return
    }
    tickerOwner = me

    let raf = 0
    const tick = (now: number) => {
      if (tickerOwner !== me) return
      if (lastTs.current == null) lastTs.current = now
      const dt = Math.min((now - lastTs.current) / 1000, 0.25) // hard cap: no catch-up bursts
      lastTs.current = now

      if (!shouldPauseTime() && dt > 0) {
        const scale = useGame.getState().timeScale
        // Clamp scale so a stuck 32× from old sessions can't runaway after HMR.
        const safeScale = Math.min(Math.max(scale, 0), 4)
        if (safeScale !== scale) useGame.getState().setTimeScale(safeScale)
        const advance = dt * DEFAULT_GAME_MINUTES_PER_REAL_SECOND * safeScale
        if (advance > 0) {
          useGame.getState().advanceTime(advance)
          maybeFireCalendarTriggers()
          processDueBillsAsScenarios()
          fireRandomExpenseIfDue()
        }
      } else if (shouldPauseTime()) {
        lastTs.current = now
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      if (tickerOwner === me) tickerOwner = null
    }
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
      if (import.meta.env.DEV) console.debug('[calendar] fire', tr.id, tr.scenarioId)
      s.openScenario(tr.scenarioId, tr.id)
      return
    }
  }
}
