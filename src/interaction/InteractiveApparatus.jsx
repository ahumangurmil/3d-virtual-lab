import { useState, useRef } from 'react';
import * as THREE from 'three';

/**
 * Reusable Interactive Apparatus Wrapper.
 * Encapsulates:
 * - Tabletop positioning & rotation
 * - Subtle hover / target ground highlight ring
 * - Click & pointer handling for mouse and touch interactions
 *
 * Separates interaction presentation from the physical apparatus 3D model.
 */
export function InteractiveApparatus({
  apparatus,
  isTargeted = false,
  isSelected = false,
  isHovered = false,
  isHeld = false,
  onSelect,
  onHover,
  children,
}) {
  const [localHover, setLocalHover] = useState(false);
  const groupRef = useRef();

  // If this apparatus is currently being carried by the player, it is rendered in the player's carry mount
  if (isHeld) {
    return null;
  }

  const isHighlighted = isTargeted || isSelected || isHovered || localHover;
  const [px, py, pz] = apparatus.position || [0, 0, 0];
  const [rx, ry, rz] = apparatus.rotation || [0, 0, 0];

  // Dynamic footprint radius based on apparatus dimensions
  const footprintRadius =
    apparatus.type === 'test_tube_rack'
      ? 0.16
      : apparatus.type === 'burette_50'
      ? 0.12
      : apparatus.type === 'beaker_500'
      ? 0.105
      : apparatus.type === 'bunsen_burner'
      ? 0.085
      : 0.075;

  return (
    <group
      ref={groupRef}
      position={[px, py + (isHighlighted && !isSelected ? 0.003 : 0), pz]}
      rotation={[rx, ry, rz]}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(apparatus.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setLocalHover(true);
        if (onHover) onHover(apparatus.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setLocalHover(false);
        if (onHover) onHover(null);
        document.body.style.cursor = 'default';
      }}
    >
      {/* ================= 1. COUNTERTOP TARGETING & FOCUS HIGHLIGHT ================= */}
      {isHighlighted && (
        <group position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Inner accent ring */}
          <mesh>
            <ringGeometry args={[footprintRadius * 1.05, footprintRadius * 1.2, 32]} />
            <meshBasicMaterial
              color={isSelected ? '#0284c7' : isTargeted ? '#38bdf8' : '#0d9488'}
              transparent
              opacity={isSelected ? 0.95 : isTargeted ? 0.8 : 0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Soft luminous disc glow */}
          <mesh>
            <circleGeometry args={[footprintRadius * 1.05, 32]} />
            <meshBasicMaterial
              color={isSelected ? '#0284c7' : isTargeted ? '#38bdf8' : '#0d9488'}
              transparent
              opacity={isSelected ? 0.18 : isTargeted ? 0.14 : 0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* ================= 2. 3D VISUAL MODEL (CHILD) ================= */}
      {children}
    </group>
  );
}
