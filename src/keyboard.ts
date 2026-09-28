import { useGame } from './GameState'
import { DEFAULT_BINDINGS, type ControlBindings } from './world/bindings'
import { useWorldUi } from './world/simStore'

export const pressed = new Set<string>()

let initialized = false
let interactQueued = false

export { DEFAULT_BINDINGS }

export function binding(name: keyof ControlBindings): string {
  return useWorldUi.getState().bindings[name] || DEFAULT_BINDINGS[name]
}

function typingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || !!el.isContentEditable
}

export function initControls() {
  if (initialized) return
  initialized = true

  window.addEventListener('keydown', (e) => {
    if (typingTarget(e.target)) return
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault()
    }
    pressed.add(e.code)
    if (e.code === binding('interact') && !e.repeat) interactQueued = true
    if (e.code === 'Escape') {
      const g = useGame.getState()
      const ui = useWorldUi.getState()
      if (ui.mapOpen) ui.setMap(false)
      else if (ui.calendarOpen) ui.setCalendar(false)
      else if (g.optionsOpen) g.closeOptions()
      else if (g.rewardPopup) g.clearRewardPopup()
      else if (g.classSessionOpen) g.closeClassSession()
      else if (g.phoneOpen) g.closePhone()
      else if (g.investingPanelOpen) g.closeInvestingPanel()
      else if (g.activeScenarioId) g.dismissScenario()
      else if (g.activeQuizId) g.closeQuiz()
      else if (g.activeLessonId) g.closeLesson()
      else if (g.checkpointOpen) g.closeCheckpoint()
      else if (g.activeConceptId) g.closeConcept()
      else if (g.dayLife?.sittingId) g.dayAct({ type: 'sit', seatId: null })
      else if (g.dialogue) g.closeDialogue()
      else if (!document.pointerLockElement) g.openOptions()
    }
  })

  window.addEventListener('keyup', (e) => {
    pressed.delete(e.code)
  })

  window.addEventListener('blur', () => pressed.clear())
}

export function consumeInteract(): boolean {
  if (interactQueued) {
    interactQueued = false
    return true
  }
  return false
}

export function movementLocked(): boolean {
  const s = useGame.getState()
  const ui = useWorldUi.getState()
  return (
    !!s.dialogue ||
    s.transitioning ||
    s.lifeEventActive ||
    !!s.lifeEventOutcome ||
    !!s.activeLessonId ||
    !!s.activeQuizId ||
    !!s.activeScenarioId ||
    s.investingPanelOpen ||
    s.phoneOpen ||
    s.optionsOpen ||
    !!s.rewardPopup ||
    !!s.activity ||
    !!s.classSessionOpen ||
    s.checkpointOpen ||
    !!s.activeConceptId ||
    !!s.dayLife?.drivingVehicleId ||
    ui.fatal ||
    !!s.dayLife?.sittingId ||
    !s.characterCreated ||
    ui.mapOpen ||
    ui.calendarOpen
  )
}
