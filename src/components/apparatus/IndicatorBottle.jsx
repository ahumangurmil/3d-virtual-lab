import { useRef } from 'react';

/**
 * Standard 50 mL Laboratory Dropper Reagent Bottle.
 * Amber borosilicate glass container with threaded dropper pipette cap,
 * rubber bulb, label wrap, and indicator solution.
 */
export function IndicatorBottle({
  liquid,
  isSelected = false,
  isHovered = false,
}) {
  const groupRef = useRef();

  const radius = 0.032;
  const bodyHeight = 0.085;
  const neckRadius = 0.014;
  const neckHeight = 0.025;

  const fillRatio = liquid && liquid.maxVolume ? Math.min(Math.max(liquid.volume / liquid.maxVolume, 0), 1) : 0.8;
  const liquidHeight = bodyHeight * 0.85 * fillRatio;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Base selection outline ring */}
      {(isSelected || isHovered) && (
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.05, radius * 1.18, 32]} />
          <meshBasicMaterial color={isSelected ? '#38bdf8' : '#67e8f9'} />
        </mesh>
      )}

      {/* Cylindrical Amber Glass Bottle Body */}
      <mesh position={[0, bodyHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, bodyHeight, 32]} />
        <meshPhysicalMaterial
          color="#78350f"
          roughness={0.15}
          metalness={0.05}
          transmission={0.65}
          thickness={0.05}
          ior={1.54}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Bottle Shoulder / Transition to Neck */}
      <mesh position={[0, bodyHeight + 0.008, 0]} castShadow>
        <cylinderGeometry args={[neckRadius * 1.3, radius, 0.016, 32]} />
        <meshPhysicalMaterial
          color="#78350f"
          roughness={0.15}
          metalness={0.05}
          transmission={0.65}
          thickness={0.05}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Bottle Neck */}
      <mesh position={[0, bodyHeight + 0.016 + neckHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[neckRadius, neckRadius, neckHeight, 24]} />
        <meshPhysicalMaterial
          color="#78350f"
          roughness={0.15}
          metalness={0.05}
          transmission={0.65}
          thickness={0.04}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Internal Liquid Volume */}
      {fillRatio > 0 && (
        <mesh position={[0, liquidHeight / 2 + 0.003, 0]}>
          <cylinderGeometry args={[radius * 0.9, radius * 0.9, liquidHeight, 24]} />
          <meshStandardMaterial
            color={liquid?.color || '#fdf2f8'}
            roughness={0.1}
            transparent
            opacity={0.75}
          />
        </mesh>
      )}

      {/* Reagent Identification Label Wrap */}
      <mesh position={[0, bodyHeight * 0.52, 0]}>
        <cylinderGeometry args={[radius * 1.01, radius * 1.01, bodyHeight * 0.55, 32, 1, true, -Math.PI * 0.65, Math.PI * 1.3]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* Label Text / Stripe */}
      <mesh position={[0, bodyHeight * 0.65, radius * 1.015]}>
        <planeGeometry args={[0.04, 0.008]} />
        <meshBasicMaterial color="#db2777" />
      </mesh>
      <mesh position={[0, bodyHeight * 0.48, radius * 1.015]}>
        <planeGeometry args={[0.045, 0.012]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>

      {/* Screw Cap Collar (Ribbed Plastic) */}
      <mesh position={[0, bodyHeight + 0.016 + neckHeight + 0.008, 0]} castShadow>
        <cylinderGeometry args={[neckRadius * 1.25, neckRadius * 1.25, 0.016, 24]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Dropper Pipette Rubber Bulb */}
      <mesh position={[0, bodyHeight + 0.016 + neckHeight + 0.024, 0]} castShadow>
        <sphereGeometry args={[0.012, 20, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[0, bodyHeight + 0.016 + neckHeight + 0.034, 0]} castShadow>
        <cylinderGeometry args={[0.006, 0.01, 0.01, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
    </group>
  );
}
