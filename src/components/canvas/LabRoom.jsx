import * as THREE from 'three';
import { EquipmentStorage } from './EquipmentStorage';

/**
 * Scalable Virtual Chemistry Classroom Environment (22m x 24m).
 * Designed for multiplayer virtual classrooms (Class 11-12 practicals).
 * Features:
 * - High-capacity room with generous avatar walking paths
 * - Clear central arterial walkway and cross-aisles
 * - Front teaching wall with large whiteboard, periodic table, and safety posters
 * - Natural daylight windows along right wall
 * - Full modular storage, fume hood, glassware, and emergency safety zones
 */
export function LabRoom() {
  const roomWidth = 22;
  const roomDepth = 24;
  const wallHeight = 4.8;

  return (
    <group name="classroom-room-environment">
      {/* ==================================================================== */}
      {/* FLOOR & WALKING PATH DEMARCATIONS                                    */}
      {/* ==================================================================== */}
      {/* 1. Base Laboratory Floor (Clean high-grade chemical-resistant tiles) */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial
          color="#dbe3eb"
          roughness={0.4}
          metalness={0.04}
        />
      </mesh>

      {/* Floor Tile Grid Seams */}
      <gridHelper
        args={[24, 24, '#94a3b8', '#cbd5e1']}
        position={[0, 0.001, 0]}
      />

      {/* 2. Central Arterial Walkway (Width: 3.2m, from teacher zone to rear door) */}
      <mesh
        position={[0, 0.0015, 1.0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[3.2, 21.0]} />
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.35}
          metalness={0.02}
        />
      </mesh>

      {/* Walkway Subtle Guide Border Lines (Left and Right of central walkway) */}
      <mesh position={[-1.6, 0.002, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.06, 21.0]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[1.6, 0.002, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.06, 21.0]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>

      {/* 3. Front Presentation Cross-Aisle (Width: 3.0m, connecting sides) */}
      <mesh
        position={[0, 0.0016, -5.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[19.0, 2.6]} />
        <meshStandardMaterial color="#eef2f6" roughness={0.38} />
      </mesh>

      {/* 4. Rear Entry & Circulation Area */}
      <mesh
        position={[0, 0.0016, 9.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[19.0, 4.0]} />
        <meshStandardMaterial color="#eef2f6" roughness={0.38} />
      </mesh>

      {/* ==================================================================== */}
      {/* WALLS                                                                */}
      {/* ==================================================================== */}
      {/* Front Teaching Wall (z = -12) */}
      <group position={[0, wallHeight / 2, -roomDepth / 2]}>
        {/* Base Wall Surface */}
        <mesh receiveShadow>
          <planeGeometry args={[roomWidth, wallHeight]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} />
        </mesh>
        {/* Lower Ceramic Tile Splashback & Protective Dado (0 to 2.4m) */}
        <mesh position={[0, -wallHeight / 2 + 1.2, 0.01]} receiveShadow>
          <planeGeometry args={[roomWidth, 2.4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.25} metalness={0.02} />
        </mesh>
        {/* Decorative Teal Dado Trim */}
        <mesh position={[0, -wallHeight / 2 + 2.42, 0.015]}>
          <planeGeometry args={[roomWidth, 0.04]} />
          <meshBasicMaterial color="#0d9488" />
        </mesh>
      </group>

      {/* Rear Entrance Wall (z = +12) */}
      <group position={[0, wallHeight / 2, roomDepth / 2]} rotation={[0, Math.PI, 0]}>
        <mesh receiveShadow>
          <planeGeometry args={[roomWidth, wallHeight]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
        </mesh>
        <mesh position={[0, -wallHeight / 2 + 1.2, 0.01]} receiveShadow>
          <planeGeometry args={[roomWidth, 2.4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0, -wallHeight / 2 + 2.42, 0.015]}>
          <planeGeometry args={[roomWidth, 0.04]} />
          <meshBasicMaterial color="#0d9488" />
        </mesh>
      </group>

      {/* Left Wall: Glassware, Dispensary & Emergency (x = -11) */}
      <group position={[-roomWidth / 2, wallHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh receiveShadow>
          <planeGeometry args={[roomDepth, wallHeight]} />
          <meshStandardMaterial color="#eef2f6" roughness={0.9} />
        </mesh>
        <mesh position={[0, -wallHeight / 2 + 1.2, 0.01]} receiveShadow>
          <planeGeometry args={[roomDepth, 2.4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.25} />
        </mesh>
        <mesh position={[0, -wallHeight / 2 + 2.42, 0.015]}>
          <planeGeometry args={[roomDepth, 0.04]} />
          <meshBasicMaterial color="#0d9488" />
        </mesh>
      </group>

      {/* Right Wall: Daylight Windows & Analytical Balances (x = +11) */}
      <group position={[roomWidth / 2, wallHeight / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh receiveShadow>
          <planeGeometry args={[roomDepth, wallHeight]} />
          <meshStandardMaterial color="#eef2f6" roughness={0.9} />
        </mesh>
        <mesh position={[0, -wallHeight / 2 + 1.2, 0.01]} receiveShadow>
          <planeGeometry args={[roomDepth, 2.4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.25} />
        </mesh>
        <mesh position={[0, -wallHeight / 2 + 2.42, 0.015]}>
          <planeGeometry args={[roomDepth, 0.04]} />
          <meshBasicMaterial color="#0d9488" />
        </mesh>

        {/* 4 Large Classroom Windows (diffused daylight) */}
        {[-7.5, -2.5, 2.5, 7.5].map((wz, wIdx) => (
          <group key={wIdx} position={[wz, 0.5, 0.02]}>
            {/* Window Outer Frame */}
            <mesh>
              <boxGeometry args={[2.6, 2.0, 0.04]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Translucent Window Glass Pane */}
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[2.4, 1.8]} />
              <meshPhysicalMaterial
                color="#e0f2fe"
                roughness={0.1}
                transmission={0.9}
                ior={1.48}
                transparent
                opacity={0.65}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Window Sill */}
            <mesh position={[0, -0.98, 0.06]}>
              <boxGeometry args={[2.7, 0.06, 0.16]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Clean White Ceiling (y = 4.8m) */}
      <mesh
        position={[0, wallHeight, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.95} />
      </mesh>

      {/* ==================================================================== */}
      {/* CEILING RECESSED DAYLIGHT TROFFER LIGHT FIXTURES                     */}
      {/* ==================================================================== */}
      {[
        [-5.0, -8.0], [0, -8.0], [5.0, -8.0],
        [-5.0, -3.0], [0, -3.0], [5.0, -3.0],
        [-5.0, 1.5],  [0, 1.5],  [5.0, 1.5],
        [-5.0, 6.0],  [0, 6.0],  [5.0, 6.0],
        [-5.0, 10.0], [0, 10.0], [5.0, 10.0],
      ].map(([tx, tz], tIdx) => (
        <group key={tIdx} position={[tx, wallHeight - 0.02, tz]}>
          {/* Troffer Frame */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.8, 0.9]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.4} roughness={0.3} />
          </mesh>
          {/* Diffuser Lens (Illuminated) */}
          <mesh position={[0, -0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.65, 0.75]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* ==================================================================== */}
      {/* FRONT TEACHING WALL EQUIPMENT (z = -11.95)                           */}
      {/* ==================================================================== */}
      {/* 1. Large Magnetic Whiteboard / Smart Display (Center) */}
      <group position={[0, 2.5, -11.94]}>
        {/* Aluminum Outer Frame */}
        <mesh>
          <boxGeometry args={[5.8, 2.0, 0.03]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Gloss White Surface */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[5.65, 1.85]} />
          <meshStandardMaterial color="#ffffff" roughness={0.08} metalness={0.02} />
        </mesh>
        {/* Marker & Eraser Tray */}
        <mesh position={[0, -0.98, 0.06]}>
          <boxGeometry args={[5.65, 0.04, 0.09]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
        {/* Heading: Class 11-12 Chemistry Practical Demonstration */}
        <mesh position={[0, 0.8, 0.025]}>
          <planeGeometry args={[3.2, 0.12]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
      </group>

      {/* 2. CBSE Class 11-12 Periodic Table of Elements Chart (Left of Whiteboard) */}
      <group position={[-5.8, 2.5, -11.94]}>
        <mesh>
          <boxGeometry args={[4.4, 2.1, 0.02]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.015]}>
          <planeGeometry args={[4.25, 1.95]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
        {/* Periodic Table Header Band */}
        <mesh position={[0, 0.82, 0.02]}>
          <planeGeometry args={[4.1, 0.18]} />
          <meshBasicMaterial color="#0d9488" />
        </mesh>
        {/* Element grid color blocks */}
        {[-1.6, -0.8, 0, 0.8, 1.6].map((ex, eIdx) => (
          <mesh key={eIdx} position={[ex, 0, 0.02]}>
            <planeGeometry args={[0.7, 1.2]} />
            <meshBasicMaterial color={['#bae6fd', '#bbf7d0', '#fef08a', '#fed7aa', '#fbcfe8'][eIdx]} />
          </mesh>
        ))}
      </group>

      {/* 3. Laboratory Safety & Emergency Protocols Chart (Right of Whiteboard) */}
      <group position={[5.4, 2.5, -11.94]}>
        <mesh>
          <boxGeometry args={[3.2, 2.1, 0.02]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.015]}>
          <planeGeometry args={[3.05, 1.95]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Safety Header Band (Amber/Red) */}
        <mesh position={[0, 0.82, 0.02]}>
          <planeGeometry args={[2.9, 0.18]} />
          <meshBasicMaterial color="#d97706" />
        </mesh>
        {/* Safety Symbol Badges */}
        {[-0.8, 0, 0.8].map((sx, sIdx) => (
          <mesh key={sIdx} position={[sx, 0.2, 0.02]}>
            <circleGeometry args={[0.2, 24]} />
            <meshBasicMaterial color={['#0284c7', '#16a34a', '#dc2626'][sIdx]} />
          </mesh>
        ))}
      </group>

      {/* 4. Classroom Wall Clock (Center above whiteboard) */}
      <group position={[0, 4.0, -11.94]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 32]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <circleGeometry args={[0.27, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Clock Hands */}
        <mesh position={[0, 0.05, 0.03]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.012, 0.16, 0.005]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.04, 0, 0.03]} rotation={[0, 0, -1.8]}>
          <boxGeometry args={[0.008, 0.22, 0.005]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
      </group>

      {/* ==================================================================== */}
      {/* STORAGE, SAFETY & SPECIALIZED APPARATUS BENCHES                      */}
      {/* ==================================================================== */}
      <EquipmentStorage />
    </group>
  );
}
