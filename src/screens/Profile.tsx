import { useGame } from '../game/store'
import { Card, StatTile, Bar, Tag } from '../ui/components'
import { levelFromXp, xpForLevel, financialHealth, healthLabel, netWorth, STAGE_LABEL } from '../game/engine'
import { money } from '../game/format'
import { TRAITS } from '../game/content'

export function Profile() {
  const { state, dispatch } = useGame()
  const level = levelFromXp(state.xp)
  const nextLevelXp = xpForLevel(level + 1)
  const thisLevelXp = xpForLevel(level)
  const progress = state.xp - thisLevelXp
  const need = nextLevelXp - thisLevelXp
  const health = financialHealth(state)
  const hl = healthLabel(health)
  const trait = TRAITS.find((t) => t.id === state.character.trait)

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Your Profile</div>
        <h1>🧑 Profile</h1>
      </div>

      <Card>
        <div className="row" style={{ alignItems: 'center', gap: 20 }}>
          <div className="big-avatar">{state.character.avatar}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.6rem' }}>{state.character.name || 'Player'}</h2>
            <div className="muted">{state.character.pronouns} · {STAGE_LABEL[state.stage]} · Age {state.age}</div>
            {trait && <Tag tone="info">{trait.label}</Tag>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="val" style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '2rem' }}>Lv {level}</div>
            <div className="muted small">{state.xp} XP</div>
          </div>
        </div>
        <div className="mt-lg">
          <div className="between small"><span>Progress to Level {level + 1}</span><span className="muted">{progress}/{need} XP</span></div>
          <Bar value={progress} max={need} />
        </div>
      </Card>

      <div className="grid g4 stats-4 mt-lg">
        <StatTile label="Net worth" value={money(netWorth(state))} icon="💎" />
        <StatTile label="Financial health" value={`${health}`} sub={hl.label} icon="❤️" />
        <StatTile label="Credit score" value={`${state.creditScore}`} icon="📊" />
        <StatTile label="Concepts learned" value={`${state.knownConcepts.length}`} icon="🎓" />
      </div>

      <Card className="mt-lg">
        <div className="card-title">⚙️ Game options</div>
        <p className="muted small">Your progress saves automatically to this browser. Want a fresh start with a new character and life?</p>
        <button
          className="btn danger mt"
          onClick={() => {
            if (confirm('Start a brand new life? This erases your current save.')) dispatch({ type: 'RESET' })
          }}
        >
          🔄 Start a new life
        </button>
      </Card>
    </div>
  )
}
