import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { Humanoid } from '../../Humanoid'
import { useGame, type Dialogue, type SceneId } from '../../GameState'
import { useInteractable } from '../../InteractionSystem'
import { CAMPUS_NPCS, CITY_WORKERS, npcAt, type LivingNpcDef } from './schedule'
import { EXTRA_RESIDENTS } from '../../world/residents'

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
      const known = (relation?.talks ?? 0) > 1
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
      openDialogue({
        name: def.name,
        text: known
          ? `${def.name.split(' ')[0]} remembers you. ${line}`
          : `${def.traits ? `${def.traits} ` : ''}${line}`,
        options,
      })
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
    if (!g || !present || !target || useGame.getState().timeScale === 0) return
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
      <Humanoid shirt={def.shirt} pants={def.pants} hair={def.hair} skin={def.skin} walkRef={walk} movingRef={moving} anim={target.sit ? 'sit' : undefined} />
    </group>
  )
}

export function LivingCrowd() {
  const list = useMemo(() => [...CAMPUS_NPCS, ...CITY_WORKERS, ...EXTRA_RESIDENTS], [])

  return (
    <>
      {list.map((def) => (
        <ScheduledOne key={def.id} def={def} />
      ))}
    </>
  )
}
