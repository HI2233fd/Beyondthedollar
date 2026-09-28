import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useRig } from './rig'
import { useGame } from './GameState'
import { useWorldUi } from './world/simStore'

const SENS = 0.002
const MIN_PITCH = -0.05
const MAX_PITCH = 1.0

function modalOpen(s: ReturnType<typeof useGame.getState>, map: boolean, calendar: boolean) {
  return !!(
    s.dialogue ||
    s.lifeEventActive ||
    s.lifeEventOutcome ||
    s.transitioning ||
    s.activeLessonId ||
    s.activeQuizId ||
    s.activeScenarioId ||
    s.investingPanelOpen ||
    s.phoneOpen ||
    s.optionsOpen ||
    s.rewardPopup ||
    s.activity ||
    s.classSessionOpen ||
    s.checkpointOpen ||
    s.activeConceptId ||
    map ||
    calendar ||
    !s.characterCreated
  )
}

export function PointerLook() {
  const rig = useRig()
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    const el = gl.domElement

    const onClick = () => {
      const s = useGame.getState()
      const ui = useWorldUi.getState()
      if (modalOpen(s, ui.mapOpen, ui.calendarOpen)) return
      if (document.pointerLockElement !== el) el.requestPointerLock?.()
    }

    const onMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== el) return
      rig.yaw.current -= e.movementX * SENS
      rig.pitch.current = Math.min(MAX_PITCH, Math.max(MIN_PITCH, rig.pitch.current + e.movementY * SENS))
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const dir = Math.sign(e.deltaY)
      rig.distance.current = Math.min(8, Math.max(2.2, rig.distance.current + dir * 0.4))
    }

    el.addEventListener('click', onClick)
    window.addEventListener('mousemove', onMove)
    el.addEventListener('wheel', onWheel, { passive: false })

    const release = () => {
      if (document.pointerLockElement === el) document.exitPointerLock?.()
    }
    const unsub = useGame.subscribe((s) => {
      const ui = useWorldUi.getState()
      if (modalOpen(s, ui.mapOpen, ui.calendarOpen)) release()
    })
    const unsubUi = useWorldUi.subscribe((ui) => {
      if (ui.mapOpen || ui.calendarOpen) release()
    })

    return () => {
      el.removeEventListener('click', onClick)
      window.removeEventListener('mousemove', onMove)
      el.removeEventListener('wheel', onWheel)
      unsub()
      unsubUi()
    }
  }, [gl, rig])

  return null
}
