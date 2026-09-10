# Beyond The Dollar — 3D Prototype

**Beyond The Dollar** is a nonprofit helping teenagers understand financial life in an
engaging way. This repository contains a **playable third-person 3D web prototype**:
a real, explorable city block (the city of *Merridian*) where you walk around, enter
buildings, talk to NPCs, make choices, and see financial consequences.

It is a true 3D world — not a dashboard, 2D game, or menu.

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
- **ESC** — close a dialogue / release the mouse

## What's in the prototype

- **One polished city block** — roads, sidewalks, road markings, parked cars,
  streetlights, trees, and NPC pedestrians.
- **Five buildings with clear signs** — Home (Maple Apartments), FirstCity Bank,
  Merridian College, FreshMart Grocery, and Summit Office. Bank, Grocery, College,
  and Office are enterable (press **E** at the door; quick fade transition).
- **Real 3D interiors** with furniture and staff NPCs (teller, counselor, manager,
  cashier).
- **Third-person humanoid** avatar that stands, walks, faces its movement direction,
  and stops on release.
- **Collision** so you can't walk through buildings/walls or leave the block.
- **Reusable interaction + dialogue systems** (proximity prompt, bottom dialogue UI).
- **Grocery shopping** — add items to a cart and pay at checkout (cash updates live).
- **Workplace job** — apply to become an Office Assistant ($16/hr, 15 hrs/week).
- **Bank & College** interactions (savings, deposits, credit info, majors, tuition,
  scholarships).
- **A life event** — after a short time a $700 car repair appears with three outcomes.
- **Minimal HUD** (cash, bank, location) and a **minimap** (no teleporting).

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
├── GameState.ts          # centralized zustand game state + actions
├── Player.tsx            # third-person humanoid + movement + interaction
├── ThirdPersonCamera.tsx # follow camera
├── PointerLook.tsx       # pointer-lock mouse look
├── City.tsx              # exterior block (ground, roads, props, buildings)
├── cityLayout.ts         # building/door/collision definitions
├── collision.ts          # AABB collision helpers
├── InteractionSystem.tsx # reusable proximity interaction registry + prompt
├── DialogueSystem.tsx    # reusable dialogue UI
├── NPC.tsx / Humanoid.tsx / props.tsx
├── GameHUD.tsx / Minimap.tsx / LifeEventSystem.tsx
├── Buildings/Building.tsx
└── Interiors/            # Bank, Grocery, College, Office (+ Room shell)
```

## Initial player state

Cash $500 · Bank $1,500 · Savings $1,000 · Weekly income $0 · Monthly expenses $300 ·
Credit score 650 · Education: High School · Career: Student.
