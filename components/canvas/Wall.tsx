'use client'

import { useRef, useState } from 'react'
import { useStore, WallItem } from '@/store/useStore'
import { TransformControls } from '@react-three/drei'
import * as THREE from 'three'

export default function Wall({ item }: { item: WallItem }) {
  const mesh = useRef<THREE.Group>(null)
  const { selectedId, selectItem, updateWall, transformMode, is2D } = useStore()
  
  const isSelected = selectedId === item.id
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      <group
        ref={mesh}
        position={item.position}
        rotation={item.rotation}
        onClick={(e) => {
          e.stopPropagation()
          selectItem(item.id)
        }}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        {/* THE WALL GEOMETRY */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[item.width, item.height, 0.5]} />
          <meshStandardMaterial 
            color={isSelected ? '#3b82f6' : (isHovered ? '#94a3b8' : item.color)} 
          />
        </mesh>
      </group>

      {/* GIZMO for Moving/Rotating the Wall */}
      {isSelected && !is2D && (
        <TransformControls
          object={mesh}
          mode={transformMode}
          onObjectChange={() => {
            if (mesh.current) {
              updateWall(item.id, {
                position: [mesh.current.position.x, mesh.current.position.y, mesh.current.position.z],
                rotation: [mesh.current.rotation.x, mesh.current.rotation.y, mesh.current.rotation.z],
              })
            }
          }}
        />
      )}
    </>
  )
}