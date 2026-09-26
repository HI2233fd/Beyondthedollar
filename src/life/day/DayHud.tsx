import { useMemo } from 'react'
import { useGame } from '../../GameState'
import { periodAt, businessOpen } from './schedule'

export function DayHud() {
  const characterCreated = useGame((s) => s.characterCreated)
  const totalMinutes = useGame((s) => s.totalMinutes)
  const dayLife = useGame((s) => s.dayLife)
  const scene = useGame((s) => s.scene)
  const driving = !!dayLife.drivingVehicleId

  const period = useMemo(() => periodAt(totalMinutes), [totalMinutes])
  const cafeOpen = businessOpen('cafe', totalMinutes)
  const schoolOpen = businessOpen('college', totalMinutes)

  if (!characterCreated) return null

  return (
    <div className="day-hud">
      <div className="day-hud-row">
        <span className="day-chip">{period.label}</span>
        {driving && <span className="day-chip day-chip-drive">Driving · E to park</span>}
      </div>
      <div className="day-meters">
        <label>
          Hunger
          <div className="day-bar">
            <div style={{ width: `${dayLife.hunger}%` }} />
          </div>
        </label>
        <label>
          Energy
          <div className="day-bar energy">
            <div style={{ width: `${dayLife.energy}%` }} />
          </div>
        </label>
      </div>
      <div className="day-hud-meta">
        {scene === 'college' && schoolOpen && <span>Campus open</span>}
        {scene === 'cafe' && <span>{cafeOpen ? 'Café open' : 'Café closed'}</span>}
        {dayLife.pantry.length > 0 && <span>Fridge {dayLife.pantry.length}</span>}
        {dayLife.vehicles.length > 0 && <span>Cars {dayLife.vehicles.length}</span>}
        {dayLife.classParticipation > 0 && <span>Class {dayLife.classParticipation}</span>}
      </div>
    </div>
  )
}
