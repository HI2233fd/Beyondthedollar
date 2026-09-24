/// <reference types="vite/client" />

import type { useGame } from './GameState'

declare global {
  interface Window {
    /** Dev/review hook to the live Zustand store (set in Game). */
    __useGame?: typeof useGame
  }
}

export {}
