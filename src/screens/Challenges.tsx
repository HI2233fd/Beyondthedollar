import { useGame } from '../game/store'
import { Card, Bar, Tag } from '../ui/components'
import { ACHIEVEMENTS, CHALLENGES } from '../game/content'
import { money } from '../game/format'

export function Challenges() {
  const { state } = useGame()
  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Goals & Glory</div>
        <h1>🎯 Challenges & Achievements</h1>
        <p>Optional goals that reward smart money habits with XP. Chase them in any order — or forge your own path.</p>
      </div>

      <Card>
        <div className="card-title">🎯 Challenges</div>
        <div className="grid g2" style={{ gap: 16 }}>
          {CHALLENGES.map((c) => {
            const done = state.completedChallenges.includes(c.id)
            const prog = state.challengeProgress[c.id] ?? 0
            return (
              <div key={c.id} className="stat-tile">
                <div className="between">
                  <div className="r-title">{c.emoji} {c.title}</div>
                  {done ? <Tag tone="good">✓ Done · +{c.xp} XP</Tag> : <Tag tone="info">+{c.xp} XP</Tag>}
                </div>
                <div className="muted small" style={{ margin: '4px 0 10px' }}>{c.desc}</div>
                <Bar value={done ? c.target : prog} max={c.target} />
                <div className="muted small mt">{c.unit === '$' ? money(prog) : prog} / {c.unit === '$' ? money(c.target) : `${c.target} ${c.unit}`}</div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="mt-lg">
        <div className="card-title">🏅 Achievements ({state.unlockedAchievements.length}/{ACHIEVEMENTS.length})</div>
        <div className="grid g3" style={{ gap: 14 }}>
          {ACHIEVEMENTS.map((a) => {
            const unlocked = state.unlockedAchievements.includes(a.id)
            return (
              <div key={a.id} className="stat-tile" style={{ opacity: unlocked ? 1 : 0.5 }}>
                <div className="row" style={{ alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.8rem', filter: unlocked ? 'none' : 'grayscale(1)' }}>{a.emoji}</span>
                  <div>
                    <div className="r-title">{a.title} {unlocked && <Tag tone="good">✓</Tag>}</div>
                    <div className="muted small">{a.desc}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
