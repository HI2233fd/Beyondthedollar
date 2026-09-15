import { Sky } from '@react-three/drei'
import { useGame } from '../GameState'
import { lightingForMinuteOfDay, stampFromMinutes } from './time'

/** City exterior lighting driven by the simulation clock (no geometry changes). */
export function CityLighting() {
  const totalMinutes = useGame((s) => s.totalMinutes)
  const { minuteOfDay } = stampFromMinutes(totalMinutes)
  const L = lightingForMinuteOfDay(minuteOfDay)

  return (
    <>
      <Sky
        sunPosition={L.sunPosition}
        turbidity={L.skyTurbidity}
        rayleigh={L.skyRayleigh}
      />
      <fog attach="fog" args={[L.fogColor, L.fogNear, L.fogFar]} />
      <hemisphereLight args={[L.hemiSky, L.hemiGround, L.hemiIntensity]} />
      <directionalLight
        position={L.sunPosition}
        intensity={L.sunIntensity}
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
