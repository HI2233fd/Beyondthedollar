import { useState } from 'react'
import { quizQuestions } from '../data'

export default function Quiz() {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const q = quizQuestions[current]

  const handleSelect = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    if (i === q.answer) setScore((s) => s + 1)
  }

  const next = () => {
    if (current + 1 >= quizQuestions.length) {
      setFinished(true)
      return
    }
    setCurrent((c) => c + 1)
    setSelected(null)
  }

  const restart = () => {
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    const pct = Math.round((score / quizQuestions.length) * 100)
    return (
      <div className="quiz quiz-score">
        <div className="eyebrow">Quiz complete</div>
        <div className="big">
          {score}/{quizQuestions.length}
        </div>
        <p style={{ color: 'var(--muted)' }}>
          {pct === 100
            ? 'Perfect score — you are a money whiz! 🏆'
            : pct >= 50
              ? 'Great work! Keep learning and level up. 💪'
              : 'Good start — review the lessons and try again. 📚'}
        </p>
        <button className="btn" onClick={restart}>
          Try again
        </button>
      </div>
    )
  }

  const optionClass = (i: number) => {
    if (selected === null) return 'option'
    if (i === q.answer) return 'option correct'
    if (i === selected) return 'option wrong'
    return 'option'
  }

  return (
    <div className="quiz">
      <div className="qnum">
        Question {current + 1} of {quizQuestions.length}
      </div>
      <h3>{q.question}</h3>
      <div className="options">
        {q.options.map((opt, i) => (
          <button
            key={i}
            className={optionClass(i)}
            onClick={() => handleSelect(i)}
            disabled={selected !== null}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="quiz-explain">
        {selected !== null ? q.explanation : ''}
      </div>
      <div className="quiz-footer">
        <span style={{ color: 'var(--muted)', fontWeight: 700 }}>
          Score: {score}
        </span>
        <button
          className="btn"
          onClick={next}
          disabled={selected === null}
          style={{ opacity: selected === null ? 0.5 : 1 }}
        >
          {current + 1 >= quizQuestions.length ? 'See results' : 'Next question'}
        </button>
      </div>
    </div>
  )
}
