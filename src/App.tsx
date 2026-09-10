import BudgetGame from './components/BudgetGame'
import Quiz from './components/Quiz'
import { lessons } from './data'

export default function App() {
  return (
    <>
      <header className="nav">
        <div className="container nav-inner">
          <div className="brand">
            <img src="/coin.svg" alt="Beyond The Dollar logo" />
            Beyond The Dollar
          </div>
          <nav className="nav-links">
            <a href="#lessons">Lessons</a>
            <a href="#budget">Budget Game</a>
            <a href="#quiz">Quiz</a>
            <a href="#mission">Mission</a>
          </nav>
          <a className="btn" href="#budget">
            Start learning
          </a>
        </div>
      </header>

      <main>
        <section className="container hero">
          <div>
            <span className="pill">🌱 A nonprofit for teens</span>
            <h1>
              Money skills that actually <span className="grad">stick</span>.
            </h1>
            <p className="lead">
              Beyond The Dollar helps teenagers understand financial life
              through hands-on lessons, budgeting games, and quizzes — no boring
              lectures, just skills you will use for the rest of your life.
            </p>
            <div className="hero-cta">
              <a className="btn" href="#budget">
                Try the budget game
              </a>
              <a className="btn secondary" href="#lessons">
                Browse lessons
              </a>
            </div>
            <div className="stats">
              <div className="stat">
                <div className="num">6</div>
                <div className="lbl">Core lessons</div>
              </div>
              <div className="stat">
                <div className="num">100%</div>
                <div className="lbl">Free, forever</div>
              </div>
              <div className="stat">
                <div className="num">0</div>
                <div className="lbl">Ads or gimmicks</div>
              </div>
            </div>
          </div>

          <aside className="hero-card">
            <h3>This month&rsquo;s progress</h3>
            <div className="sub">Emma, 16 · Saving for a laptop 💻</div>
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem',
                  color: 'var(--muted)',
                }}
              >
                <span>Goal: $650</span>
                <span>$420 saved</span>
              </div>
              <div className="balance-bar">
                <span style={{ width: '65%' }} />
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                65% there — 3 lessons completed this week 🔥
              </div>
            </div>
            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gap: 10,
              }}
            >
              {['Finished “Budgeting Basics”', 'Aced the savings quiz', 'Set a SMART goal'].map(
                (t) => (
                  <div
                    key={t}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      color: 'var(--muted)',
                      fontSize: '0.92rem',
                    }}
                  >
                    <span style={{ color: 'var(--brand)' }}>✓</span> {t}
                  </div>
                ),
              )}
            </div>
          </aside>
        </section>

        <section id="lessons" className="section container">
          <div className="section-head">
            <div className="eyebrow">Learn</div>
            <h2>Lessons built for real life</h2>
            <p>
              Short, practical modules that go from your first paycheck to your
              first investment.
            </p>
          </div>
          <div className="grid">
            {lessons.map((l) => (
              <article className="card" key={l.title}>
                <div className="icon">{l.icon}</div>
                <h3>{l.title}</h3>
                <p>{l.description}</p>
                <span className="tag">{l.level}</span>
              </article>
            ))}
          </div>
        </section>

        <section id="budget" className="section container">
          <BudgetGame />
        </section>

        <section id="quiz" className="section container">
          <div className="section-head">
            <div className="eyebrow">Play</div>
            <h2>Test your money smarts</h2>
            <p>Answer a few quick questions and see how much you already know.</p>
          </div>
          <Quiz />
        </section>

        <section id="mission" className="section container">
          <div className="section-head">
            <div className="eyebrow">Our mission</div>
            <h2>Financial confidence for every teen</h2>
            <p>
              Beyond The Dollar is a nonprofit on a mission to make money
              education engaging, accessible, and free — so every young person
              can step into adulthood ready to thrive.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          Beyond The Dollar · A nonprofit for financial literacy · Built with ❤️
          for the next generation
        </div>
      </footer>
    </>
  )
}
