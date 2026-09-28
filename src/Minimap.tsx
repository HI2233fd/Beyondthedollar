import { useEffect, useRef } from 'react'
import { useGame } from './GameState'
import { BUILDINGS, POIS, WORLD } from './cityLayout'
import { useRig } from './rig'
import { useWorldUi } from './world/simStore'

const SIZE = 168

function toMap(x: number, z: number) {
  const nx = (x - WORLD.minX) / (WORLD.maxX - WORLD.minX)
  const nz = (z - WORLD.minZ) / (WORLD.maxZ - WORLD.minZ)
  return { left: nx * SIZE, top: nz * SIZE }
}

export function Minimap() {
  const rig = useRig()
  const scene = useGame((s) => s.scene)
  const tracked = useGame((s) => s.worldSim.trackedId)
  const setMap = useWorldUi((s) => s.setMap)
  const playerDot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const loop = () => {
      const g = rig.groupRef.current
      if (g && playerDot.current && scene === 'city') {
        const { left, top } = toMap(g.position.x, g.position.z)
        const yaw = g.rotation.y
        playerDot.current.style.transform = `translate(${left - 5}px, ${top - 5}px) rotate(${-yaw}rad)`
      }
      raf = requestAnimationFrame(loop)
      return
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [rig, scene])

  if (scene !== 'city') return null
  const dest = BUILDINGS.find((b) => b.id === tracked) ?? null
  const poi =
    tracked === 'garden'
      ? POIS.garden
      : tracked === 'stall'
        ? POIS.stall
        : tracked === 'fuel'
          ? POIS.fuel
          : POIS.buses.find((b) => b.id === tracked)

  return (
    <button type="button" className="minimap" onClick={() => setMap(true)} title="Open map">
      <div className="minimap-inner" style={{ width: SIZE, height: SIZE }}>
        {BUILDINGS.map((b) => {
          const { left, top } = toMap(b.x, b.z)
          return <div key={b.id} className="minimap-dot" style={{ left: left - 3, top: top - 3, background: b.signColor }} />
        })}
        {dest && (
          <div
            className="minimap-dest"
            style={{ left: toMap(dest.x, dest.z).left - 4, top: toMap(dest.x, dest.z).top - 4 }}
          />
        )}
        {poi && (
          <div className="minimap-dest" style={{ left: toMap(poi.x, poi.z).left - 4, top: toMap(poi.x, poi.z).top - 4 }} />
        )}
        <div ref={playerDot} className="minimap-player" />
      </div>
      <div className="minimap-label">Bellwether</div>
    </button>
  )
}
