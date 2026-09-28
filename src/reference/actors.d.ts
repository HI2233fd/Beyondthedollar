import type { Group, Object3D } from 'three'
export interface ReferenceActor {
 root: Group
 scene: Object3D
 setAction(name: string, speed?: number): void
 update(dt: number): void
 dispose(): void
}
export function createActor(profile: Record<string, string | undefined>): Promise<ReferenceActor>
