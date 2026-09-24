import { useGame } from '../GameState'
import { getScenario } from './scenarios'

/**
 * Decision pop-up: short setup → choices → immediate effects → "here's why".
 */
export function ScenarioPanel() {
  const scenarioId = useGame((s) => s.activeScenarioId)
  const choiceId = useGame((s) => s.scenarioChoiceId)
  const whyOverride = useGame((s) => s.scenarioWhyOverride)
  const choose = useGame((s) => s.chooseScenarioOption)
  const dismiss = useGame((s) => s.dismissScenario)

  if (!scenarioId) return null
  const scenario = getScenario(scenarioId)
  if (!scenario) return null

  const chosen = choiceId ? scenario.choices.find((c) => c.id === choiceId) : null

  if (chosen) {
    return (
      <div className="modal-overlay scenario-overlay">
        <div className="scenario-card">
          <div className="scenario-badge outcome">Here’s why</div>
          <h2 className="scenario-title">{scenario.title}</h2>
          <p className="scenario-why">{whyOverride ?? chosen.why}</p>
          <button type="button" className="scenario-continue" onClick={dismiss}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay scenario-overlay">
      <div className="scenario-card">
        <div className="scenario-badge">{scenario.badge ?? 'Scenario'}</div>
        <h2 className="scenario-title">{scenario.title}</h2>
        <p className="scenario-setup">{scenario.setup}</p>
        <div className="scenario-options">
          {scenario.choices.map((c) => (
            <button key={c.id} type="button" className="scenario-btn" onClick={() => choose(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
