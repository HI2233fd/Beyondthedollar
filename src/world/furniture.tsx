/** Built-in furniture. These are code meshes, not imported models. */

export function Bed({
  position,
  rotation = 0,
  linen = '#dbe7f5',
  wood = '#6b4428',
}: {
  position: [number, number, number]
  rotation?: number
  linen?: string
  wood?: string
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[1.5, 0.28, 2.15]} />
        <meshStandardMaterial color={wood} roughness={0.8} />
      </mesh>
      {[[-0.62, -0.9], [0.62, -0.9], [-0.62, 0.9], [0.62, 0.9]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.1, z]}>
          <boxGeometry args={[0.08, 0.2, 0.08]} />
          <meshStandardMaterial color="#3f2a1d" />
        </mesh>
      ))}
      <mesh position={[0, 0.48, 0.05]} castShadow>
        <boxGeometry args={[1.42, 0.18, 2.0]} />
        <meshStandardMaterial color={linen} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.62, -0.95]} castShadow>
        <boxGeometry args={[1.5, 0.7, 0.1]} />
        <meshStandardMaterial color={wood} />
      </mesh>
      {[-0.32, 0.32].map((x) => (
        <mesh key={x} position={[x, 0.64, -0.72]} castShadow>
          <boxGeometry args={[0.42, 0.14, 0.28]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}
      <mesh position={[0, 0.58, 0.35]} castShadow>
        <boxGeometry args={[1.38, 0.08, 1.15]} />
        <meshStandardMaterial color="#8fa4bf" roughness={0.85} />
      </mesh>
    </group>
  )
}

export function Sofa({
  position,
  rotation = 0,
  color = '#3d5a73',
}: {
  position: [number, number, number]
  rotation?: number
  color?: string
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[2.2, 0.32, 0.85]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.72, -0.36]} castShadow>
        <boxGeometry args={[2.2, 0.55, 0.16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[-1.02, 1.02].map((x) => (
        <mesh key={x} position={[x, 0.58, 0]} castShadow>
          <boxGeometry args={[0.16, 0.42, 0.85]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.58, 0.05]} castShadow>
          <boxGeometry args={[0.9, 0.12, 0.62]} />
          <meshStandardMaterial color="#d6dde6" />
        </mesh>
      ))}
      {[[-0.9, 0.32], [0.9, 0.32], [-0.9, -0.32], [0.9, -0.32]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.12, z]}>
          <boxGeometry args={[0.08, 0.24, 0.08]} />
          <meshStandardMaterial color="#3f2a1d" />
        </mesh>
      ))}
    </group>
  )
}

const BOOK_COLORS = ['#7f1d1d', '#1e3a5f', '#365314', '#78350f', '#4c1d95', '#0f766e']

export function Shelf({
  position,
  rotation = 0,
  wood = '#6b5344',
}: {
  position: [number, number, number]
  rotation?: number
  wood?: string
}) {
  const shelves = [0.28, 0.78, 1.28, 1.78]
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 1, 0]} castShadow>
          <boxGeometry args={[0.06, 2, 0.36]} />
          <meshStandardMaterial color={wood} />
        </mesh>
      ))}
      {shelves.map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[1.16, 0.05, 0.36]} />
          <meshStandardMaterial color={wood} />
        </mesh>
      ))}
      {shelves.slice(0, 3).map((y, row) =>
        BOOK_COLORS.map((color, i) => (
          <mesh key={`${y}-${i}`} position={[-0.42 + i * 0.16, y + 0.16, 0]} castShadow>
            <boxGeometry args={[0.1, 0.26, 0.22]} />
            <meshStandardMaterial color={i === row ? '#e7e5e4' : color} />
          </mesh>
        )),
      )}
    </group>
  )
}

export function Wardrobe({
  position,
  rotation = 0,
}: {
  position: [number, number, number]
  rotation?: number
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[1.15, 2.05, 0.55]} />
        <meshStandardMaterial color="#5c4636" roughness={0.7} />
      </mesh>
      {[-0.26, 0.26].map((x) => (
        <mesh key={x} position={[x, 1.05, 0.28]}>
          <boxGeometry args={[0.48, 1.85, 0.02]} />
          <meshStandardMaterial color="#7a5b45" />
        </mesh>
      ))}
      {[-0.08, 0.08].map((x) => (
        <mesh key={x} position={[x, 1.05, 0.3]}>
          <boxGeometry args={[0.03, 0.16, 0.03]} />
          <meshStandardMaterial color="#d6d3d1" metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function Counter({
  position,
  rotation = 0,
  width = 2.2,
  top = '#e7e5e4',
  body = '#44403c',
}: {
  position: [number, number, number]
  rotation?: number
  width?: number
  top?: string
  body?: string
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[width, 0.9, 0.7]} />
        <meshStandardMaterial color={body} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[width + 0.06, 0.06, 0.78]} />
        <meshStandardMaterial color={top} roughness={0.35} />
      </mesh>
      {[-width / 4, width / 4].map((x) => (
        <mesh key={x} position={[x, 0.42, 0.36]}>
          <boxGeometry args={[width / 2 - 0.08, 0.62, 0.02]} />
          <meshStandardMaterial color="#292524" />
        </mesh>
      ))}
    </group>
  )
}

export function Fridge({
  position,
  rotation = 0,
}: {
  position: [number, number, number]
  rotation?: number
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.85, 1.95, 0.75]} />
        <meshStandardMaterial color="#e7e5e4" metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.45, 0.38]}>
        <boxGeometry args={[0.78, 0.7, 0.02]} />
        <meshStandardMaterial color="#f5f5f4" />
      </mesh>
      <mesh position={[0, 0.7, 0.38]}>
        <boxGeometry args={[0.78, 0.95, 0.02]} />
        <meshStandardMaterial color="#fafaf9" />
      </mesh>
      <mesh position={[0.28, 1.2, 0.4]}>
        <boxGeometry args={[0.05, 0.35, 0.04]} />
        <meshStandardMaterial color="#44403c" metalness={0.7} />
      </mesh>
    </group>
  )
}

export function Stove({
  position,
  rotation = 0,
}: {
  position: [number, number, number]
  rotation?: number
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.8, 0.85, 0.7]} />
        <meshStandardMaterial color="#292524" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.82, 0.04, 0.72]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>
      {[[-0.18, -0.14], [0.18, -0.14], [-0.18, 0.14], [0.18, 0.14]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.93, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.06, 0.1, 12]} />
          <meshStandardMaterial color="#44403c" />
        </mesh>
      ))}
      <mesh position={[0, 0.45, 0.36]}>
        <boxGeometry args={[0.4, 0.28, 0.02]} />
        <meshStandardMaterial color="#0c0a09" />
      </mesh>
    </group>
  )
}

export function Sink({
  position,
  rotation = 0,
}: {
  position: [number, number, number]
  rotation?: number
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.55, 0.08, 0.4]} />
        <meshStandardMaterial color="#d6d3d1" metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.05, -0.12]}>
        <cylinderGeometry args={[0.02, 0.02, 0.28, 8]} />
        <meshStandardMaterial color="#a8a29e" metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.18, -0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
        <meshStandardMaterial color="#a8a29e" metalness={0.8} />
      </mesh>
    </group>
  )
}

export function EspressoMachine({
  position,
  rotation = 0,
}: {
  position: [number, number, number]
  rotation?: number
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.42, 0.46, 0.36]} />
        <meshStandardMaterial color="#1c1917" metalness={0.65} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.18, 0.16]}>
        <cylinderGeometry args={[0.04, 0.05, 0.08, 10]} />
        <meshStandardMaterial color="#a8a29e" metalness={0.8} />
      </mesh>
      <mesh position={[0.02, 0.08, 0.2]}>
        <cylinderGeometry args={[0.05, 0.045, 0.07, 10]} />
        <meshStandardMaterial color="#f5f5f4" />
      </mesh>
      <mesh position={[0.16, 0.32, 0.1]}>
        <boxGeometry args={[0.02, 0.16, 0.02]} />
        <meshStandardMaterial color="#d6d3d1" metalness={0.7} />
      </mesh>
    </group>
  )
}
