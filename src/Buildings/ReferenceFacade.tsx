import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, Vector3 } from 'three'
import type { BuildingDef } from '../cityLayout'

const paths = {
  small: '/reference-assets/city/Building_Small_1.gltf',
  medium: '/reference-assets/city/Building_Medium_2_001.gltf',
  large: '/reference-assets/city/Building_Large_2.gltf',
} as const

/** Reuses the shared Three.js runtime and cached geometry; each façade is static. */
export function ReferenceFacade({ def }: { def: BuildingDef }) {
  const model = def.w >= 15 || def.h >= 13 ? 'large' : def.w >= 11 || def.h >= 8 ? 'medium' : 'small'
  const { scene } = useGLTF(paths[model])
  const facade = useMemo(() => {
    const copy = scene.clone(true)
    const bounds = new Box3().setFromObject(copy)
    const size = bounds.getSize(new Vector3())
    const center = bounds.getCenter(new Vector3())
    return {
      scene: copy,
      scale: [def.w / Math.max(size.x, 0.01), def.h / Math.max(size.y, 0.01), def.d / Math.max(size.z, 0.01)] as [number, number, number],
      offset: [-center.x, -bounds.min.y, -center.z] as [number, number, number],
    }
  }, [scene, def.w, def.h, def.d])

  return (
    <group position={[def.x, 0, def.z]}>
      <group scale={facade.scale}>
        <primitive object={facade.scene} position={facade.offset} dispose={null} />
      </group>
    </group>
  )
}
