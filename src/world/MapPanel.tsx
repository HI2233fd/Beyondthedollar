import { useMemo, useRef, useState } from 'react'
import { useGame } from '../GameState'
import { stampFromMinutes } from '../simulation/time'
import { BUILDINGS, WORLD } from '../cityLayout'
import { allDestinations } from './nav'
import { useWorldUi } from './simStore'
import { openingLabel } from './hours'
import { useRig } from '../rig'
import { MapCanvas } from './CityMapView'

function placeCategory(id: string) {
  if (id === 'home' || id === 'apartments' || id === 'townhouse') return 'home'
  if (id === 'bank') return 'money'
  if (id === 'grocery' || id === 'cafe' || id === 'kitchen') return 'food'
  if (id === 'high' || id === 'college') return 'learn'
  if (id === 'clinic') return 'health'
  if (id === 'motors' || id === 'fuel' || id.startsWith('bus')) return 'transit'
  return 'work'
}

export function MapPanel() {
  const open = useWorldUi((s) => s.mapOpen)
  const setMap = useWorldUi((s) => s.setMap)
  const guiding = useWorldUi((s) => s.guiding)
  const setGuiding = useWorldUi((s) => s.setGuiding)
  const tracked = useGame((s) => s.worldSim.trackedId)
  const patchWorld = useGame((s) => s.patchWorld)
  const minutes = useGame((s) => s.totalMinutes)
  const scene = useGame((s) => s.scene)
  const rig = useRig()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const view = useRef({ minX: WORLD.minX, maxX: WORLD.maxX, minZ: WORLD.minZ, maxZ: WORLD.maxZ })
  const drag = useRef<{ x: number; y: number; minX: number; maxX: number; minZ: number; maxZ: number } | null>(null)
  const places = useMemo(() => allDestinations(), [])
  if (!open) return null

  const track = (id: string, walk: boolean) => {
    patchWorld({ trackedId: id })
    setGuiding(walk && scene === 'city')
  }

  const zoom = (factor: number) => {
    const v = view.current
    const cx = (v.minX + v.maxX) / 2
    const cz = (v.minZ + v.maxZ) / 2
    const hx = ((v.maxX - v.minX) * factor) / 2
    const hz = ((v.maxZ - v.minZ) * factor) / 2
    view.current = { minX: cx - hx, maxX: cx + hx, minZ: cz - hz, maxZ: cz + hz }
  }
  const center = () => {
    const g = rig.groupRef.current
    if (!g) return
    view.current = { minX: g.position.x - 40, maxX: g.position.x + 40, minZ: g.position.z - 40, maxZ: g.position.z + 40 }
  }

  const shown = places.filter((d) => {
    const cat = placeCategory(d.id)
    if (filter !== 'all' && cat !== filter) return false
    return d.name.toLowerCase().includes(query.toLowerCase())
  })

  return (
    <div className="map-panel">
      <header className="map-head">
        <h2>Explore Bellwether</h2>
        <button type="button" onClick={() => setMap(false)}>
          Close
        </button>
      </header>
      <div className="map-layout">
        <div className="map-canvas">
          <div className="map-tools">
            <button type="button" onClick={() => zoom(0.8)}>Zoom in</button>
            <button type="button" onClick={() => zoom(1.25)}>Zoom out</button>
            <button type="button" onClick={center}>Center on me</button>
            <button type="button" onClick={() => { view.current = { minX: WORLD.minX, maxX: WORLD.maxX, minZ: WORLD.minZ, maxZ: WORLD.maxZ } }}>Whole city</button>
          </div>
          <div
            className="map-drag"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              drag.current = { x: e.clientX, y: e.clientY, ...view.current }
            }}
            onPointerMove={(e) => {
              const d = drag.current
              if (!d) return
              const rect = e.currentTarget.getBoundingClientRect()
              const dx = (e.clientX - d.x) / Math.max(1, rect.width)
              const dy = (e.clientY - d.y) / Math.max(1, rect.height)
              const w = d.maxX - d.minX
              const h = d.maxZ - d.minZ
              view.current = { minX: d.minX - dx * w, maxX: d.maxX - dx * w, minZ: d.minZ - dy * h, maxZ: d.maxZ - dy * h }
            }}
            onPointerUp={() => { drag.current = null }}
          >
            <MapCanvas
              read={() => {
                const g = rig.groupRef.current
                const dest = places.find((d) => d.id === useGame.getState().worldSim.trackedId)
                return {
                  px: g?.position.x ?? 0,
                  pz: g?.position.z ?? 0,
                  yaw: g?.rotation.y ?? 0,
                  destX: dest?.x,
                  destZ: dest?.z,
                  driving: !!useGame.getState().dayLife.drivingVehicleId,
                  view: view.current,
                }
              }}
              labels
              windowed={false}
              minutes={minutes}
              filter={filter}
              className="map-real"
            />
          </div>
          <p className="map-legend">Cyan arrow: you, facing travel. Amber pin: destination. Cyan line: route. White mark: door. Gray footprint: closed.</p>
        </div>
        <div className="map-list">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search locations" aria-label="Search locations" />
          <div className="map-filters">
            {['all', 'home', 'money', 'food', 'learn', 'work', 'health', 'transit'].map((id) => (
              <button key={id} type="button" className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>{id}</button>
            ))}
          </div>
          {shown.map((d) => {
            const building = BUILDINGS.find((b) => b.id === d.id)
            return (
              <article key={d.id} className="map-card">
                <strong>{d.name}</strong>
                <span>{d.neighborhood}</span>
                {building && <span>{openingLabel(building.id, minutes)}</span>}
                <div className="map-card-actions">
                  <button type="button" onClick={() => track(d.id, true)}>
                    Walk to entrance
                  </button>
                  <button type="button" onClick={() => track(d.id, false)}>
                    Track destination
                  </button>
                </div>
              </article>
            )
          })}
          <button type="button" onClick={() => { patchWorld({ trackedId: null }); setGuiding(false) }}>
            Clear route
          </button>
          <button type="button" onClick={() => track('parked-car', true)}>
            My parked car
          </button>
          <PersonFinder onTrack={track} />
          {guiding && tracked && <p>Walking to {labelFor(tracked)}. Press WASD to take control.</p>}
        </div>
      </div>
    </div>
  )
}

function PersonFinder({ onTrack }: { onTrack: (id: string, walk: boolean) => void }) {
  const people = ['Jordan', 'Dev', 'Sam', 'Ms. Ortiz', 'Professor Ellis']
  return (
    <div className="map-people">
      <span>Find person</span>
      {people.map((name) => (
        <button key={name} type="button" onClick={() => onTrack(personPlace(name), true)}>
          {name}
        </button>
      ))}
    </div>
  )
}

function personPlace(name: string) {
  if (name === 'Dev' || name === 'Sam') return 'cafe'
  if (name === 'Ms. Ortiz') return 'high'
  if (name === 'Professor Ellis') return 'college'
  return 'bank'
}

function labelFor(id: string) {
  return allDestinations().find((d) => d.id === id)?.name ?? id
}

export function GuideBanner() {
  const guiding = useWorldUi((s) => s.guiding)
  const message = useWorldUi((s) => s.guideMessage)
  const tracked = useGame((s) => s.worldSim.trackedId)
  if (message) return <div className="guide-banner">{message}</div>
  if (!guiding || !tracked) return null
  return <div className="guide-banner">Walking to {labelFor(tracked)}. Press WASD to take control.</div>
}

export function CalendarPanel() {
  const open = useWorldUi((s) => s.calendarOpen)
  const setCalendar = useWorldUi((s) => s.setCalendar)
  const minutes = useGame((s) => s.totalMinutes)
  const bills = useGame((s) => s.recurringBills)
  if (!open) return null
  const stamp = stampFromMinutes(minutes)
  return (
    <div className="calendar-panel">
      <header>
        <h2>Calendar</h2>
        <button type="button" onClick={() => setCalendar(false)}>Close</button>
      </header>
      <p>
        {stamp.weekday} {stamp.month}/{stamp.dayOfMonth} · {stamp.clockLabel}
      </p>
      <ul>
        {bills.map((b) => (
          <li key={b.id}>
            {b.label} · ${b.amount}
          </li>
        ))}
      </ul>
    </div>
  )
}
