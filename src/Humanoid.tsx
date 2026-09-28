import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { normalizeAppearance, type CharacterLook } from './life/characterLook'
import { createActor, type ReferenceActor } from './reference/actors.js'
import { LegacyHumanoid } from './LegacyHumanoid'

interface HumanoidProps {
 look?: Partial<CharacterLook>
 skin?: string
 shirt?: string
 pants?: string
 hair?: string
 face?: CharacterLook['face']
 walkRef?: MutableRefObject<number>
 movingRef?: MutableRefObject<boolean>
 anim?: 'idle' | 'walk' | 'talk' | 'phone'
}

/** Reference character visuals using the main game's existing controls and save schema. */
export function Humanoid(props: HumanoidProps) {
  const { look: raw, skin, shirt, pants, hair, face, movingRef, anim = 'idle' } = props
 const look = normalizeAppearance({ ...raw, skin: raw?.skin ?? skin, shirt: raw?.shirt ?? shirt, pants: raw?.pants ?? pants, hair: raw?.hair ?? hair, face: raw?.face ?? face })
 const host = useRef<Group>(null)
 const actor = useRef<ReferenceActor | null>(null)
 const [ready, setReady] = useState(false)
 const hairstyle = { short: 'buzz', fade: 'buzz', medium: 'parted', long: 'long', bun: 'buns' }[look.hairStyle]
 const skinColor = look.skin, shirtColor = look.shirt, pantsColor = look.pants, shoeColor = look.shoes, hairColor = look.hair
 // Keep the original renderer for appearance options the reference models cannot represent.
  const legacyRequired = look.accessory !== 'none' || !!look.jacket || look.eyeColor !== '#2c1810' || look.brow !== 'soft' || look.face !== 'soft'
 useEffect(() => {
  if (legacyRequired) return
  let canceled = false
  let owned: ReferenceActor | null = null
  setReady(false)
  createActor({ body: look.baseModel, hairstyle, skin: skinColor, shirt: shirtColor, pants: pantsColor, shoes: shoeColor, hair: hairColor }).then(next => {
   if (canceled) { next.dispose(); return }
   owned = next; actor.current = next; host.current?.add(next.root); setReady(true)
  }).catch(error => console.warn('Reference character unavailable; using original character.', error))
  return () => { canceled = true; if (owned) { owned.root.removeFromParent(); owned.dispose() }; actor.current = null }
 }, [look.baseModel, hairstyle, skinColor, shirtColor, pantsColor, shoeColor, hairColor, legacyRequired])
 useFrame((_, dt) => {
  const current = actor.current
  if (!current) return
  const moving = movingRef ? movingRef.current : anim === 'walk'
  current.setAction(moving ? 'walk' : anim === 'phone' ? 'interact' : anim)
  current.update(Math.min(dt, .05))
 })
 const scale: [number, number, number] = look.body === 'slim' ? [.92, 1.02, .92] : look.body === 'athletic' ? [1.08, 1.02, 1.06] : look.body === 'plus' ? [1.12, .98, 1.1] : [1, 1, 1]
 return <group><group ref={host} scale={scale} visible={!legacyRequired && ready} dispose={null} />{(legacyRequired || !ready) && <LegacyHumanoid {...props} />}</group>
}
