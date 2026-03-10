"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  OrthographicCamera,
  Environment,
  Grid,
} from "@react-three/drei";
import { useStore } from "@/store/useStore";

// Components
import { Furniture } from "./Furniture";
import Wall from "./Wall";
import Door from "./Door"; 

export default function Scene() {
  const { 
    room, 
    walls, 
    doors,
    furniture, 
    is2D, 
    isDragging, 
    isZoomEnabled,
    selectItem 
  } = useStore();

  // Ref to track mouse movement for Ghost Click prevention
  const pointerDownPos = useRef({ x: 0, y: 0 });

  return (
    <div className="w-full h-full bg-slate-100 relative">
      <Canvas shadows dpr={[1, 2]} gl={{ preserveDrawingBuffer: true }}>
        
        {/* LIGHTING */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <Environment preset="city" />

        <Suspense fallback={null}>
          
          {/* FLOOR */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -0.01, 0]} 
            receiveShadow
            
            // Record where mouse started
            onPointerDown={(e) => {
               // Only left click (button 0) counts
               if (e.nativeEvent.button === 0) {
                 pointerDownPos.current = { x: e.clientX, y: e.clientY };
               }
            }}

            // Check distance moved on click
            onClick={(e) => {
              e.stopPropagation();

              // Calculate how far mouse moved
              const dx = e.clientX - pointerDownPos.current.x;
              const dy = e.clientY - pointerDownPos.current.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              // If dragged more than 5 pixels (Camera pan or Gizmo drag), ignore click
              if (distance > 5) return;

              // Otherwise, it was a clean click on the floor -> Deselect
              selectItem(null); 
            }}
          >
            <planeGeometry args={[room.width, room.length]} />
            <meshStandardMaterial color={room.floorColor} />
          </mesh>

          {/* SCENE CONTENT */}
          {walls.map((wall) => <Wall key={wall.id} item={wall} />)}
          {doors.map((door) => <Door key={door.id} item={door} />)}
          {furniture.map((item) => <Furniture key={item.id} item={item} />)}

        </Suspense>

        <Grid
          args={[room.width, room.length]} 
          infiniteGrid
          fadeDistance={30}
          sectionColor={is2D ? "#000000" : "#ffffff"}
          cellColor={is2D ? "#cccccc" : "#dddddd"}
        />

        {/* CAMERAS */}
        {is2D ? (
          <OrthographicCamera
            makeDefault
            position={[0, 20, 0]}
            zoom={40}
            rotation={[-Math.PI / 2, 0, 0]}
          />
        ) : (
          <PerspectiveCamera makeDefault position={[5, 10, 10]} fov={50} />
        )}

        {/* CONTROLS */}
        <OrbitControls
          makeDefault
          enableRotate={!is2D && !isDragging} // Lock rotate in 2D or while dragging
          enablePan={!isDragging}             // Lock pan while dragging furniture
          enableZoom={isZoomEnabled}
          maxPolarAngle={Math.PI / 2} 
          minDistance={2}
          maxDistance={50}
        />
      </Canvas>
    </div>
  );
}