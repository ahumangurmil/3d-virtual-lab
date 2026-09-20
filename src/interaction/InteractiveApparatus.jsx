import { useState, useRef } from 'react';
import { Html } from '@react-three/drei';

/**
 * Reusable Interactive Apparatus Wrapper.
 * Encapsulates:
 * - Tabletop positioning & rotation
 * - Subtle hover / target ground highlight ring
 * - Compact 3D interaction prompt ([E] Inspect, [F] Pick Up)
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
  canPickUp = true,
  onSelect,
  onPickUp,
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

      {/* ================= 3. FLOATING 3D INTERACTION PROMPT ================= */}
      {/* Appears when the player approaches or looks directly at this apparatus */}
      {isTargeted && !isSelected && (
        <Html
          position={[0, (apparatus.height || 0.22) + 0.06, 0]}
          center
          distanceFactor={7.5}
          zIndexRange={[80, 0]}
          style={{ pointerEvents: 'auto', userSelect: 'none' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              padding: '3px 8px',
              borderRadius: '8px',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transform: 'translate3d(0, 0, 0)',
            }}
          >
            {/* Action 1: Inspect */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onSelect) onSelect(apparatus.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                color: '#f8fafc',
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  fontSize: '9px',
                  fontWeight: 700,
                }}
              >
                E
              </span>
              <span>Inspect</span>
            </button>

            {/* Separator */}
            {canPickUp && (
              <span style={{ color: '#475569', fontSize: '10px' }}>•</span>
            )}

            {/* Action 2: Pick Up */}
            {canPickUp && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPickUp) onPickUp(apparatus.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: 'none',
                  color: '#38bdf8',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    background: 'rgba(56, 189, 248, 0.25)',
                    color: '#38bdf8',
                    padding: '1px 4px',
                    borderRadius: '3px',
                    fontSize: '9px',
                    fontWeight: 700,
                  }}
                >
                  F
                </span>
                <span>Pick Up</span>
              </button>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
