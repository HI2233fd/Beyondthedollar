import { useNavigate } from 'react-router-dom'
import { useGame } from '../game/store'
import { Card, StatTile, Tag } from '../ui/components'
import { STAGE_LABEL, financialHealth, healthLabel, levelFromXp, netWorth } from '../game/engine'
import { money } from '../game/format'

export function Life() {
  const { state } = useGame()
  const navigate = useNavigate()
  const health = financialHealth(state)
  const hl = healthLabel(health)

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Your Life</div>
        <h1>📅 Life timeline</h1>
        <p>Every choice leaves a mark. Here’s the story of your life so far — and where it might go next.</p>
      </div>

      <Card>
        <div className="between">
          <div className="card-title" style={{ marginBottom: 0 }}>📖 {STAGE_LABEL[state.stage]} · Chapter report</div>
          <button className="btn cool sm" onClick={() => navigate('/what-if')}>🔮 What-If mode</button>
        </div>
        <div className="grid g4 stats-4 mt-lg">
          <StatTile label="Age" value={`${state.age}`} icon="🎂" />
          <StatTile label="Months lived" value={`${state.month}`} icon="📆" />
          <StatTile label="Net worth" value={money(netWorth(state))} icon="💎" />
          <StatTile label="Level" value={`${levelFromXp(state.xp)}`} sub={`${state.xp} XP`} icon="⭐" />
        </div>
        <div className="info-box mt-lg">
          <div className="h">📝 How it’s going</div>
          <p>
            You’re <strong>{state.age}</strong>, in the <strong>{STAGE_LABEL[state.stage]}</strong> stage, with a financial health of{' '}
            <strong>{health}/100</strong> (<Tag tone={hl.tone as 'good' | 'bad' | 'warn'}>{hl.label}</Tag>). You’ve learned{' '}
            <strong>{state.knownConcepts.length}</strong> money concepts, unlocked <strong>{state.unlockedAchievements.length}</strong> achievements,
            and completed <strong>{state.completedChallenges.length}</strong> challenges. {netWorth(state) >= 0 ? 'Your net worth is positive — keep building!' : 'Your net worth is negative — focus on paying down debt and growing savings.'}
          </p>
        </div>
      </Card>

      <Card className="mt-lg">
        <div className="card-title">🧵 Life events</div>
        {state.timeline.length === 0 ? (
          <div className="muted small">Your story starts now. Make some choices!</div>
        ) : (
          <div>
            {state.timeline.slice(0, 40).map((t) => (
              <div key={t.id} className={`tl-item ${t.tone}`}>
                <div className="tl-ico">{t.icon}</div>
                <div className="tl-body">
                  <div className="t">{t.title}</div>
                  <div className="d">{t.detail}</div>
                  <div className="m">Month {t.month} · {STAGE_LABEL[t.stage]}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
