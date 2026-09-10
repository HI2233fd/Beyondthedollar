# Beyond The Dollar

**Beyond The Dollar** is a nonprofit designed to help teenagers understand
financial life in an engaging, hands-on way. This repository contains the web
app: interactive lessons, a budgeting game, and a quiz that make money skills
stick.

## Tech stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript
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

## Project structure

```
├── index.html              # App entry HTML
├── public/                 # Static assets (favicon)
├── src/
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Page layout & sections
│   ├── data.ts             # Lesson & quiz content
│   ├── index.css           # Global styles / theme
│   └── components/
│       ├── BudgetGame.tsx  # Interactive monthly budget simulator
│       └── Quiz.tsx        # Financial literacy quiz
└── .cursor/environment.json # Cloud Agent environment config
```

## Features

- **Lessons** — six core modules from budgeting basics to investing.
- **Budget game** — allocate a $1,200 monthly income across needs, wants,
  savings, and giving, with live feedback on your savings rate.
- **Quiz** — a short, interactive money-smarts quiz with scoring.
