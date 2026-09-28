import { Billboard, Text } from '@react-three/drei'

const districts = [
  { name: 'OAK WALK', color: '#e8c07a', position: [-46, 0, -34] as [number, number, number] },
  { name: 'NORTH CAMPUS', color: '#fca5a5', position: [38, 0, -34] as [number, number, number] },
  { name: 'EAST QUARTER', color: '#7dd3fc', position: [45, 0, 31] as [number, number, number] },
  { name: 'WEST PARK', color: '#86efac', position: [-45, 0, 31] as [number, number, number] },
]

/** Street markers give the existing connected avenue a readable four-neighborhood identity. */
export function DistrictLandmarks() {
  return (
    <group>
      {districts.map((district) => (
        <group key={district.name} position={district.position}>
          <mesh position={[0, 0.06, 0]} receiveShadow>
            <boxGeometry args={[8, 0.12, 5]} />
            <meshStandardMaterial color="#c9c4b7" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <boxGeometry args={[7.4, 0.04, 4.4]} />
            <meshStandardMaterial color="#84907e" roughness={1} />
          </mesh>
          <Billboard position={[0, 1.9, 0]}>
            <Text fontSize={0.85} color={district.color} anchorX="center" anchorY="middle" outlineWidth={0.045} outlineColor="#101820">
              {district.name}
            </Text>
          </Billboard>
          <mesh position={[0, 0.9, -1.7]} castShadow>
            <boxGeometry args={[0.12, 1.4, 0.12]} />
            <meshStandardMaterial color="#4b5563" metalness={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
