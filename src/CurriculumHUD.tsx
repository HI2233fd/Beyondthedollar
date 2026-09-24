import { useGame } from './GameState'
import { CURRICULUM, nextAvailableTopic } from './curriculum'

export function CurriculumHUD() {
  const unlocked = useGame((s) => s.unlockedUnitNumber)
  const completed = useGame((s) => s.completedTopicIds)
  const openLesson = useGame((s) => s.openLesson)

  const next = nextAvailableTopic(unlocked, completed)
  const doneCount = completed.length
  const total = CURRICULUM.reduce((n, u) => n + u.topics.length, 0)
  const pct = total ? Math.round((doneCount / total) * 100) : 0

  const body = (
    <>
      <div className="curriculum-hud-top">
        <span className="soft-kicker">Course</span>
        <span className="soft-note curriculum-count">
          {doneCount}/{total}
        </span>
      </div>
      <span className="soft-value">{next ? `Unit ${next.unit.number}` : 'Complete'}</span>
      <span className="soft-note curriculum-title">{next ? next.unit.title : 'Nice work'}</span>
      <div className="soft-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
        <div style={{ width: `${pct}%` }} />
      </div>
    </>
  )

  if (!next) {
    return <div className="curriculum-hud soft-widget">{body}</div>
  }

  return (
    <button type="button" className="curriculum-hud soft-widget" onClick={() => openLesson(next.topic.lesson.id)}>
      {body}
    </button>
  )
}
