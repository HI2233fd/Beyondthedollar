import { createContext, useContext } from 'react'
import type { Group } from 'three'
import type { MutableRefObject, RefObject } from 'react'

export interface PlayerRig {
  groupRef: RefObject<Group>
  yaw: MutableRefObject<number>
  pitch: MutableRefObject<number>
  walk: MutableRefObject<number>
  moving: MutableRefObject<boolean>
}

export const RigContext = createContext<PlayerRig | null>(null)

export function useRig(): PlayerRig {
  const ctx = useContext(RigContext)
  if (!ctx) throw new Error('useRig must be used within RigContext')
  return ctx
}
