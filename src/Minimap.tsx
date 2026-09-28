import { useEffect, useRef, useState } from 'react'
import { useGame } from './GameState'
import { BUILDINGS } from './cityLayout'
import { useRig } from './rig'
import { useWorldUi } from './world/simStore'
import { MapCanvas, type MapViewState } from './world/CityMapView'
import { destinationPoint } from './world/nav'
import { listInteractables } from './InteractionSystem'

export function Minimap() {
  const rig = useRig()
  const scene = useGame((s) => s.scene)
  const tracked = useGame((s) => s.worldSim.trackedId)
  const driving = useGame((s) => !!s.dayLife.drivingVehicleId)
  const setMap = useWorldUi((s) => s.setMap)
  const view = useRef<MapViewState>({ px: 0, pz: 22, yaw: Math.PI, driving: false })
  const [dist, setDist] = useState<number | null>(null)

  useEffect(() => {
    let raf = 0
    let last = 0
    const loop = () => {
      const g = rig.groupRef.current
      if (g) {
        const dest = scene === 'city' ? destinationPoint(tracked) : null
        view.current = {
          px: g.position.x,
          pz: g.position.z,
          yaw: g.rotation.y,
          destX: dest?.x,
          destZ: dest?.z,
          driving,
        }
        const now = performance.now()
        if (now - last > 200) {
          last = now
          setDist(dest ? Math.round(Math.hypot(dest.x - g.position.x, dest.z - g.position.z)) : null)
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [rig, scene, tracked, driving])

  const dest = destinationPoint(tracked)
  const building = BUILDINGS.find((b) => b.scene === scene)

  return (
    <button type="button" className="minimap" onClick={() => setMap(true)} title="Open map">
      {scene === 'city' ? (
        <MapCanvas read={() => view.current} labels={false} windowed minutes={0} filter="all" className="minimap-canvas" />
      ) : (
        <IndoorPlan />
      )}
      <div className="minimap-label">
        {scene === 'city'
          ? dest
            ? `${dest.name} · ${dist ?? '—'} m`
            : 'Bellwether'
          : `${building?.name ?? 'Interior'} · floor`}
      </div>
    </button>
  )
}

function IndoorPlan() {
  const scene = useGame((s) => s.scene)
  const rig = useRig()
  const [mark, setMark] = useState({ x: 84, y: 84, yaw: 0 })
  const stations = listInteractables(scene).filter((i) => !i.id.startsWith('exit'))
  const exit = listInteractables(scene).find((i) => i.id.startsWith('exit'))

  useEffect(() => {
    let raf = 0
    const loop = () => {
      const g = rig.groupRef.current
      if (g) {
        setMark({
          x: 84 + g.position.x * 6,
          y: 84 + g.position.z * 6,
          yaw: g.rotation.y,
        })
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [rig])

  return (
    <div className="indoor-plan" aria-label="Floor plan">
      <span className="indoor-exit" style={{ left: exit ? 84 + exit.position[0] * 6 : 84, top: exit ? 84 + exit.position[2] * 6 : 150 }}>
        Exit
      </span>
      {stations.slice(0, 8).map((s) => (
        <span key={s.id} className="indoor-station" style={{ left: 84 + s.position[0] * 6, top: 84 + s.position[2] * 6 }} title={s.prompt} />
      ))}
      <span className="indoor-you" style={{ left: mark.x, top: mark.y, transform: `translate(-50%, -50%) rotate(${mark.yaw}rad)` }} />
    </div>
  )
}
