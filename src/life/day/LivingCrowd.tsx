import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import type { Group } from 'three'
import { Humanoid } from '../../Humanoid'
import { useGame, type Dialogue, type SceneId } from '../../GameState'
import { useInteractable } from '../../InteractionSystem'
import { CAMPUS_NPCS, CITY_WORKERS, npcAt, type LivingNpcDef } from './schedule'

function ScheduledOne({ def }: { def: LivingNpcDef }) {
  const totalMinutes = useGame((s) => s.totalMinutes)
  const scene = useGame((s) => s.scene)
  const openDialogue = useGame((s) => s.openDialogue)
  const talkToNpc = useGame((s) => s.talkToNpc)
  const dayAct = useGame((s) => s.dayAct)
  const relation = useGame((s) => s.relationships[def.id])
  const group = useRef<Group>(null)
  const walk = useRef(0)
  const moving = useRef(false)
  const target = useMemo(() => npcAt(def, totalMinutes), [def, totalMinutes])
  const present = !!target && target.scene === scene
  const px = present && target ? target.x : 9999
  const pz = present && target ? target.z : 9999

  useInteractable({
    id: `live-${def.id}`,
    scene: scene as SceneId,
    position: [px, 0, pz],
    radius: present ? 2.4 : 0.1,
    prompt: relation?.met ? `Talk to ${def.name}` : `Meet ${def.name}`,
    onInteract: () => {
      if (!present || !target) return
      const line = def.chatter[Math.floor(Math.random() * def.chatter.length)] ?? 'Hey.'
      const options: Dialogue['options'] = [{ label: 'Later', close: true }]
      if (def.opportunityHint) {
        options.unshift({
          label: 'Tell me more',
          next: {
            name: def.name,
            text: def.opportunityHint,
            options: [{ label: 'Thanks', close: true }],
          },
        })
      }
      if (def.role === 'friend') {
        options.unshift({
          label: 'Want to hang later?',
          action: () => dayAct({ type: 'meet-friend', id: def.id }),
          next: {
            name: def.name,
            text: 'Yeah — text me after dismissal. I will be around FreshMart or the café.',
            options: [{ label: 'Cool', close: true }],
          },
        })
      }
      talkToNpc(def.id, def.name, `Saw ${def.name} during the day`)
      dayAct({ type: 'meet-friend', id: def.id })
      openDialogue({ name: def.name, text: line, options })
    },
  })

  useEffect(() => {
    const g = group.current
    if (!g || !present || !target) return
    g.position.set(target.x, 0, target.z)
    if (target.yaw != null) g.rotation.y = target.yaw
  }, [present, target, scene])

  useFrame((_, dt) => {
    const g = group.current
    if (!g || !present || !target) return
    const dx = target.x - g.position.x
    const dz = target.z - g.position.z
    const dist = Math.hypot(dx, dz)
    if (dist > 0.08) {
      moving.current = true
      const step = Math.min(dist, 2.8 * dt)
      g.position.x += (dx / dist) * step
      g.position.z += (dz / dist) * step
      g.rotation.y = Math.atan2(dx, dz)
      walk.current += dt * 9
    } else {
      moving.current = false
      if (target.yaw != null) g.rotation.y = target.yaw
    }
  })

  if (!present || !target) return null

  return (
    <group ref={group} position={[target.x, 0, target.z]}>
      <Humanoid shirt={def.shirt} pants={def.pants} hair={def.hair} skin={def.skin} walkRef={walk} movingRef={moving} />
      <Billboard position={[0, 2.3, 0]}>
        <Text fontSize={0.26} color="#fff" anchorX="center" outlineWidth={0.01} outlineColor="#0b0f19">
          {def.name}
        </Text>
      </Billboard>
    </group>
  )
}

export function LivingCrowd() {
  const scene = useGame((s) => s.scene)
  const list = useMemo(() => {
    if (scene === 'college') return CAMPUS_NPCS
    if (scene === 'cafe') return CITY_WORKERS
    if (scene === 'city') return [...CAMPUS_NPCS.filter((n) => n.role === 'friend' || n.role === 'student'), ...CITY_WORKERS]
    return []
  }, [scene])

  return (
    <>
      {list.map((def) => (
        <ScheduledOne key={def.id} def={def} />
      ))}
    </>
  )
}
