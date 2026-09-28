import { create } from 'zustand'
import { DEFAULT_BINDINGS, type ControlBindings } from './bindings'

export type { ControlBindings }

interface WorldUi {
  mapOpen: boolean
  calendarOpen: boolean
  bindings: ControlBindings
  guiding: boolean
  guideMessage: string | null
  setMap: (open: boolean) => void
  setCalendar: (open: boolean) => void
  setBindings: (bindings: Partial<ControlBindings> | null | undefined) => void
  setGuiding: (on: boolean) => void
  setGuideMessage: (message: string | null) => void
}

export const useWorldUi = create<WorldUi>((set) => ({
  mapOpen: false,
  calendarOpen: false,
  bindings: { ...DEFAULT_BINDINGS },
  guiding: false,
  guideMessage: null,
  setMap: (mapOpen) => set(mapOpen ? { mapOpen: true, calendarOpen: false } : { mapOpen: false }),
  setCalendar: (calendarOpen) => set(calendarOpen ? { calendarOpen: true, mapOpen: false } : { calendarOpen: false }),
  setBindings: (bindings) =>
    set({
      bindings: { ...DEFAULT_BINDINGS, ...(bindings ?? {}) },
    }),
  setGuiding: (guiding) => set({ guiding }),
  setGuideMessage: (guideMessage) => set({ guideMessage }),
}))

export function guidingNow() {
  return useWorldUi.getState().guiding
}

export function cancelGuide(message?: string) {
  useWorldUi.setState({ guiding: false, guideMessage: message ?? null })
}

