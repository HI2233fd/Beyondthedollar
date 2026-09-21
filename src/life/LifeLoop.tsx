import { useEffect, useRef } from 'react'
import { useGame } from '../GameState'

/**
 * Watches live game state and advances First Day / opportunity missions,
 * discoveries, achievements, and autosave — without rewriting core systems.
 */
export function LifeLoop() {
  const characterCreated = useGame((s) => s.characterCreated)
  const scene = useGame((s) => s.scene)
  const phoneOpen = useGame((s) => s.phoneOpen)
  const hasChecking = useGame((s) => s.hasCheckingAccount)
  const hasJob = useGame((s) => s.hasJob)
  const paystubs = useGame((s) => s.paystubs)
  const savings = useGame((s) => s.savings)
  const cash = useGame((s) => s.cash)
  const bank = useGame((s) => s.bank)
  const debt = useGame((s) => s.debt)
  const creditScore = useGame((s) => s.creditScore)
  const carStatus = useGame((s) => s.carStatus)
  const homeStatus = useGame((s) => s.homeStatus)
  const holdings = useGame((s) => s.holdings)
  const relationships = useGame((s) => s.relationships)
  const totalMinutes = useGame((s) => s.totalMinutes)
  const lifeLevel = useGame((s) => s.lifeLevel)

  const exploredHome = useRef(false)
  const exploredCity = useRef(false)
  const lastSaveAt = useRef(0)

  // Discover locations + first-day explore objectives
  useEffect(() => {
    if (!characterCreated) return
    const g = useGame.getState()
    g.discoverLocation(scene)
    if (scene === 'home') {
      if (!exploredHome.current) {
        exploredHome.current = true
        // slight delay so player actually moves around bedroom
        const t = window.setTimeout(() => {
          useGame.getState().completeMissionObjective('first-day', 'explore-home')
        }, 4000)
        return () => clearTimeout(t)
      }
    }
    if (scene === 'city') {
      g.completeMissionObjective('first-day', 'leave-home')
      if (!exploredCity.current) {
        exploredCity.current = true
        const t = window.setTimeout(() => {
          useGame.getState().completeMissionObjective('first-day', 'explore-neighborhood')
        }, 6000)
        return () => clearTimeout(t)
      }
    }
  }, [characterCreated, scene])

  useEffect(() => {
    if (!characterCreated || !phoneOpen) return
    const g = useGame.getState()
    g.completeMissionObjective('first-day', 'open-phone')
    const first = g.missions.find((m) => m.id === 'first-day')
    const met = first?.objectives.find((o) => o.id === 'meet-someone')?.done
    if (met) g.completeMissionObjective('first-day', 'first-opportunity')
  }, [characterCreated, phoneOpen])

  useEffect(() => {
    if (!characterCreated) return
    const met = Object.values(relationships).some((r) => r.met)
    if (met) useGame.getState().completeMissionObjective('first-day', 'meet-someone')
  }, [characterCreated, relationships])

  // Opportunity mission tracking
  useEffect(() => {
    if (!characterCreated) return
    const g = useGame.getState()
    if (hasChecking) g.completeMissionObjective('first-opportunity', 'open-checking')
    if (hasJob) g.completeMissionObjective('first-opportunity', 'get-hired')
    if (paystubs.length > 0) {
      g.completeMissionObjective('first-opportunity', 'first-paycheck')
      g.unlockAchievement('first-paycheck')
    }
  }, [characterCreated, hasChecking, hasJob, paystubs.length])

  useEffect(() => {
    if (!characterCreated) return
    // grocery checkout or savings move counts as money decision
    if (savings > 0 || cash < 200) {
      useGame.getState().completeMissionObjective('first-opportunity', 'shop-or-save')
    }
  }, [characterCreated, savings, cash])

  // Achievements
  useEffect(() => {
    if (!characterCreated) return
    const liquid = cash + bank + savings
    const g = useGame.getState()
    if (liquid >= 1000) g.unlockAchievement('first-1k')
    if (carStatus !== 'none') g.unlockAchievement('first-car')
    if (homeStatus === 'owned') g.unlockAchievement('moved-out')
    if (debt === 0 && hasJob) g.unlockAchievement('debt-free')
    if (creditScore >= 700) g.unlockAchievement('strong-credit')
    if (holdings.stock > 0 || holdings.bond > 0) g.unlockAchievement('first-investment')
    if (relationships['home-jordan']?.met) g.unlockAchievement('met-jordan')
    if (lifeLevel >= 10) g.unlockAchievement('downtown-unlocked')
  }, [
    characterCreated,
    cash,
    bank,
    savings,
    carStatus,
    homeStatus,
    debt,
    hasJob,
    creditScore,
    holdings,
    relationships,
    lifeLevel,
  ])

  // Season from calendar month
  useEffect(() => {
    if (!characterCreated) return
    useGame.getState().syncSeasonFromTime()
  }, [characterCreated, totalMinutes])

  // Periodic autosave
  useEffect(() => {
    if (!characterCreated) return
    if (totalMinutes - lastSaveAt.current < 30) return
    lastSaveAt.current = totalMinutes
    useGame.getState().autosave()
  }, [characterCreated, totalMinutes, scene, hasJob, hasChecking])

  return null
}
