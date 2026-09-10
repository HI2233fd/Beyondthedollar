import { useGame } from './GameState'

export const pressed = new Set<string>()

let initialized = false
let interactQueued = false

export function initControls() {
  if (initialized) return
  initialized = true

  window.addEventListener('keydown', (e) => {
    // Avoid page scrolling with space/arrows
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault()
    }
    pressed.add(e.code)
    // Queue interaction on the keydown edge so a fast tap can never be
    // dropped between animation frames (ignore auto-repeat).
    if (e.code === 'KeyE' && !e.repeat) {
      interactQueued = true
    }
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

/** Returns true once per E keypress, then clears the queued flag. */
export function consumeInteract(): boolean {
  if (interactQueued) {
    interactQueued = false
    return true
  }
  return false
}

export function movementLocked(): boolean {
  const s = useGame.getState()
  return !!s.dialogue || s.transitioning || s.lifeEventActive || !!s.lifeEventOutcome
}
