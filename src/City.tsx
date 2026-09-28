import { useEffect, useMemo } from 'react'
import { Text } from '@react-three/drei'
import { Building } from './Buildings/Building'
import { Streetlight, Tree, Bench, Planter } from './props'
import { BACKGROUND, BUILDINGS, POIS, ROAD_HALF, ROADS_EW, ROADS_NS, WORLD, cityCollision } from './cityLayout'
import { setActiveBoxes } from './world'
import { useGame } from './GameState'
import { dayPhase, stampFromMinutes } from './simulation/time'
import { DowntownDistrict } from './life/DowntownDistrict'
import { DowntownTeaser } from './life/DowntownTeaser'
import { useInteractable } from './InteractionSystem'
import { OutdoorLife } from './world/Outdoor'
import { Traffic } from './world/Traffic'

function HelpWanted() {
  useInteractable({
    id: 'bean-board',
    scene: 'city',
    position: [-13, 0, -6],
    radius: 2.2,
    prompt: 'Read the café hiring note',
    onInteract: () => {
      const s = useGame.getState()
      const app = s.lifeFacts.apps.bean
      if (s.hasJob && s.lifeFacts.employerId === 'bean') {
        s.enterScene('cafe', { pos: [0, 0, 3.2], yaw: Math.PI })
        return
      }
      if (app?.status === 'scheduled') {
        const err = s.play({ type: 'open', activity: { kind: 'interview', employerId: 'bean' } })
        if (err) s.openDialogue({ name: 'Corner Café', text: err, options: [{ label: 'OK', close: true }] })
        return
      }
      s.play({ type: 'open', activity: { kind: 'posting', employerId: 'bean' } })
    },
  })
  return (
    <group position={[-13, 0, -6]}>
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[0.12, 2.2, 0.12]} />
        <meshStandardMaterial color="#44403c" />
      </mesh>
      <mesh position={[0, 2.1, 0.08]}>
        <boxGeometry args={[1.4, 0.8, 0.06]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>
    </group>
  )
}

function RoadGrid() {
  const worldW = WORLD.maxX - WORLD.minX
  const worldD = WORLD.maxZ - WORLD.minZ
  const dashes = useMemo(() => {
    const ew: { x: number; z: number }[] = []
    const ns: { x: number; z: number }[] = []
    for (const z of ROADS_EW) {
      for (let x = WORLD.minX + 4; x < WORLD.maxX; x += 6) ew.push({ x, z })
    }
    for (const x of ROADS_NS) {
      for (let z = WORLD.minZ + 4; z < WORLD.maxZ; z += 6) ns.push({ x, z })
    }
    return { ew, ns }
  }, [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[worldW + 8, worldD + 8]} />
        <meshStandardMaterial color="#3f5e3a" />
      </mesh>
      {ROADS_EW.map((z) => (
        <group key={`ew${z}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, z]} receiveShadow>
            <planeGeometry args={[worldW, ROAD_HALF * 2]} />
            <meshStandardMaterial color="#2a2d33" />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z + s * (ROAD_HALF + 1.6)]}>
              <planeGeometry args={[worldW, 2.4]} />
              <meshStandardMaterial color="#b6bcc4" />
            </mesh>
          ))}
        </group>
      ))}
      {ROADS_NS.map((x) => (
        <group key={`ns${x}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.003, 0]} receiveShadow>
            <planeGeometry args={[ROAD_HALF * 2, worldD]} />
            <meshStandardMaterial color="#2a2d33" />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[x + s * (ROAD_HALF + 1.6), 0.012, 0]}>
              <planeGeometry args={[2.4, worldD]} />
              <meshStandardMaterial color="#b6bcc4" />
            </mesh>
          ))}
        </group>
      ))}
      {dashes.ew.map((d, i) => (
        <mesh key={`d${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[d.x, 0.02, d.z]}>
          <planeGeometry args={[2, 0.15]} />
          <meshStandardMaterial color="#e9d27a" />
        </mesh>
      ))}
      {dashes.ns.map((d, i) => (
        <mesh key={`n${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[d.x, 0.021, d.z]}>
          <planeGeometry args={[0.15, 2]} />
          <meshStandardMaterial color="#e9d27a" />
        </mesh>
      ))}
      {ROADS_EW.flatMap((z) =>
        ROADS_NS.map((x) => (
          <group key={`x${x}-${z}`}>
            {[-1.1, -0.4, 0.4, 1.1].map((o) => (
              <mesh key={o} rotation={[-Math.PI / 2, 0, 0]} position={[x + o, 0.025, z]}>
                <planeGeometry args={[0.35, ROAD_HALF * 2]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
            ))}
          </group>
        )),
      )}
    </group>
  )
}

function StreetDressing() {
  const props = useMemo(() => {
    const lights: { x: number; z: number }[] = []
    const trees: { x: number; z: number }[] = []
    const benches: { x: number; z: number }[] = []
    for (const z of ROADS_EW) {
      for (let x = WORLD.minX + 12; x < WORLD.maxX; x += 22) {
        lights.push({ x, z: z + ROAD_HALF + 2.8 })
        trees.push({ x: x + 6, z: z - ROAD_HALF - 3.2 })
        benches.push({ x: x + 3, z: z + ROAD_HALF + 2.6 })
      }
    }
    return { lights, trees, benches }
  }, [])
  const totalMinutes = useGame((s) => s.totalMinutes)
  const night = dayPhase(stampFromMinutes(totalMinutes).minuteOfDay) !== 'day'
  return (
    <group>
      {props.lights.map((l, i) => (
        <Streetlight key={`l${i}`} position={[l.x, 0, l.z]} night={night} />
      ))}
      {props.trees.map((t, i) => (
        <Tree key={`t${i}`} position={[t.x, 0, t.z]} />
      ))}
      {props.benches.map((b, i) => (
        <Bench key={`b${i}`} position={[b.x, 0, b.z]} />
      ))}
      <Planter position={[POIS.fountain.x + 3, 0, POIS.fountain.z]} />
      <Planter position={[POIS.fountain.x - 3, 0, POIS.fountain.z]} />
      <Text position={[-28, 3.2, 8]} fontSize={0.45} color="#ecfccb" anchorX="center" rotation={[-0.2, 0.4, 0]}>
        OAK WALK
      </Text>
      <Text position={[0, 4, -58]} fontSize={0.45} color="#e0f2fe" anchorX="center">
        NORTH CAMPUS
      </Text>
      <Text position={[62, 3.4, 8]} fontSize={0.45} color="#ffedd5" anchorX="center">
        EAST QUARTER
      </Text>
      <Text position={[-62, 3.4, 8]} fontSize={0.45} color="#dcfce7" anchorX="center">
        WEST PARK
      </Text>
    </group>
  )
}

function BackgroundBlocks() {
  return (
    <group>
      {BACKGROUND.map((b) => (
        <group key={b.id} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.h / 2, 0]} castShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={b.color} />
          </mesh>
          <mesh position={[0, b.h * 0.55, b.d / 2 + 0.02]}>
            <planeGeometry args={[b.w * 0.7, b.h * 0.45]} />
            <meshStandardMaterial color={b.accent} emissive="#93c5fd" emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[0, b.h + 0.2, 0]}>
            <boxGeometry args={[b.w + 0.4, 0.35, b.d + 0.4]} />
            <meshStandardMaterial color={b.accent} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function City() {
  useEffect(() => {
    setActiveBoxes(cityCollision())
  }, [])

  return (
    <group>
      <RoadGrid />
      <StreetDressing />
      {BUILDINGS.map((b) => (
        <Building key={b.id} def={b} />
      ))}
      <BackgroundBlocks />
      <OutdoorLife />
      <Traffic />
      <HelpWanted />
      <DowntownDistrict />
      <DowntownTeaser />
    </group>
  )
}
