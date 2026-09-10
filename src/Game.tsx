import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import type { Group } from 'three'
import { RigContext, type PlayerRig } from './rig'
import { Player } from './Player'
import { ThirdPersonCamera } from './ThirdPersonCamera'
import { PointerLook } from './PointerLook'
import { City } from './City'
import { BankInterior } from './Interiors/BankInterior'
import { GroceryInterior } from './Interiors/GroceryInterior'
import { CollegeInterior } from './Interiors/CollegeInterior'
import { OfficeInterior } from './Interiors/OfficeInterior'
import { GameHUD } from './GameHUD'
import { Minimap } from './Minimap'
import { DialogueSystem } from './DialogueSystem'
import { InteractionPrompt } from './InteractionSystem'
import { LifeEventSystem } from './LifeEventSystem'
import { useGame } from './GameState'
import { initControls } from './keyboard'
import { CITY_START } from './cityLayout'

function SceneContent() {
  const scene = useGame((s) => s.scene)
  return (
    <>
      {scene === 'city' && <City />}
      {scene === 'bank' && <BankInterior />}
      {scene === 'grocery' && <GroceryInterior />}
      {scene === 'college' && <CollegeInterior />}
      {scene === 'office' && <OfficeInterior />}
    </>
  )
}

function CartPanel() {
  const scene = useGame((s) => s.scene)
  const cart = useGame((s) => s.cart)
  if (scene !== 'grocery' || cart.length === 0) return null

  const grouped = new Map<string, { name: string; price: number; qty: number }>()
  for (const c of cart) {
    const g = grouped.get(c.id)
    if (g) g.qty += 1
    else grouped.set(c.id, { name: c.name, price: c.price, qty: 1 })
  }
  const total = cart.reduce((a, i) => a + i.price, 0)

  return (
    <div className="cart-panel">
      <div className="cart-title">🛒 Cart</div>
      {[...grouped.values()].map((g) => (
        <div key={g.name} className="cart-row">
          <span>{g.name} ×{g.qty}</span>
          <span>${(g.price * g.qty).toFixed(2)}</span>
        </div>
      ))}
      <div className="cart-total">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <div className="cart-hint">Go to CHECKOUT to pay</div>
    </div>
  )
}

export function Game() {
  const groupRef = useRef<Group>(null)
  const rig: PlayerRig = useMemo(
    () => ({
      groupRef,
      yaw: { current: Math.PI },
      pitch: { current: 0.45 },
      walk: { current: 0 },
      moving: { current: false },
    }),
    [],
  )

  const scene = useGame((s) => s.scene)
  const transitioning = useGame((s) => s.transitioning)
  const dialogue = useGame((s) => s.dialogue)
  const lifeActive = useGame((s) => s.lifeEventActive)
  const outcome = useGame((s) => s.lifeEventOutcome)
  const finishTransition = useGame((s) => s.finishTransition)

  const [fade, setFade] = useState(false)
  const [locked, setLocked] = useState(false)

  // init keyboard + initial spawn
  useEffect(() => {
    initControls()
    useGame.setState({ spawn: CITY_START, scene: 'city' })
  }, [])

  // fade + finish transition on scene change
  useEffect(() => {
    setFade(true)
    const raf = requestAnimationFrame(() => setFade(false))
    const t = setTimeout(() => finishTransition(), 350)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
    }
  }, [scene, finishTransition])

  // track pointer lock for the hint
  useEffect(() => {
    const onChange = () => setLocked(!!document.pointerLockElement)
    document.addEventListener('pointerlockchange', onChange)
    return () => document.removeEventListener('pointerlockchange', onChange)
  }, [])

  const modalOpen = !!dialogue || lifeActive || !!outcome
  const showHint = !locked && !modalOpen

  return (
    <RigContext.Provider value={rig}>
      <div className="game-root">
        <Canvas shadows camera={{ position: [-2, 4, 16], fov: 55 }} dpr={[1, 1.5]}>
          {scene === 'city' ? (
            <>
              <Sky sunPosition={[40, 25, 20]} turbidity={6} rayleigh={1.2} />
              <fog attach="fog" args={['#cdd8e6', 45, 120]} />
              <hemisphereLight args={['#dce8ff', '#4a5a44', 0.7]} />
              <directionalLight
                position={[30, 40, 20]}
                intensity={2.1}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-left={-60}
                shadow-camera-right={60}
                shadow-camera-top={60}
                shadow-camera-bottom={-60}
                shadow-camera-far={140}
              />
            </>
          ) : (
            <>
              <color attach="background" args={['#0b0f16']} />
              <hemisphereLight args={['#ffffff', '#444444', 0.5]} />
            </>
          )}

          <SceneContent />
          <Player />
          <ThirdPersonCamera />
          <PointerLook />
        </Canvas>

        {/* Overlays */}
        <GameHUD />
        <Minimap />
        <InteractionPrompt />
        <CartPanel />
        <DialogueSystem />
        <LifeEventSystem />

        {showHint && (
          <div className="controls-hint">
            <strong>Click</strong> to look around · <strong>WASD</strong> move · <strong>E</strong> interact · <strong>ESC</strong> release/close
          </div>
        )}

        <div className={`fade-overlay ${fade || transitioning ? 'show' : ''}`} />
      </div>
    </RigContext.Provider>
  )
}
