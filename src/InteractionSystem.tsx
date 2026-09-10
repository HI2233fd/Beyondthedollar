import { useEffect } from 'react'
import { Vector3 } from 'three'
import { useGame, type SceneId } from './GameState'

export interface Interactable {
  id: string
  scene: SceneId
  position: [number, number, number]
  radius: number
  prompt: string
  onInteract: () => void
}

const registry = new Map<string, Interactable>()

export function registerInteractable(i: Interactable) {
  registry.set(i.id, i)
}
export function unregisterInteractable(id: string) {
  registry.delete(id)
}

const tmp = new Vector3()

export function findNearest(playerPos: Vector3, scene: SceneId): Interactable | null {
  let best: Interactable | null = null
  let bestDist = Infinity
  for (const i of registry.values()) {
    if (i.scene !== scene) continue
    tmp.set(i.position[0], i.position[1], i.position[2])
    const d = tmp.distanceTo(playerPos)
    if (d <= i.radius && d < bestDist) {
      bestDist = d
      best = i
    }
  }
  return best
}

let counter = 0

/** Register a proximity interactable for the lifetime of the component. */
export function useInteractable(config: Omit<Interactable, 'id'> & { id?: string }) {
  const { scene, radius, prompt, onInteract } = config
  const px = config.position[0]
  const py = config.position[1]
  const pz = config.position[2]
  useEffect(() => {
    const id = config.id ?? `it-${counter++}`
    registerInteractable({ id, scene, position: [px, py, pz], radius, prompt, onInteract })
    return () => unregisterInteractable(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, px, py, pz, radius, prompt, onInteract])
}

export function InteractionPrompt() {
  const prompt = useGame((s) => s.prompt)
  const dialogue = useGame((s) => s.dialogue)
  if (!prompt || dialogue) return null
  return (
    <div className="interact-prompt">
      <span className="key">E</span> {prompt}
    </div>
  )
}
