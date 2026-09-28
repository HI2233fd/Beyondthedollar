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
import { ConceptLessonPanel } from './education/ConceptLessonPanel'
import { CheckpointPanel } from './education/CheckpointPanel'
import { ExplainerCard } from './education/ExplainerCard'
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
import { GuidePanel } from './life/GuidePanel'
import { WhatCanIDoPanel, WhatCanIDoFab } from './life/WhatCanIDoPanel'
import { RewardToast } from './life/RewardToast'
import { PaceCoach } from './life/PaceCoach'
import { ActivityPanel } from './life/play/ActivityPanel'
import { DayHud } from './life/day/DayHud'
import { ClassSessionPanel } from './life/day/ClassSessionPanel'
import { VehicleSystem } from './life/day/VehicleSystem'
import { LivingCrowd } from './life/day/LivingCrowd'
import { CafeInterior } from './life/day/CafeInterior'
import {
  HighInterior,
  CommonsInterior,
  ApartmentsInterior,
  MotorsInterior,
  KitchenInterior,
  LanternInterior,
  TownhouseInterior,
  ClinicInterior,
  WorkshopInterior,
} from './world/NewInteriors'
import { CalendarPanel, GuideBanner, MapPanel } from './world/MapPanel'
import { useWorldUi } from './world/simStore'
import { useRig } from './rig'
import { applyMoney } from './world/pay'
import { POIS } from './cityLayout'
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
      {scene === 'cafe' && <CafeInterior />}
      {scene === 'high' && <HighInterior />}
      {scene === 'commons' && <CommonsInterior />}
      {scene === 'apartments' && <ApartmentsInterior />}
      {scene === 'motors' && <MotorsInterior />}
      {scene === 'kitchen' && <KitchenInterior />}
      {scene === 'lantern' && <LanternInterior />}
      {scene === 'townhouse' && <TownhouseInterior />}
      {scene === 'clinic' && <ClinicInterior />}
      {scene === 'workshop' && <WorkshopInterior />}
      {scene === 'city' && <VehicleSystem />}
      <LivingCrowd />
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
      pitch: { current: 0.28 },
      walk: { current: 0 },
      moving: { current: false },
      anim: { current: 'idle' },
      speed: { current: 0 },
      distance: { current: 5 },
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
  const optionsOpen = useGame((s) => s.optionsOpen)
  const rewardPopup = useGame((s) => s.rewardPopup)
  const activityOpen = useGame((s) => s.activity)
  const classOpen = useGame((s) => s.classSessionOpen)
  const finishTransition = useGame((s) => s.finishTransition)

  const mapOpen = useWorldUi((s) => s.mapOpen)
  const calendarOpen = useWorldUi((s) => s.calendarOpen)
  const [fade, setFade] = useState(false)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    const id = window.setInterval(() => useGame.getState().checkpoint(), 45000)
    return () => window.clearInterval(id)
  }, [])

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
      if (!useGame.getState().characterCreated) return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      if (e.code === 'KeyO') {
        const s = useGame.getState()
        if (s.optionsOpen) s.closeOptions()
        else s.openOptions()
        return
      }
      if (e.code === 'KeyP') {
        const s = useGame.getState()
        if (s.phoneOpen) s.closePhone()
        else s.openPhone()
        return
      }
      if (e.code === 'KeyM') {
        const ui = useWorldUi.getState()
        ui.setMap(!ui.mapOpen)
        return
      }
      if (e.code === 'KeyT') {
        const ui = useWorldUi.getState()
        ui.setCalendar(!ui.calendarOpen)
      }
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
    optionsOpen ||
    !!rewardPopup ||
    !!activityOpen ||
    classOpen ||
    mapOpen ||
    calendarOpen ||
    !characterCreated
  const showHint = characterCreated && !locked && !modalOpen

  return (
    <RigContext.Provider value={rig}>
      <div className="game-root">
        <Canvas shadows camera={{ position: [-2, 4, 16], fov: 67 }} dpr={[1, 1.5]}>
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
            <div className="hud-column">
              <GameHUD />
              <DayHud />
              <CurriculumHUD />
            </div>
            <Minimap />
            <MapPanel />
            <CalendarPanel />
            <GuideBanner />
            <MissionTracker />
            <PaceCoach />
            <GuidePanel />
            <WhatCanIDoFab />
            <WhatCanIDoPanel />
            <RewardToast />
            <InteractionPrompt />
            <CartPanel />
            <DialogueSystem />
            <LessonPanel />
            <ConceptLessonPanel />
            <CheckpointPanel />
            <ExplainerCard />
            <QuizPanel />
            <ScenarioPanel />
            <InvestingPanel />
            <PhonePanel />
            <ActivityPanel />
            <ClassSessionPanel />
            <LifeEventSystem />
            <TimeSystem />
            <LifeLoop />
          </>
        )}

        <StoryMeters />
        <FatalOverlay />
        {showHint && (
          <div className="controls-hint">
            WASD to walk · Shift to run · E to interact · P phone · M map · T calendar
            <br />
            Click the world and move your mouse to look. Scroll to zoom. Esc releases the mouse.
          </div>
        )}

        <div className={`fade-overlay ${fade || transitioning ? 'show' : ''}`} />
      </div>
    </RigContext.Provider>
  )
}

function StoryMeters() {
  const created = useGame((s) => s.characterCreated)
  const stamina = useWorldUi((s) => s.stamina)
  const speed = useWorldUi((s) => s.carSpeed)
  const driving = useGame((s) => s.dayLife.drivingVehicleId)
  const fuel = useGame((s) => s.worldSim.fuel)
  const rig = useRig()
  if (!created) return null
  return (
    <>
      {stamina < 99 && !driving && (
        <div className="stamina-meter" aria-label="Sprint stamina">
          <span style={{ width: `${Math.max(0, Math.min(100, stamina))}%` }} />
        </div>
      )}
      {driving && (
        <div className="drive-meter">
          <span>{Math.round(speed * 3.6)} km/h</span>
          <span>Fuel {driving === 'testdrive' ? 'test' : fuel.toFixed(0)}</span>
          {driving !== 'testdrive' && fuel <= 0 && speed < 0.6 && (
            <button
              type="button"
              onClick={() => {
                const err = applyMoney(-15, 'Tow to fuel station')
                if (err) {
                  useGame.getState().openDialogue({ name: 'Tow', text: err, options: [{ label: 'Back', close: true }] })
                  return
                }
                const g = useGame.getState()
                g.dayAct({ type: 'park-vehicle', vehicleId: driving, x: POIS.fuel.x, z: POIS.fuel.z + 6, yaw: 0 })
                g.patchWorld({ fuel: 8 })
                const body = rig.groupRef.current
                if (body) body.position.set(POIS.fuel.x + 3, 0, POIS.fuel.z + 6)
              }}
            >
              Tow to the pump · $15
            </button>
          )}
        </div>
      )}
    </>
  )
}

function FatalOverlay() {
  const fatal = useWorldUi((s) => s.fatal)
  const reload = useGame((s) => s.reloadSafeSave)
  const [note, setNote] = useState<string | null>(null)
  if (!fatal) return null
  return (
    <div className="fatal-overlay">
      <h2>Your life ended.</h2>
      <p>The safe checkpoint was not overwritten.</p>
      {note && <p>{note}</p>}
      <button
        type="button"
        onClick={() => {
          if (!reload()) setNote('No safe checkpoint yet. Return to the menu and continue from the last save.')
        }}
      >
        Reload last safe save
      </button>
      <button
        type="button"
        onClick={() => {
          useWorldUi.setState({ fatal: false })
          useGame.setState({ characterCreated: false, timeScale: 1 })
        }}
      >
        Return to menu
      </button>
    </div>
  )
}
