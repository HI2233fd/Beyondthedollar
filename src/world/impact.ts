import { applyMoney } from './pay'
import { useGame } from '../GameState'
import { useWorldUi } from './simStore'

let lastHit = 0

/** One collision per impact. Speed is meters per second of the vehicle. */
export function registerImpact(speed: number) {
  const now = performance.now()
  if (now < useWorldUi.getState().protectUntil) return
  if (now - lastHit < 2500) return
  if (useWorldUi.getState().fatal) return
  lastHit = now
  const s = useGame.getState()
  if (speed < 3) {
    s.openDialogue({
      name: 'Traffic',
      text: 'A slow bump. You stumble and stay on your feet.',
      options: [{ label: 'Continue', close: true }],
    })
    return
  }
  if (speed < 8) {
    s.openDialogue({
      name: 'Traffic',
      text: 'You were hit hard enough to need a look. Community Clinic can check you for $40 from your existing balance. Nothing is charged until you confirm.',
      options: [
        {
          label: 'Confirm',
          close: true,
          action: () => {
            const err = applyMoney(-40, 'Clinic visit')
            const g = useGame.getState()
            if (err) g.openDialogue({ name: 'Clinic', text: err, options: [{ label: 'Back', close: true }] })
            else g.openDialogue({ name: 'Dr. Chen', text: 'Checked and released. The $40 is on your ledger.', options: [{ label: 'Continue', close: true }] })
          },
        },
        { label: 'Cancel', close: true },
      ],
    })
    return
  }
  useWorldUi.setState({ fatal: true })
  useGame.setState({ timeScale: 0 })
}
