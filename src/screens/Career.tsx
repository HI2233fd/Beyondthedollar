import { useGame } from '../game/store'
import { Card, StatTile, Tag } from '../ui/components'
import { JOBS, SIDE_HUSTLES, CONCEPTS, STAGE_ORDER } from '../game/content'
import { STAGE_LABEL, computePaycheck, jobMonthlyGross } from '../game/engine'
import { money } from '../game/format'

export function Career() {
  const { state, dispatch } = useGame()
  const stageIdx = STAGE_ORDER.indexOf(state.stage)
  const availableJobs = JOBS.filter((j) => STAGE_ORDER.indexOf(j.stage) <= stageIdx + 1)
  const nextStage = STAGE_ORDER[stageIdx + 1]

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Career Tower</div>
        <h1>💼 Career</h1>
        <p>Your income is your most powerful money tool. Land a job, pick up a side hustle, and grow into new life stages.</p>
      </div>

      <div className="grid g2">
        <Card>
          <div className="card-title">📋 Current job</div>
          {state.job ? (
            <>
              <div className="between">
                <div>
                  <div className="r-title" style={{ fontSize: '1.2rem' }}>{state.job.title}</div>
                  <div className="muted small">{state.job.employer}</div>
                </div>
                <button className="btn ghost sm" onClick={() => dispatch({ type: 'QUIT_JOB' })}>Quit</button>
              </div>
              <div className="grid g3 mt-lg" style={{ gap: 10 }}>
                <StatTile label="Wage" value={`$${state.job.hourlyWage}/hr`} />
                <StatTile label="Hours" value={`${state.job.hoursPerWeek}/wk`} />
                <StatTile label="Take-home" value={money(computePaycheck(jobMonthlyGross(state.job.hourlyWage, state.job.hoursPerWeek)).net)} sub="per month" />
              </div>
              {state.job.benefits && <div className="muted small mt">🎁 {state.job.benefits}</div>}
            </>
          ) : (
            <div className="muted small">You’re not working yet. Pick a job below to start earning.</div>
          )}
        </Card>

        <Card>
          <div className="card-title">⚡ Side hustle</div>
          <div className="grid" style={{ gap: 10 }}>
            {SIDE_HUSTLES.map((h) => (
              <button
                key={h.id}
                className={`option-row ${state.sideHustle === h.id ? 'selected' : ''}`}
                onClick={() => dispatch({ type: 'SET_SIDE_HUSTLE', id: state.sideHustle === h.id ? null : h.id, monthly: state.sideHustle === h.id ? 0 : h.monthly })}
              >
                <div>
                  <div className="r-title">{h.name}</div>
                  <div className="r-sub">{h.note}</div>
                </div>
                <Tag tone="good">+{money(h.monthly)}/mo</Tag>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-lg">
        <div className="card-title">🔎 Job listings</div>
        <div className="grid g2" style={{ gap: 12 }}>
          {availableJobs.map((j) => {
            const locked = !!j.requiresConcept && !state.knownConcepts.includes(j.requiresConcept)
            const concept = j.requiresConcept ? CONCEPTS.find((c) => c.id === j.requiresConcept) : null
            const isCurrent = state.job?.id === j.id
            return (
              <div key={j.id} className="stat-tile">
                <div className="between">
                  <div>
                    <div className="r-title">{j.title}</div>
                    <div className="muted small">{j.employer} · {STAGE_LABEL[j.stage]}</div>
                  </div>
                  <div className="val" style={{ fontSize: '1.1rem' }}>${j.hourlyWage}<span className="muted small">/hr</span></div>
                </div>
                <div className="muted small mt">{money(computePaycheck(jobMonthlyGross(j.hourlyWage, j.hoursPerWeek)).net)}/mo take-home · {j.hoursPerWeek}h/wk</div>
                {locked ? (
                  <Tag tone="warn">🔒 Learn “{concept?.title}” to qualify</Tag>
                ) : (
                  <button className="btn sm mt" disabled={isCurrent} onClick={() => dispatch({ type: 'TAKE_JOB', job: j })}>
                    {isCurrent ? 'Current job' : 'Take this job'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {nextStage && (
        <Card className="mt-lg">
          <div className="between">
            <div>
              <div className="card-title" style={{ marginBottom: 4 }}>🎓 Grow into the next stage</div>
              <div className="muted small">Advance to <strong>{STAGE_LABEL[nextStage]}</strong> to unlock higher-paying jobs and new opportunities.</div>
            </div>
            <button className="btn cool" onClick={() => dispatch({ type: 'ADVANCE_STAGE' })}>Advance to {STAGE_LABEL[nextStage]} →</button>
          </div>
        </Card>
      )}
    </div>
  )
}
