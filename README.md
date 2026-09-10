# Beyond The Dollar

**Beyond The Dollar** is a nonprofit designed to help teenagers (~14–18) understand
financial life in an engaging way. This repository contains the web app: a **premium
interactive financial-life simulator** set in the fictional city of *Merridian*.

It is a life simulator centered on financial decisions — not a course, quiz app, or
spreadsheet. The player lives a life, and the choices they make (housing, work,
education, transport, spending, saving, investing, credit, debt, emergencies, and
opportunities) teach how money really works.

Core loop: **Live → Explore → Encounter → Understand → Decide → Experience →
Consequence → Adapt → Progress.**

## Tech stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript
- [React Router](https://reactrouter.com/) (HashRouter) for navigation
- Custom SVG charts (no chart dependency); state persisted to `localStorage`
- ESLint for linting

## Getting started

Requires Node.js 20+ (developed on Node 22) and npm.

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:5173
```

## Available scripts

| Script              | Description                                     |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Start the Vite dev server (hot reload).         |
| `npm run build`     | Type-check and build the production bundle.     |
| `npm run preview`   | Preview the production build locally.           |
| `npm run lint`      | Run ESLint.                                     |
| `npm run typecheck` | Type-check the project without emitting output. |

## How it works

- **Onboarding** — Welcome → Character Creation → Life Setup (choose a life stage).
- **City of Merridian** — explore five districts (Downtown, Residential, Education,
  Commercial, Civic/Health) and enter buildings to make decisions.
- **Month loop** — the top bar's *Advance Month* processes income, taxes, rent,
  transport, living costs, debt interest/payments, and investment growth, then may
  surface a life encounter.
- **Encounters** — `STORY → INFORMATION → DECISION → CONSEQUENCE`. Knowing a concept
  highlights the "smart move" and can unlock better options.
- **Progression** — Financial XP, Life Skills, Challenges, Achievements, an
  XP-based Leaderboard, a Life Timeline, and **What-If mode** comparing life paths.
- **Recovery, not Game Over** — a financial crisis triggers a supportive recovery
  flow instead of ending the game.

## Project structure

```
src/
├── game/            # types, finance engine, content, events, state store
│   ├── engine.ts    # taxes, credit score, compounding, financial health
│   ├── content.ts   # city, jobs, housing, transport, concepts, challenges…
│   ├── events.ts    # STORY→INFO→DECISION→CONSEQUENCE encounters
│   └── store.tsx    # reducer, month loop, persistence, React context
├── ui/              # Layout, Encounter modal, shared components, SVG charts
└── screens/         # Home, City, Money, Invest, Career, Learn, Life,
                     # Challenges, Leaderboard, Profile, What-If, Buildings…
```

## Financial systems modeled

Income & simplified taxes (FICA + federal + state), living/housing/transport
expenses, savings & emergency-fund coverage, credit scores (utilization, payment
history, history length, DTI), loans & amortized minimum payments, APR-driven debt
growth, and a multi-asset investment model (HYSA, bonds, index funds, single stocks,
crypto) with risk/volatility and diversification effects.
