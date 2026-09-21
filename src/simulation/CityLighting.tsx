import { Sky } from '@react-three/drei'
import { useGame } from '../GameState'
import { lightingForMinuteOfDay, stampFromMinutes } from './time'

/** City exterior lighting driven by the simulation clock + season tint. */
export function CityLighting() {
  const totalMinutes = useGame((s) => s.totalMinutes)
  const season = useGame((s) => s.season)
  const { minuteOfDay } = stampFromMinutes(totalMinutes)
  const L = lightingForMinuteOfDay(minuteOfDay)

  const seasonFog =
    season === 'winter' ? '#c5d4e8' : season === 'fall' ? '#d4b896' : season === 'spring' ? '#b7d4c2' : L.fogColor
  const hemiBoost = season === 'summer' ? 1.08 : season === 'winter' ? 0.88 : 1

  return (
    <>
      <Sky
        sunPosition={L.sunPosition}
        turbidity={season === 'fall' ? L.skyTurbidity + 1.2 : L.skyTurbidity}
        rayleigh={L.skyRayleigh}
      />
      <fog attach="fog" args={[seasonFog, L.fogNear, L.fogFar + (season === 'winter' ? 8 : 0)]} />
      <hemisphereLight args={[L.hemiSky, L.hemiGround, L.hemiIntensity * hemiBoost]} />
      <directionalLight
        position={L.sunPosition}
        intensity={L.sunIntensity * (season === 'winter' ? 0.85 : 1)}
        castShadow={L.phase !== 'night'}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-far={140}
      />
      {L.ambientBoost > 0 && <ambientLight intensity={L.ambientBoost} />}
      {L.phase === 'night' && (
        <pointLight position={[0, 8, 0]} intensity={0.55} distance={55} color="#9eb6ff" />
      )}
    </>
  )
}
