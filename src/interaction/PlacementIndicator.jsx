import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

/**
 * 3D Placement Indicator & Ghost Hologram.
 * Gives immediate, crisp visual feedback when carrying an apparatus:
 * - Emerald Green (#10b981) for valid benchtops with prompt "[F] Place on Bench"
 * - Rose Red (#f43f5e) for invalid areas (floor, walls, air, or overlapping equipment)
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

  const { isValid, snappedPosition, surfaceName, reason } = placementState;
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

      {/* ================= 3. FLOATING STATUS BADGE ================= */}
      <Html
        position={[0, 0.22, 0]}
        center
        distanceFactor={8}
        zIndexRange={[90, 0]}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            transform: 'translate3d(0, 0, 0)',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isValid ? 'rgba(6, 78, 59, 0.92)' : 'rgba(136, 19, 55, 0.92)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              border: `1px solid ${accentColor}`,
              borderRadius: '8px',
              padding: '4px 10px',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            {/* Status icon dot */}
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: accentColor,
                boxShadow: `0 0 6px ${accentColor}`,
                display: 'inline-block',
              }}
            />

            {isValid ? (
              <>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.22)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '10px',
                  }}
                >
                  F
                </span>
                <span>Place on {surfaceName}</span>
              </>
            ) : (
              <span>{reason || 'Invalid Placement Surface'}</span>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}
