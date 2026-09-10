import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useGame } from '../game/store'
import { STAGE_LABEL, levelFromXp, netWorth } from '../game/engine'
import { money } from '../game/format'
import { Encounter } from './Encounter'
import { Recovery } from '../screens/Recovery'

const NAV = [
  { to: '/', label: 'Home', ico: '🏠', end: true },
  { to: '/life', label: 'Life', ico: '📅' },
  { to: '/learn', label: 'Learn', ico: '💡' },
  { to: '/money', label: 'Money', ico: '💵' },
  { to: '/invest', label: 'Invest', ico: '📈' },
  { to: '/career', label: 'Career', ico: '💼' },
  { to: '/challenges', label: 'Challenges', ico: '🎯' },
  { to: '/leaderboard', label: 'Leaderboard', ico: '🏆' },
  { to: '/profile', label: 'Profile', ico: '🧑' },
]

export function Layout({ children }: { children: ReactNode }) {
  const { state, dispatch } = useGame()
  const navigate = useNavigate()
  const level = levelFromXp(state.xp)
  const nw = netWorth(state)
  const year = Math.floor(state.month / 12)
  const monthOfYear = (state.month % 12) + 1

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <span className="mark">$</span>
          <span>
            Beyond<span className="grad-text">the</span>Dollar
          </span>
        </div>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="ico">{n.ico}</span>
            {n.label}
          </NavLink>
        ))}
        <div className="spacer" />
        <button className="btn cool" onClick={() => navigate('/city')}>
          🌆 Explore the City
        </button>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="clock">
            <span className="chip">📅 Year {year + 1}, Mo {monthOfYear}</span>
            <span className="chip brand">{state.character.avatar} {STAGE_LABEL[state.stage]}</span>
            <span className="chip blue">⭐ Lv {level} · {state.xp} XP</span>
          </div>
          <div className="row" style={{ alignItems: 'center', gap: 10 }}>
            <span className="chip">{money(state.cash)} cash</span>
            <span className="chip amber">Net worth {money(nw)}</span>
            <button className="btn" onClick={() => dispatch({ type: 'ADVANCE_MONTH' })} disabled={!!state.pendingEventId || state.inRecovery}>
              ⏭ Advance Month
            </button>
          </div>
        </div>
        <div className="content">{children}</div>
      </div>

      <nav className="mobile-nav">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="ico">{n.ico}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>

      <Encounter />
      {state.inRecovery && <Recovery />}
    </div>
  )
}
