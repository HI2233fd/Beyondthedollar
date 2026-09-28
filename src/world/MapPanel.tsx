import { useGame } from '../GameState'
import { stampFromMinutes } from '../simulation/time'
import { BUILDINGS, POIS, WORLD } from '../cityLayout'
import { allDestinations } from './nav'
import { useWorldUi } from './simStore'
import { openingLabel } from './hours'
import { useRig } from '../rig'

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
  if (!open) return null

  const track = (id: string) => {
    patchWorld({ trackedId: id })
    if (scene === 'city') setGuiding(true)
    else setGuiding(false)
  }

  const player = rig.groupRef.current?.position

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
          {BUILDINGS.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`map-pin ${tracked === b.id ? 'on' : ''}`}
              style={pinStyle(b.x, b.z)}
              onClick={() => track(b.id)}
              title={b.name}
            />
          ))}
          {POIS.buses.map((b) => (
            <span key={b.id} className="map-poi" style={pinStyle(b.x, b.z)} title={b.name} />
          ))}
          <span className="map-poi garden" style={pinStyle(POIS.garden.x, POIS.garden.z)} />
          <span className="map-poi stall" style={pinStyle(POIS.stall.x, POIS.stall.z)} />
          <span className="map-poi fuel" style={pinStyle(POIS.fuel.x, POIS.fuel.z)} />
          {player && scene === 'city' && <span className="map-you" style={pinStyle(player.x, player.z)} />}
          <span className="map-hood" style={{ left: '38%', top: '42%' }}>Oak Walk</span>
          <span className="map-hood" style={{ left: '38%', top: '18%' }}>North Campus</span>
          <span className="map-hood" style={{ left: '68%', top: '48%' }}>East Quarter</span>
          <span className="map-hood" style={{ left: '12%', top: '48%' }}>West Park</span>
        </div>
        <div className="map-list">
          {allDestinations().map((d) => {
            const building = BUILDINGS.find((b) => b.id === d.id)
            return (
              <article key={d.id} className="map-card">
                <strong>{d.name}</strong>
                <span>{d.neighborhood}</span>
                {building && <span>{openingLabel(building.id, minutes)}</span>}
                <div className="map-card-actions">
                  <button type="button" onClick={() => track(d.id)}>
                    Walk to entrance
                  </button>
                  <button type="button" onClick={() => track(d.id)}>
                    Track destination
                  </button>
                </div>
              </article>
            )
          })}
          <button type="button" onClick={() => { patchWorld({ trackedId: null }); setGuiding(false) }}>
            Stop tracking
          </button>
          <button type="button" onClick={() => track('parked-car')}>
            My parked car
          </button>
          <PersonFinder onTrack={track} />
          {guiding && tracked && <p>Walking to {labelFor(tracked)}. Press WASD to take control.</p>}
        </div>
      </div>
    </div>
  )
}

function PersonFinder({ onTrack }: { onTrack: (id: string) => void }) {
  const people = ['Jordan', 'Dev', 'Sam', 'Ms. Ortiz', 'Professor Ellis']
  return (
    <div className="map-people">
      <span>Find person</span>
      {people.map((name) => (
        <button key={name} type="button" onClick={() => onTrack(personPlace(name))}>
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

function pinStyle(x: number, z: number) {
  const left = ((x - WORLD.minX) / (WORLD.maxX - WORLD.minX)) * 100
  const top = ((z - WORLD.minZ) / (WORLD.maxZ - WORLD.minZ)) * 100
  return { left: `${left}%`, top: `${top}%` }
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
