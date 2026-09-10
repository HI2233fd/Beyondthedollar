import { useGame } from '../game/store'
import { Card, Tag } from '../ui/components'
import { LEADERBOARD_NPCS } from '../game/content'
import { levelFromXp } from '../game/engine'

export function Leaderboard() {
  const { state } = useGame()
  const you = { name: state.character.name || 'You', avatar: state.character.avatar, xp: state.xp, isYou: true }
  const rows = [...LEADERBOARD_NPCS.map((n) => ({ ...n, isYou: false })), you].sort((a, b) => b.xp - a.xp)

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">City Rankings</div>
        <h1>🏆 Leaderboard</h1>
        <p>Ranked by <strong>Financial XP</strong> — the knowledge and smart decisions you’ve built, not just how much money you have. Wealth follows wisdom.</p>
      </div>

      <Card>
        <div className="grid" style={{ gap: 8 }}>
          {rows.map((r, i) => (
            <div
              key={r.name}
              className="option-row"
              style={{
                cursor: 'default',
                borderColor: r.isYou ? 'var(--brand)' : undefined,
                background: r.isYou ? 'rgba(52,211,153,0.1)' : undefined,
              }}
            >
              <div className="row" style={{ alignItems: 'center', gap: 14 }}>
                <span style={{ width: 28, fontWeight: 800, fontFamily: 'Sora', color: i < 3 ? 'var(--amber)' : 'var(--muted)' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span style={{ fontSize: '1.6rem' }}>{r.avatar}</span>
                <div>
                  <div className="r-title">{r.name} {r.isYou && <Tag tone="good">You</Tag>}</div>
                  <div className="muted small">Level {levelFromXp(r.xp)}</div>
                </div>
              </div>
              <div className="val" style={{ fontSize: '1.15rem' }}>{r.xp.toLocaleString()} <span className="muted small">XP</span></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
