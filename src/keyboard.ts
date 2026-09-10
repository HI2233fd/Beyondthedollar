import { useGame } from './GameState'

export const pressed = new Set<string>()

let initialized = false

export function initControls() {
  if (initialized) return
  initialized = true

  window.addEventListener('keydown', (e) => {
    // Avoid page scrolling with space/arrows
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault()
    }
    pressed.add(e.code)
    if (e.code === 'Escape') {
      useGame.getState().closeDialogue()
    }
  })

  window.addEventListener('keyup', (e) => {
    pressed.delete(e.code)
  })

  // Clear keys if window loses focus so player doesn't "run away"
  window.addEventListener('blur', () => pressed.clear())
}

export function movementLocked(): boolean {
  const s = useGame.getState()
  return !!s.dialogue || s.transitioning || s.lifeEventActive || !!s.lifeEventOutcome
}
