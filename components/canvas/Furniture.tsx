'use client'

import { useRef, useState, useMemo, useEffect } from "react"
import { useCursor, TransformControls } from "@react-three/drei"
import { useStore, FurnitureItem } from "@/store/useStore"
import { useGesture } from "@use-gesture/react"
import * as THREE from "three"

// --- GEOMETRIES ---

const ChairGeometry = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.6, 0.1, 0.6]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0, 0.95, -0.25]} castShadow receiveShadow>
      <boxGeometry args={[0.6, 0.8, 0.1]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[-0.25, 0.25, 0.25]} castShadow><cylinderGeometry args={[0.04, 0.03, 0.5]} /><meshStandardMaterial color="#333" /></mesh>
    <mesh position={[0.25, 0.25, 0.25]} castShadow><cylinderGeometry args={[0.04, 0.03, 0.5]} /><meshStandardMaterial color="#333" /></mesh>
    <mesh position={[-0.25, 0.25, -0.25]} castShadow><cylinderGeometry args={[0.04, 0.03, 0.5]} /><meshStandardMaterial color="#333" /></mesh>
    <mesh position={[0.25, 0.25, -0.25]} castShadow><cylinderGeometry args={[0.04, 0.03, 0.5]} /><meshStandardMaterial color="#333" /></mesh>
  </group>
)

const TableGeometry = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.5, 0.1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[-0.6, 0.375, 0.4]} castShadow><cylinderGeometry args={[0.05, 0.04, 0.75]} /><meshStandardMaterial color="#333" /></mesh>
    <mesh position={[0.6, 0.375, 0.4]} castShadow><cylinderGeometry args={[0.05, 0.04, 0.75]} /><meshStandardMaterial color="#333" /></mesh>
    <mesh position={[-0.6, 0.375, -0.4]} castShadow><cylinderGeometry args={[0.05, 0.04, 0.75]} /><meshStandardMaterial color="#333" /></mesh>
    <mesh position={[0.6, 0.375, -0.4]} castShadow><cylinderGeometry args={[0.05, 0.04, 0.75]} /><meshStandardMaterial color="#333" /></mesh>
  </group>
)

const BedGeometry = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0.3, 0.1]} castShadow receiveShadow>
      <boxGeometry args={[1.4, 0.3, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0, 0.6, -0.95]} castShadow receiveShadow>
      <boxGeometry args={[1.6, 1, 0.1]} />
      <meshStandardMaterial color="#cfcfcf" />
    </mesh>
    <mesh position={[0, 0.1, 0.1]} receiveShadow>
      <boxGeometry args={[1.5, 0.2, 2.1]} />
      <meshStandardMaterial color="#333" />
    </mesh>
  </group>
)

const CupboardGeometry = ({ color }: { color: string }) => (
  <group>
    {/* Main Body */}
    <mesh position={[0, 1, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.2, 2, 0.6]} />
      <meshStandardMaterial color={color} />
    </mesh>
    {/* Door Split Line */}
    <mesh position={[0, 1, 0.301]} receiveShadow>
      <boxGeometry args={[0.02, 1.9, 0.01]} />
      <meshStandardMaterial color="#222" />
    </mesh>
    {/* Handles */}
    <mesh position={[-0.08, 1, 0.31]} castShadow>
      <boxGeometry args={[0.02, 0.2, 0.02]} />
      <meshStandardMaterial color="#ddd" />
    </mesh>
    <mesh position={[0.08, 1, 0.31]} castShadow>
      <boxGeometry args={[0.02, 0.2, 0.02]} />
      <meshStandardMaterial color="#ddd" />
    </mesh>
  </group>
)

const RoundTableGeometry = ({ color }: { color: string }) => (
  <group>
    {/* Table Top */}
    <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.6, 0.6, 0.05, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
    {/* Center Leg */}
    <mesh position={[0, 0.375, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.06, 0.75, 16]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    {/* Base Plate */}
    <mesh position={[0, 0.02, 0]} castShadow>
      <cylinderGeometry args={[0.3, 0.3, 0.04, 32]} />
      <meshStandardMaterial color="#333" />
    </mesh>
  </group>
)

const SofaGeometry = ({ color }: { color: string }) => (
  <group>
    {/* Seat Base */}
    <mesh position={[0, 0.2, 0.1]} castShadow receiveShadow>
      <boxGeometry args={[2, 0.3, 0.8]} />
      <meshStandardMaterial color={color} />
    </mesh>
    {/* Backrest */}
    <mesh position={[0, 0.6, -0.2]} castShadow receiveShadow>
      <boxGeometry args={[2, 0.6, 0.2]} />
      <meshStandardMaterial color={color} />
    </mesh>
    {/* Left Armrest */}
    <mesh position={[-0.9, 0.45, 0.1]} castShadow receiveShadow>
      <boxGeometry args={[0.2, 0.5, 0.8]} />
      <meshStandardMaterial color={color} />
    </mesh>
    {/* Right Armrest */}
    <mesh position={[0.9, 0.45, 0.1]} castShadow receiveShadow>
      <boxGeometry args={[0.2, 0.5, 0.8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  </group>
)

// --- MAIN COMPONENT ---

interface Props {
  item: FurnitureItem;
}

export function Furniture({ item }: Props) {
  // Store Hooks
  const selectItem = useStore((state) => state.selectItem);
  const updateFurniture = useStore((state) => state.updateFurniture);
  const setDragging = useStore((state) => state.setDragging);
  const selectedId = useStore((state) => state.selectedId);
  const is2D = useStore((state) => state.is2D);
  const transformMode = useStore((state) => state.transformMode);
  const setZoomEnabled = useStore((state) => state.setZoomEnabled);

  const isSelected = selectedId === item.id;
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  
  // Use specific cursor based on mode
  useCursor(hovered, is2D ? 'move' : 'auto', 'auto');
  
  // 2D Dragging State
  const floorPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const [dragOffset, setDragOffset] = useState<THREE.Vector3 | null>(null);

  // Prevent camera zoom when rotating
  useEffect(() => {
    if (hovered && transformMode === 'rotate') {
      setZoomEnabled(false);
    } else {
      setZoomEnabled(true);
    }
    return () => setZoomEnabled(true);
  }, [hovered, transformMode, setZoomEnabled]);

  const bind = useGesture(
    {
      // DRAG HANDLER (2D Only)
      onDrag: ({ active, event }) => {
        if (!is2D) return; // In 3D, let TransformControls handle it
        
        // Stop drag events from reaching floor
        (event as any).stopPropagation();

        if (active) {
            setDragging(true);
            if (!isSelected) selectItem(item.id);

            const ray = (event as any).ray; 
            const intersect = new THREE.Vector3();

            if (ray) {
                // Find where mouse hits floor
                ray.intersectPlane(floorPlane, intersect);

                if (!dragOffset) {
                    // Start: Calculate offset to prevent jumping
                    const currentPos = new THREE.Vector3(...item.position);
                    setDragOffset(currentPos.clone().sub(intersect));
                } else {
                    // Move: Apply offset
                    const newPos = intersect.add(dragOffset);
                    updateFurniture(item.id, {
                        position: [newPos.x, 0, newPos.z]
                    });
                }
            }
        } else {
            // End
            setDragging(false);
            setDragOffset(null);
        }
      },

      // ROTATE HANDLER (Both Modes)
      onWheel: ({ event, delta }) => {
        if (transformMode !== 'rotate') return; 
        if (!isSelected) return;
        
        const rotationAmount = delta[1] > 0 ? Math.PI / 12 : -Math.PI / 12;
        const newY = item.rotation[1] + rotationAmount;
        
        updateFurniture(item.id, {
          rotation: [item.rotation[0], newY, item.rotation[2]]
        });
      }
    },
    { 
      drag: { filterTaps: true },
      wheel: { eventOptions: { passive: false } } 
    }
  );

  return (
    <group>
      {/* 3D GIZMO ARROWS */}
      {isSelected && !is2D && (
        <TransformControls
          object={groupRef}
          mode={transformMode}
          translationSnap={0.25} 
          rotationSnap={Math.PI / 4}
          onDraggingChanged={(e: any) => setDragging(e.value)} 
          onObjectChange={() => {
            if (groupRef.current) {
              const node = groupRef.current;
              updateFurniture(item.id, {
                position: [node.position.x, node.position.y, node.position.z],
                rotation: [node.rotation.x, node.rotation.y, node.rotation.z],
                scale: [node.scale.x, node.scale.y, node.scale.z],
              });
            }
          }}
        />
      )}

      {/* OBJECT MESH */}
      <group
        ref={groupRef}
        position={new THREE.Vector3(...item.position)}
        rotation={new THREE.Euler(...item.rotation)}
        scale={new THREE.Vector3(...item.scale)}
        {...(bind() as any)} 
        
        // Stop clicks here so they don't hit the floor
        onClick={(e) => {
           e.stopPropagation();
           selectItem(item.id);
        }}
        
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHover(false); }}
      >
        {item.type === 'chair' && <ChairGeometry color={isSelected ? "#ff9900" : item.color} />}
        {item.type === 'table' && <TableGeometry color={isSelected ? "#ff9900" : item.color} />}
        {item.type === 'bed' && <BedGeometry color={isSelected ? "#ff9900" : item.color} />}
        {item.type === 'cupboard' && <CupboardGeometry color={isSelected ? "#ff9900" : item.color} />}
        {item.type === 'round_table' && <RoundTableGeometry color={isSelected ? "#ff9900" : item.color} />}
        {item.type === 'sofa' && <SofaGeometry color={isSelected ? "#ff9900" : item.color} />}
        
        {/* Invisible Hitbox - Made slightly taller to encompass the cupboard */}
        <mesh visible={false} position={[0, 1, 0]}>
            <boxGeometry args={[2.2, 2.2, 2.2]} />
        </mesh>
      </group>
    </group>
  );
}