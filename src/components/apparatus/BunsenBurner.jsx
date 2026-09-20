import { useRef } from 'react';
import * as THREE from 'three';

export function BunsenBurner({
  id,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  isIgnited = false,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) {
  const groupRef = useRef();

  const baseRadius = 0.055;
  const barrelHeight = 0.14;
  const barrelRadius = 0.011;

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1] + (isHovered && !isSelected ? 0.005 : 0), position[2]]}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Heavy Cast Iron Base */}
      <mesh position={[0, 0.008, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[baseRadius * 0.85, baseRadius, 0.016, 24]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.65}
          metalness={0.4}
        />
      </mesh>

      {/* Gas Valve Control Knob Base */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.022, 0.012, 16]} />
        <meshStandardMaterial
          color="#94a3b8"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Air Hole Collar (Rotatable in real life) */}
      <mesh position={[0, 0.038, 0]} castShadow>
        <cylinderGeometry args={[barrelRadius * 1.35, barrelRadius * 1.35, 0.02, 16]} />
        <meshStandardMaterial
          color="#d97706" // Brass collar
          roughness={0.35}
          metalness={0.8}
        />
      </mesh>

      {/* Chimney Barrel (Steel/Nickel) */}
      <mesh position={[0, 0.038 + barrelHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[barrelRadius, barrelRadius, barrelHeight, 24]} />
        <meshStandardMaterial
          color="#cbd5e1"
          roughness={0.3}
          metalness={0.75}
        />
      </mesh>

      {/* Top Barrel Rim */}
      <mesh position={[0, 0.038 + barrelHeight, 0]}>
        <torusGeometry args={[barrelRadius, 0.002, 8, 20]} />
        <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Gas Inlet Port Tube */}
      <mesh position={[-0.032, 0.016, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.005, 0.005, 0.035, 12]} />
        <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Gas Tubing (Rubber hose connecting towards back of bench) */}
      <mesh position={[-0.075, 0.012, -0.06]} rotation={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.012, 0.012, 0.12]} />
        <meshStandardMaterial color="#ea580c" roughness={0.85} /> {/* Safety orange rubber lab hose */}
      </mesh>

      {/* Flame when ignited */}
      {isIgnited && (
        <group position={[0, 0.04 + barrelHeight, 0]}>
          {/* Inner hot blue cone */}
          <mesh position={[0, 0.022, 0]}>
            <coneGeometry args={[0.006, 0.045, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} />
          </mesh>
          {/* Outer luminous faint cone */}
          <mesh position={[0, 0.038, 0]}>
            <coneGeometry args={[0.011, 0.075, 16]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.35} />
          </mesh>
          {/* Gentle point light cast by flame */}
          <pointLight color="#93c5fd" intensity={0.6} distance={1.0} decay={2} position={[0, 0.05, 0]} />
        </group>
      )}

      {/* Bench Ground Indicator for Hover / Selection */}
      {(isSelected || isHovered) && (
        <group position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <circleGeometry args={[baseRadius * 1.35, 32]} />
            <meshBasicMaterial
              color="#0284c7"
              transparent
              opacity={isSelected ? 0.18 : 0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[baseRadius * 1.25, baseRadius * 1.35, 32]} />
            <meshBasicMaterial
              color="#0284c7"
              transparent
              opacity={isSelected ? 0.85 : 0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
