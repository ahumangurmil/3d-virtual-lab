import { useState } from 'react';
import * as THREE from 'three';

/**
 * Reusable Laboratory Workstation Component.
 * Can be deployed as a Student Workstation or a Teacher Demonstration Workstation.
 * Scalable, modular, and ready for multiplayer avatars.
 */
export function Workstation({
  id,
  stationNumber,
  title,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 2.8,
  depth = 1.3,
  height = 0.9,
  isTeacher = false,
  hasSink = true,
  hasGas = true,
  hasReagentRack = true,
  isSelected = false,
  onSelectStation,
  children,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const topThickness = 0.04;
  const legRadius = 0.024;

  // Visual tones
  const counterColor = isTeacher ? '#f1f5f9' : '#e2e8f0';
  const edgeTrimColor = isTeacher ? '#0284c7' : '#94a3b8';
  const accentColor = isTeacher ? '#0284c7' : '#0d9488';

  return (
    <group
      name={id}
      userData={{ stationId: id, title }}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
      }}
      onClick={(e) => {
        // If clicking table structure itself, trigger workstation selection
        e.stopPropagation();
        if (onSelectStation) {
          onSelectStation(id);
        }
      }}
    >
      {/* ================= WORKSTATION FLOOR FOOTPRINT / ZONING ================= */}
      {/* Subtle floor demarcation pad defining student/teacher workstation boundary */}
      <mesh
        position={[0, 0.002, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width + 0.8, depth + 1.2]} />
        <meshBasicMaterial
          color={isTeacher ? '#0284c7' : '#0d9488'}
          transparent
          opacity={isSelected ? 0.14 : isHovered ? 0.08 : 0.03}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Safety demarcation border around station boundary */}
      {(isSelected || isHovered) && (
        <lineSegments position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <edgesGeometry
            args={[new THREE.PlaneGeometry(width + 0.8, depth + 1.2)]}
          />
          <lineBasicMaterial
            color={isTeacher ? '#0284c7' : '#0d9488'}
            transparent
            opacity={isSelected ? 0.6 : 0.3}
          />
        </lineSegments>
      )}

      {/* ================= COUNTERTOP ================= */}
      <mesh
        position={[0, height + topThickness / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, topThickness, depth]} />
        <meshStandardMaterial
          color={counterColor}
          roughness={0.28}
          metalness={0.06}
        />
      </mesh>

      {/* Countertop Protective Beveled Edge Trim */}
      <mesh position={[0, height + topThickness / 2, depth / 2 + 0.004]}>
        <boxGeometry args={[width + 0.015, topThickness + 0.008, 0.008]} />
        <meshStandardMaterial color={edgeTrimColor} roughness={0.4} />
      </mesh>
      <mesh position={[0, height + topThickness / 2, -depth / 2 - 0.004]}>
        <boxGeometry args={[width + 0.015, topThickness + 0.008, 0.008]} />
        <meshStandardMaterial color={edgeTrimColor} roughness={0.4} />
      </mesh>

      {/* ================= BENCH FRAME & LEGS (BRUSHED ALUMINUM) ================= */}
      {[
        [-width / 2 + 0.08, depth / 2 - 0.08],
        [width / 2 - 0.08, depth / 2 - 0.08],
        [-width / 2 + 0.08, -depth / 2 + 0.08],
        [width / 2 - 0.08, -depth / 2 + 0.08],
      ].map(([lx, lz], idx) => (
        <group key={idx} position={[lx, height / 2, lz]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[legRadius, legRadius, height, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Leveling foot pad */}
          <mesh position={[0, -height / 2 + 0.012, 0]}>
            <cylinderGeometry args={[legRadius * 1.3, legRadius * 1.3, 0.024, 16]} />
            <meshStandardMaterial color="#475569" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Cross support rails */}
      <mesh position={[0, 0.15, depth / 2 - 0.08]}>
        <boxGeometry args={[width - 0.16, 0.02, 0.02]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.15, -depth / 2 + 0.08]}>
        <boxGeometry args={[width - 0.16, 0.02, 0.02]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ================= UNDER-BENCH MODULAR STORAGE ================= */}
      {/* Left drawer unit */}
      <group position={[-width / 2 + 0.45, (height - 0.08) / 2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.7, height - 0.08, depth - 0.22]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.45} />
        </mesh>
        {/* Drawer handles */}
        <mesh position={[0, (height - 0.08) * 0.25, (depth - 0.22) / 2 + 0.006]}>
          <boxGeometry args={[0.3, 0.014, 0.012]} />
          <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, -(height - 0.08) * 0.15, (depth - 0.22) / 2 + 0.006]}>
          <boxGeometry args={[0.3, 0.014, 0.012]} />
          <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.3} />
        </mesh>
      </group>

      {/* ================= STATION IDENTIFIER BADGE ================= */}
      {/* Front mounted station nameplate with clear visual identification */}
      <group position={[0, height + topThickness + 0.06, depth / 2 + 0.002]}>
        {/* Plaque backplate */}
        <mesh castShadow>
          <boxGeometry args={[isTeacher ? 0.72 : 0.52, 0.08, 0.01]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Border accent */}
        <mesh position={[0, 0, 0.006]}>
          <planeGeometry args={[isTeacher ? 0.7 : 0.5, 0.074]} />
          <meshBasicMaterial color={isTeacher ? '#0284c7' : '#0d9488'} />
        </mesh>
        {/* Inner white tag */}
        <mesh position={[0, 0, 0.008]}>
          <planeGeometry args={[isTeacher ? 0.67 : 0.47, 0.062]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Station Number Indicator Spot */}
        <mesh position={[- (isTeacher ? 0.26 : 0.17), 0, 0.01]}>
          <circleGeometry args={[0.022, 24]} />
          <meshBasicMaterial color={isTeacher ? '#0284c7' : '#0d9488'} />
        </mesh>
        {/* Visual Dots for Student Station Number */}
        {!isTeacher && typeof stationNumber === 'number' && (
          <group position={[-0.08, 0, 0.01]}>
            {Array.from({ length: Math.min(stationNumber, 8) }).map((_, idx) => (
              <mesh key={idx} position={[idx * 0.035, 0, 0]}>
                <circleGeometry args={[0.008, 16]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>
            ))}
          </group>
        )}
      </group>

      {/* ================= UTILITY SERVICES: SINK & WATER TAP ================= */}
      {hasSink && (
        <group position={[width / 2 - 0.35, height + topThickness, 0]}>
          {/* Porcelain Cup Sink */}
          <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <ringGeometry args={[0.11, 0.14, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.11, 0.09, 0.1, 24, 1, true]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.09, 24]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
          </mesh>
          {/* Swan-neck Cold Water Tap */}
          <mesh position={[0, 0.12, -0.09]} castShadow>
            <cylinderGeometry args={[0.009, 0.009, 0.22, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.23, -0.04]} rotation={[Math.PI / 4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.1, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      )}

      {/* ================= UTILITY SERVICES: GAS TURRET ================= */}
      {hasGas && (
        <group position={[-width / 2 + 0.35, height + topThickness, -depth / 2 + 0.22]}>
          {/* Brass gas turret column */}
          <mesh position={[0, 0.04, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.016, 0.08, 12]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Dual gas outlets */}
          <mesh position={[0, 0.065, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.007, 0.007, 0.065, 12]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.25} />
          </mesh>
        </group>
      )}

      {/* ================= REAGENT BOTTLE RACK ================= */}
      {hasReagentRack && (
        <group position={[0, height + topThickness, -depth / 2 + 0.15]}>
          {/* Shelf board */}
          <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
            <boxGeometry args={[width * 0.55, 0.016, 0.16]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
          </mesh>
          {/* Shelf metal risers */}
          {[-width * 0.24, width * 0.24].map((rx, rIdx) => (
            <mesh key={rIdx} position={[rx, 0.035, 0]} castShadow>
              <cylinderGeometry args={[0.006, 0.006, 0.07, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
          {/* Reagent bottles on shelf */}
          {[
            { x: -width * 0.18, color: '#f59e0b', amber: true },
            { x: -width * 0.09, color: '#0284c7', amber: false },
            { x: 0, color: '#10b981', amber: false },
            { x: width * 0.09, color: '#8b5cf6', amber: true },
            { x: width * 0.18, color: '#ec4899', amber: true },
          ].map((bot, bIdx) => (
            <group key={bIdx} position={[bot.x, 0.08, 0]}>
              <mesh position={[0, 0.045, 0]} castShadow>
                <cylinderGeometry args={[0.024, 0.024, 0.075, 14]} />
                <meshStandardMaterial
                  color={bot.amber ? '#92400e' : '#f8fafc'}
                  roughness={bot.amber ? 0.3 : 0.12}
                  transparent={!bot.amber}
                  opacity={bot.amber ? 0.88 : 0.6}
                />
              </mesh>
              <mesh position={[0, 0.09, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.02, 14]} />
                <meshStandardMaterial color="#334155" roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.045, 0.025]}>
                <planeGeometry args={[0.03, 0.035]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* ================= LAB STOOLS (MODERN ERGONOMIC) ================= */}
      {/* 2 Stools in front of the bench, positioned with ample walking room */}
      {!isTeacher &&
        [-width * 0.28, width * 0.28].map((sx, sIdx) => (
          <group key={sIdx} position={[sx, 0, depth / 2 + 0.38]}>
            {/* Stool seat cushion */}
            <mesh position={[0, 0.62, 0]} castShadow>
              <cylinderGeometry args={[0.17, 0.17, 0.045, 24]} />
              <meshStandardMaterial color="#0d9488" roughness={0.5} />
            </mesh>
            {/* Chrome support column */}
            <mesh position={[0, 0.32, 0]} castShadow>
              <cylinderGeometry args={[0.016, 0.016, 0.58, 16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Stool footrest ring */}
            <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.13, 0.008, 8, 20]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Base spider legs */}
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.02, 0.22, 0.03, 5]} />
              <meshStandardMaterial color="#334155" roughness={0.5} />
            </mesh>
          </group>
        ))}

      {/* ================= MOUNTED APPARATUS & EQUIPMENT ================= */}
      <group position={[0, 0, 0]}>{children}</group>
    </group>
  );
}
