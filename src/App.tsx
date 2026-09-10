import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GameProvider, useGame } from './game/store'
import { Layout } from './ui/Layout'
import { Welcome, CharacterCreation, LifeSetup } from './screens/Onboarding'
import { Home } from './screens/Home'
import { City } from './screens/City'
import { Money } from './screens/Money'
import { Invest } from './screens/Invest'
import { Career } from './screens/Career'
import { Learn } from './screens/Learn'
import { Life } from './screens/Life'
import { Challenges } from './screens/Challenges'
import { Leaderboard } from './screens/Leaderboard'
import { Profile } from './screens/Profile'
import { WhatIf } from './screens/WhatIf'
import { Housing, Dealership, Shop } from './screens/Buildings'

function Game() {
  const { state } = useGame()

  if (!state.started) {
    if (state.onboardingStep === 'character') return <CharacterCreation />
    if (state.onboardingStep === 'setup') return <LifeSetup />
    return <Welcome />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/city" element={<City />} />
        <Route path="/life" element={<Life />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/money" element={<Money />} />
        <Route path="/invest" element={<Invest />} />
        <Route path="/career" element={<Career />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/what-if" element={<WhatIf />} />
        <Route path="/housing" element={<Housing />} />
        <Route path="/dealership" element={<Dealership />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <HashRouter>
      <GameProvider>
        <Game />
      </GameProvider>
    </HashRouter>
  )
}
