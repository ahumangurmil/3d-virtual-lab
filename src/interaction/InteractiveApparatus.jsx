import { useState, useRef } from 'react';

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
      {/* ================= 1. SUBTLE COUNTERTOP HIGHLIGHT RING ================= */}
      {isHighlighted && (
        <group position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Inner accent ring */}
          <mesh>
            <ringGeometry args={[0.09, 0.115, 32]} />
            <meshBasicMaterial
              color={isSelected ? '#0284c7' : '#0d9488'}
              transparent
              opacity={isSelected ? 0.85 : 0.65}
            />
          </mesh>
          {/* Soft luminous disc glow */}
          <mesh>
            <circleGeometry args={[0.09, 32]} />
            <meshBasicMaterial
              color={isSelected ? '#0284c7' : '#0d9488'}
              transparent
              opacity={0.12}
            />
          </mesh>
        </group>
      )}

      {/* ================= 2. 3D VISUAL MODEL (CHILD) ================= */}
      {children}
    </group>
  );
}
