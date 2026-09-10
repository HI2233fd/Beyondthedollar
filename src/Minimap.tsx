import { useEffect, useRef } from 'react'
import { useGame } from './GameState'
import { BUILDINGS, WORLD } from './cityLayout'
import { useRig } from './rig'

const SIZE = 150

// Map world (x,z) to minimap pixels.
function toMap(x: number, z: number) {
  const nx = (x - WORLD.minX) / (WORLD.maxX - WORLD.minX)
  const nz = (z - WORLD.minZ) / (WORLD.maxZ - WORLD.minZ)
  return { left: nx * SIZE, top: nz * SIZE }
}

const DOT_COLORS: Record<string, string> = {
  home: '#e8c07a',
  bank: '#7dd3fc',
  college: '#fca5a5',
  grocery: '#86efac',
  office: '#93c5fd',
}

export function Minimap() {
  const rig = useRig()
  const scene = useGame((s) => s.scene)
  const playerDot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const loop = () => {
      const g = rig.groupRef.current
      if (g && playerDot.current) {
        const { left, top } = toMap(g.position.x, g.position.z)
        playerDot.current.style.transform = `translate(${left - 5}px, ${top - 5}px)`
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [rig])

  return (
    <div className="minimap">
      <div className="minimap-inner" style={{ width: SIZE, height: SIZE }}>
        {/* road line */}
        <div className="minimap-road" style={{ top: toMap(0, 0).top - 3 }} />
        {BUILDINGS.map((b) => {
          const { left, top } = toMap(b.x, b.z)
          return (
            <div
              key={b.id}
              className="minimap-dot"
              title={b.name}
              style={{ left: left - 4, top: top - 4, background: DOT_COLORS[b.id] }}
            >
              <span className="minimap-tag">{b.name.replace('Merridian ', '').replace('FirstCity ', '').replace('FreshMart ', '').replace('Summit ', '')}</span>
            </div>
          )
        })}
        {scene === 'city' && <div ref={playerDot} className="minimap-player" />}
      </div>
      <div className="minimap-label">{scene === 'city' ? 'Merridian Block' : 'Indoors'}</div>
    </div>
  )
}
