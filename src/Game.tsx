import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
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
import { HomeInterior } from './Interiors/HomeInterior'
import { GameHUD } from './GameHUD'
import { Minimap } from './Minimap'
import { DialogueSystem } from './DialogueSystem'
import { InteractionPrompt } from './InteractionSystem'
import { LifeEventSystem } from './LifeEventSystem'
import { LessonPanel } from './LessonPanel'
import { QuizPanel } from './QuizPanel'
import { CurriculumHUD } from './CurriculumHUD'
import { CityLighting } from './simulation/CityLighting'
import { TimeSystem } from './simulation/TimeSystem'
import { ScenarioPanel } from './simulation/ScenarioPanel'
import { InvestingPanel } from './simulation/InvestingPanel'
import { PhonePanel } from './simulation/PhonePanel'
import { CharacterCreation } from './life/CharacterCreation'
import { MissionTracker } from './life/MissionTracker'
import { LifeLoop } from './life/LifeLoop'
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
      {scene === 'home' && <HomeInterior />}
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
      <div className="cart-title">Your Cart</div>
      {[...grouped.values()].map((g) => (
        <div key={g.name} className="cart-row">
          <span>
            {g.name} ×{g.qty}
          </span>
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

  const characterCreated = useGame((s) => s.characterCreated)
  const scene = useGame((s) => s.scene)
  const transitioning = useGame((s) => s.transitioning)
  const dialogue = useGame((s) => s.dialogue)
  const lifeActive = useGame((s) => s.lifeEventActive)
  const outcome = useGame((s) => s.lifeEventOutcome)
  const lessonOpen = useGame((s) => s.activeLessonId)
  const quizOpen = useGame((s) => s.activeQuizId)
  const scenarioOpen = useGame((s) => s.activeScenarioId)
  const investingOpen = useGame((s) => s.investingPanelOpen)
  const phoneOpen = useGame((s) => s.phoneOpen)
  const finishTransition = useGame((s) => s.finishTransition)

  const [fade, setFade] = useState(false)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    initControls()
    window.__useGame = useGame
    const s = useGame.getState()
    if (!s.characterCreated && !s.spawn) {
      useGame.setState({ spawn: CITY_START, scene: 'city' })
    }
  }, [])

  useEffect(() => {
    setFade(true)
    const raf = requestAnimationFrame(() => setFade(false))
    const t = setTimeout(() => finishTransition(), 350)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
    }
  }, [scene, finishTransition])

  useEffect(() => {
    const onChange = () => setLocked(!!document.pointerLockElement)
    document.addEventListener('pointerlockchange', onChange)
    return () => document.removeEventListener('pointerlockchange', onChange)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyP' && e.code !== 'KeyM') return
      if (!useGame.getState().characterCreated) return
      const s = useGame.getState()
      if (s.phoneOpen) s.closePhone()
      else s.openPhone()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const modalOpen =
    !!dialogue ||
    lifeActive ||
    !!outcome ||
    !!lessonOpen ||
    !!quizOpen ||
    !!scenarioOpen ||
    investingOpen ||
    phoneOpen ||
    !characterCreated
  const showHint = characterCreated && !locked && !modalOpen

  return (
    <RigContext.Provider value={rig}>
      <div className="game-root">
        <Canvas shadows camera={{ position: [-2, 4, 16], fov: 55 }} dpr={[1, 1.5]}>
          {scene === 'city' ? (
            <CityLighting />
          ) : (
            <>
              <color attach="background" args={['#0b0f16']} />
              <hemisphereLight args={['#ffffff', '#444444', 0.55]} />
              <directionalLight position={[4, 10, 2]} intensity={0.85} castShadow />
            </>
          )}

          <SceneContent />
          {characterCreated && <Player />}
          <ThirdPersonCamera />
          <PointerLook />
        </Canvas>

        {!characterCreated && <CharacterCreation />}
        {characterCreated && (
          <>
            <GameHUD />
            <CurriculumHUD />
            <Minimap />
            <MissionTracker />
            <InteractionPrompt />
            <CartPanel />
            <DialogueSystem />
            <LessonPanel />
            <QuizPanel />
            <ScenarioPanel />
            <InvestingPanel />
            <PhonePanel />
            <LifeEventSystem />
            <TimeSystem />
            <LifeLoop />
          </>
        )}

        {showHint && (
          <div className="controls-hint">
            <strong>Click</strong> look · <strong>WASD</strong> move · <strong>E</strong> interact ·{' '}
            <strong>P</strong> phone · <strong>ESC</strong> release
          </div>
        )}

        <div className={`fade-overlay ${fade || transitioning ? 'show' : ''}`} />
      </div>
    </RigContext.Provider>
  )
}
