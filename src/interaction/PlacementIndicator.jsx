import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * 3D Placement Indicator & Ghost Hologram.
 * Gives immediate, crisp visual feedback on the benchtop surface:
 * - Emerald Green (#10b981) ring/disc for valid benchtops
 * - Rose Red (#f43f5e) ring/disc for invalid areas
 * (Screen-space prompts are handled compactly in the 2D HUD)
 */
export function PlacementIndicator({ placementState, heldApparatus }) {
  const pulseRef = useRef();

  useFrame((state) => {
    if (pulseRef.current) {
      // Gentle rhythmic pulsation for high visual legibility
      const t = state.clock.getElapsedTime();
      const scale = 1.0 + Math.sin(t * 4.5) * 0.04;
      pulseRef.current.scale.set(scale, scale, 1);
    }
  });

  if (!heldApparatus || !placementState) {
    return null;
  }

  const { isValid, snappedPosition } = placementState;
  const [px, py, pz] = snappedPosition || [0, 0, 0];
  const accentColor = isValid ? '#10b981' : '#f43f5e';

  return (
    <group position={[px, py + 0.003, pz]}>
      {/* ================= 1. PROJECTED TARGET DISC & RING ================= */}
      <group ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Outer Ring */}
        <mesh>
          <ringGeometry args={[0.13, 0.155, 36]} />
          <meshBasicMaterial
            color={accentColor}
            transparent
            opacity={isValid ? 0.85 : 0.75}
          />
        </mesh>

        {/* Inner Guide Disc */}
        <mesh>
          <circleGeometry args={[0.125, 36]} />
          <meshBasicMaterial
            color={accentColor}
            transparent
            opacity={isValid ? 0.16 : 0.12}
          />
        </mesh>

        {/* Four Crosshair Ticks */}
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => (
          <mesh key={i} rotation={[0, 0, angle]}>
            <planeGeometry args={[0.015, 0.04]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
        ))}
      </group>

      {/* ================= 2. APPARATUS HOLOGRAPHIC GHOST FOOTPRINT ================= */}
      {isValid && (
        <group position={[0, 0.04, 0]}>
          <mesh>
            <cylinderGeometry args={[0.065, 0.065, 0.08, 16]} />
            <meshBasicMaterial
              color="#10b981"
              wireframe
              transparent
              opacity={0.35}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
