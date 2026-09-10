import { useNavigate } from 'react-router-dom'
import { CITY, NPCS, type Building } from '../game/content'
import { Card } from '../ui/components'

const ACTION_ROUTE: Record<Building['action'], string> = {
  bank: '/money',
  invest: '/invest',
  career: '/career',
  housing: '/housing',
  dealership: '/dealership',
  shopping: '/shop',
  learn: '/learn',
  school: '/career',
  restaurant: '/shop',
  civic: '/life',
}

export function City() {
  const navigate = useNavigate()
  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">The City of Merridian</div>
        <h1>🌆 Explore the city</h1>
        <p>Walk the districts and step into buildings to make real decisions. The city responds to how you live.</p>
      </div>

      <div className="districts">
        {CITY.map((d) => (
          <div className="district" key={d.id}>
            <div className="banner" style={{ background: d.gradient }}>
              <span className="big-emoji">{d.emoji}</span>
              <h3>{d.name}</h3>
              <p>{d.tagline}</p>
            </div>
            <div className="buildings">
              {d.buildings.map((b) => (
                <div key={b.id} className="building" onClick={() => navigate(ACTION_ROUTE[b.action])}>
                  <span className="b-emoji">{b.emoji}</span>
                  <div>
                    <div className="b-name">{b.name}</div>
                    <div className="b-blurb">{b.blurb}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Card className="mt-lg">
        <div className="card-title">🧑‍🤝‍🧑 People around town</div>
        <div className="grid g3" style={{ gap: 12 }}>
          {NPCS.map((n) => (
            <div key={n.name} className="stat-tile">
              <div className="row" style={{ alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.6rem' }}>{n.emoji}</span>
                <div>
                  <div className="r-title">{n.name}</div>
                  <div className="muted small">{n.role}</div>
                </div>
              </div>
              <div className="muted small mt">{n.line}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
