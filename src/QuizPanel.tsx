import { useMemo } from 'react'
import { useGame } from './GameState'
import { CURRICULUM } from './curriculum'

export function QuizPanel() {
  const quizId = useGame((s) => s.activeQuizId)
  const answers = useGame((s) => s.quizAnswers)
  const submitted = useGame((s) => s.quizSubmitted)
  const answerQuiz = useGame((s) => s.answerQuiz)
  const submitQuiz = useGame((s) => s.submitQuiz)
  const closeQuiz = useGame((s) => s.closeQuiz)
  const openLesson = useGame((s) => s.openLesson)

  const lesson = useMemo(() => {
    if (!quizId) return null
    return CURRICULUM.flatMap((u) => u.topics.map((t) => t.lesson)).find((l) => l.quiz.id === quizId) ?? null
  }, [quizId])

  if (!quizId || !lesson) return null
  const quiz = lesson.quiz
  const allAnswered = quiz.questions.every((qq) => answers[qq.id] !== undefined)
  const score = quiz.questions.reduce((n, qq) => n + (answers[qq.id] === qq.correctIndex ? 1 : 0), 0)
  const passed = score === quiz.questions.length

  return (
    <div className="modal-overlay curriculum-overlay">
      <div className="curriculum-card quiz-card">
        <div className="curriculum-meta">
          <span className="curriculum-badge">Quiz</span>
        </div>
        <h2 className="curriculum-title">{quiz.title}</h2>
        <div className="quiz-list">
          {quiz.questions.map((qq, qi) => {
            const chosen = answers[qq.id]
            return (
              <div key={qq.id} className="quiz-q">
                <div className="quiz-prompt">
                  {qi + 1}. {qq.prompt}
                </div>
                <div className="quiz-choices">
                  {qq.choices.map((c, ci) => {
                    let cls = 'quiz-choice'
                    if (submitted) {
                      if (ci === qq.correctIndex) cls += ' correct'
                      else if (chosen === ci) cls += ' wrong'
                    } else if (chosen === ci) {
                      cls += ' selected'
                    }
                    return (
                      <button
                        key={ci}
                        type="button"
                        className={cls}
                        disabled={submitted}
                        onClick={() => answerQuiz(qq.id, ci)}
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>
                {submitted && <p className="quiz-explain">{qq.explanation}</p>}
              </div>
            )
          })}
        </div>

        {!submitted && (
          <div className="curriculum-actions">
            <button type="button" className="curriculum-btn ghost" onClick={() => openLesson(lesson.id)}>
              Back to lesson
            </button>
            <button type="button" className="curriculum-btn primary" disabled={!allAnswered} onClick={submitQuiz}>
              Submit answers
            </button>
          </div>
        )}

        {submitted && (
          <div className="quiz-result">
            <p>
              Score:{' '}
              <strong>
                {score}/{quiz.questions.length}
              </strong>
              {passed ? ' — Topic complete!' : ' — Review the explanations and try again.'}
            </p>
            <div className="curriculum-actions">
              {!passed && (
                <button type="button" className="curriculum-btn ghost" onClick={() => openLesson(lesson.id)}>
                  Review lesson
                </button>
              )}
              <button type="button" className="curriculum-btn primary" onClick={closeQuiz}>
                {passed ? 'Continue exploring' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
