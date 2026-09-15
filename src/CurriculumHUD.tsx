import { useGame } from './GameState'
import { CURRICULUM, nextAvailableTopic } from './curriculum'
import { BUILDING_LABEL } from './curriculum/buildingMap'

export function CurriculumHUD() {
  const unlocked = useGame((s) => s.unlockedUnitNumber)
  const completed = useGame((s) => s.completedTopicIds)
  const openLesson = useGame((s) => s.openLesson)

  const next = nextAvailableTopic(unlocked, completed)
  const doneCount = completed.length
  const total = CURRICULUM.reduce((n, u) => n + u.topics.length, 0)

  return (
    <div className="curriculum-hud">
      <div className="curriculum-hud-top">
        <span className="curriculum-hud-label">Course</span>
        <span className="curriculum-hud-progress">
          {doneCount}/{total} topics · Unit {Math.min(unlocked, 21)}/21
        </span>
      </div>
      {next ? (
        <>
          <div className="curriculum-hud-unit">
            Unit {next.unit.number}: {next.unit.title}
          </div>
          <div className="curriculum-hud-hint">
            Go to <strong>{BUILDING_LABEL[next.unit.buildingId]}</strong> · press E at LEARN
          </div>
          <button type="button" className="curriculum-hud-btn" onClick={() => openLesson(next.topic.lesson.id)}>
            Open current lesson
          </button>
        </>
      ) : (
        <div className="curriculum-hud-unit">Curriculum complete — nice work!</div>
      )}
    </div>
  )
}
