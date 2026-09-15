import { create } from 'zustand'

export type SceneId = 'city' | 'bank' | 'grocery' | 'college' | 'office'

export interface DialogueOption {
  label: string
  next?: Dialogue
  action?: () => void
  close?: boolean
}

export interface Dialogue {
  name: string
  text: string
  options: DialogueOption[]
}

export interface CartItem {
  id: string
  name: string
  price: number
}

export interface Spawn {
  pos: [number, number, number]
  yaw: number
}

export interface LifeEventOutcome {
  text: string
}

interface GameState {
  // --- Finances / player stats ---
  cash: number
  bank: number
  savings: number
  weeklyIncome: number
  monthlyExpenses: number
  creditScore: number
  debt: number
  education: string
  career: string
  transportationAvailable: boolean

  // --- Scene / navigation ---
  scene: SceneId
  spawn: Spawn | null
  transitioning: boolean

  // --- Interaction / dialogue ---
  prompt: string | null
  dialogue: Dialogue | null

  // --- Grocery ---
  cart: CartItem[]

  // --- Life event ---
  lifeEventActive: boolean
  lifeEventShown: boolean
  lifeEventOutcome: string | null

  // --- flags ---
  hasJob: boolean

  // --- actions ---
  setPrompt: (p: string | null) => void
  openDialogue: (d: Dialogue) => void
  closeDialogue: () => void
  enterScene: (scene: SceneId, spawn: Spawn) => void
  finishTransition: () => void

  deposit: (amount: number) => void
  openSavings: (amount: number) => void
  applyJob: () => void

  addToCart: (item: CartItem) => void
  clearCart: () => void
  checkout: () => number

  triggerLifeEvent: () => void
  resolveLifeEvent: (choice: 'savings' | 'credit' | 'delay') => void
  dismissLifeEventOutcome: () => void
}

export const useGame = create<GameState>((set, get) => ({
  cash: 500,
  bank: 1500,
  savings: 1000,
  weeklyIncome: 0,
  monthlyExpenses: 300,
  creditScore: 650,
  debt: 0,
  education: 'High School',
  career: 'Student',
  transportationAvailable: true,

  scene: 'city',
  spawn: null,
  transitioning: false,

  prompt: null,
  dialogue: null,

  cart: [],

  lifeEventActive: false,
  lifeEventShown: false,
  lifeEventOutcome: null,

  hasJob: false,

  setPrompt: (p) => {
    if (get().prompt !== p) set({ prompt: p })
  },
  openDialogue: (d) => set({ dialogue: d, prompt: null }),
  closeDialogue: () => {
    if (get().dialogue) set({ dialogue: null })
  },

  enterScene: (scene, spawn) => set({ transitioning: true, scene, spawn, dialogue: null, prompt: null }),
  finishTransition: () => set({ transitioning: false }),

  deposit: (amount) => {
    const { cash, bank } = get()
    const amt = Math.min(amount, cash)
    set({ cash: cash - amt, bank: bank + amt })
  },
  openSavings: (amount) => {
    const { cash, savings } = get()
    const amt = Math.min(amount, cash)
    set({ cash: cash - amt, savings: savings + amt })
  },
  applyJob: () =>
    set({ hasJob: true, career: 'Office Assistant', weeklyIncome: 16 * 15 }),

  addToCart: (item) => set({ cart: [...get().cart, item] }),
  clearCart: () => set({ cart: [] }),
  checkout: () => {
    const { cart, cash } = get()
    const total = cart.reduce((s, i) => s + i.price, 0)
    const paid = Math.min(total, cash)
    set({ cash: cash - paid, cart: [] })
    return total
  },

  triggerLifeEvent: () => {
    if (!get().lifeEventShown) set({ lifeEventActive: true, lifeEventShown: true })
  },
  resolveLifeEvent: (choice) => {
    const s = get()
    if (choice === 'savings') {
      set({ savings: Math.max(0, s.savings - 700), lifeEventActive: false, lifeEventOutcome: 'You paid $700 from savings. Your car is repaired and back on the road.' })
    } else if (choice === 'credit') {
      set({ creditScore: s.creditScore - 15, debt: s.debt + 700, lifeEventActive: false, lifeEventOutcome: 'You put the $700 repair on credit. Your car runs again, but your credit score dropped 15 points and you owe $700.' })
    } else {
      set({ transportationAvailable: false, lifeEventActive: false, lifeEventOutcome: 'You delayed the repair. Your car sits in the driveway — transportation is unavailable until you fix it.' })
    }
  },
  dismissLifeEventOutcome: () => set({ lifeEventOutcome: null }),
}))

export const SCENE_LOCATION: Record<SceneId, string> = {
  city: 'City Streets',
  bank: 'FirstCity Bank',
  grocery: 'FreshMart Grocery',
  college: 'Merridian College',
  office: 'Summit Office',
}
