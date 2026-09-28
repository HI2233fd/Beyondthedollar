import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { MathUtils } from 'three'
import { useRig } from './rig'
import { useGame } from './GameState'

const SENS = 0.0022
const MIN_PITCH = 0.1
const MAX_PITCH = 1.2

export function PointerLook() {
  const rig = useRig()
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    const el = gl.domElement

    const onClick = () => {
      const s = useGame.getState()
      if (
        s.dialogue ||
        s.lifeEventActive ||
        s.lifeEventOutcome ||
        s.transitioning ||
        s.activeLessonId ||
        s.activeQuizId ||
        s.activeScenarioId ||
        s.investingPanelOpen ||
        s.phoneOpen
      )
        return
      if (document.pointerLockElement !== el) el.requestPointerLock?.()
    }

    const onMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== el) return
      rig.yaw.current -= e.movementX * SENS
      rig.pitch.current = Math.min(
        MAX_PITCH,
        Math.max(MIN_PITCH, rig.pitch.current + e.movementY * SENS),
      )
    }

    const onWheel = (e: WheelEvent) => {
      rig.zoom.current = MathUtils.clamp(rig.zoom.current + Math.sign(e.deltaY) * 0.6, -1.2, 4.2)
      e.preventDefault()
    }

    el.addEventListener('click', onClick)
    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('mousemove', onMove)

    // Release the mouse when a modal/dialogue/lesson opens.
    const unsub = useGame.subscribe((s) => {
      const modal =
        s.dialogue ||
        s.lifeEventActive ||
        s.lifeEventOutcome ||
        s.activeLessonId ||
        s.activeQuizId ||
        s.activeScenarioId ||
        s.investingPanelOpen ||
        s.phoneOpen
      if (modal && document.pointerLockElement === el) {
        document.exitPointerLock?.()
      }
    })

    return () => {
      el.removeEventListener('click', onClick)
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('mousemove', onMove)
      unsub()
    }
  }, [gl, rig])

  return null
}
