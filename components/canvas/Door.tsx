'use client'

import { useStore, DoorItem } from '@/store/useStore'
import { Html } from '@react-three/drei'
import { useState } from 'react'
import * as THREE from 'three'

export default function Door({ item }: { item: DoorItem }) {
  const { walls, selectedId, selectItem } = useStore()
  
  // Find the parent wall to get its position/rotation
  const parentWall = walls.find(w => w.id === item.wallId)
  if (!parentWall) return null

  const isSelected = selectedId === item.id
  
  const wallWidth = parentWall.width
  const startX = -wallWidth / 2
  const localX = startX + item.offset

  // Create a localized grouping that matches the wall's transform
  return (
    <group
      position={parentWall.position}
      rotation={parentWall.rotation}
    >

      <group position={[localX, item.height / 2 - parentWall.height/2 + 0.05, 0.3]}>
        
        {/* HIT BOX (Click to select) */}
        <mesh 
          onClick={(e) => { e.stopPropagation(); selectItem(item.id) }}
        >
          <boxGeometry args={[item.width, item.height, 0.1]} />
          <meshStandardMaterial color={isSelected ? "#3b82f6" : "#475569"} />
        </mesh>

        {/* DOOR FRAME VISUALS */}
        <mesh position={[0, 0, -0.05]}>
           <boxGeometry args={[item.width + 0.1, item.height + 0.1, 0.05]} />
           <meshStandardMaterial color="#334155" />
        </mesh>

        {/* Doorknob */}
        <mesh position={[item.width/2 - 0.1, 0, 0.1]}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color="gold" />
        </mesh>

      </group>
    </group>
  )
}