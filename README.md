# Beyond The Dollar — 3D Life Simulator

**Beyond The Dollar** is a nonprofit helping teenagers understand financial life in an
engaging way. This repository is a **playable third-person 3D open-world life simulator**:
create a person, explore Merridian, build relationships, work, bank, shop, and see how
choices shape *your* life.

It is a true 3D world — not a dashboard, quiz app, or menu simulator.

## Tech stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript
- [Three.js](https://threejs.org/) via [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei)
- [zustand](https://github.com/pmndrs/zustand) for centralized game state
- ESLint for linting

## Getting started

Requires Node.js 20+ (developed on Node 22) and npm.

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:5173
```

## Controls

- **Click** the scene to capture the mouse (look around)
- **WASD** — move · **Mouse** — rotate the third-person camera
- **E** — interact (enter buildings, talk to NPCs, add groceries, checkout)
- **P** — open / close your phone (life hub)
- **ESC** — close a dialogue / release the mouse

## Connected first loop

1. **Character creation** — name, age, look, life goals
2. **Starter bedroom** → explore home → leave → neighborhood
3. **Meet NPCs** (relationships + memories) · **phone** missions
4. **Personalized opportunity** from your goals
5. **Bank → job interview → paycheck/taxes → grocery/savings**
6. **XP / skills / level** · autosave · **visible locked Downtown (Lv 10)**

## What's in the prototype

- Dense starter district with roads, sidewalks, cars, lights, trees, pedestrians
- Enterable Home (bedroom + living), Bank, Grocery, College, Office
- Phone life hub — missions, goals, people, jobs, bank, invest, skills, map, news, achievements
- Simulation clock, seasons tint, bills, investing, car/home deals, curriculum stations
- localStorage autosave after major actions

## Available scripts

| Script              | Description                                     |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Start the Vite dev server (hot reload).         |
| `npm run build`     | Type-check and build the production bundle.     |
| `npm run preview`   | Preview the production build locally.           |
| `npm run lint`      | Run ESLint.                                     |
| `npm run typecheck` | Type-check the project without emitting output. |

## Architecture

```
src/
├── Game.tsx              # Canvas, scene switching, overlays, lighting
├── GameState.ts          # zustand game + life progression + save
├── life/                 # character creation, missions, XP, downtown, save
├── Player.tsx            # third-person humanoid + movement + interaction
├── ThirdPersonCamera.tsx # follow camera
├── City.tsx              # exterior block + locked Downtown skyline
├── simulation/           # phone, time, investing, scenarios, bills
├── curriculum/           # optional learning stations
└── Interiors/            # Home, Bank, Grocery, College, Office
```

Built for Beyond The Dollar — learn through living.
