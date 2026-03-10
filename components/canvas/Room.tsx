import { useStore } from '@/store/useStore'
import { DoubleSide } from 'three'

export function Room() {
  // Connect to Zustand store for reactive updates
  const { width, length, floorColor, wallColor } = useStore((state) => state.room)

  return (
    <group>
      {/* The Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      {/* The Walls */}
      {/* Back Wall */}
      <mesh position={[0, 2.5, -length / 2]} receiveShadow castShadow>
        <boxGeometry args={[width, 5, 0.2]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-width / 2, 2.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 5, length]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[width / 2, 2.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 5, length]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
    </group>
  )
}