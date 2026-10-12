import { useRef } from 'react';
import { GlassMaterial } from './GlassMaterial';

/**
 * Standard 25 mL Volumetric Transfer Pipette.
 * Class A borosilicate glassware with central expansion bulb, calibration line,
 * delivery jet nozzle, top suction bulb, and a sturdy bench support rest.
 */
export function Pipette({
  liquid,
  isSelected = false,
  isHovered = false,
}) {
  const groupRef = useRef();

  const stemRadius = 0.006;
  const bulbRadius = 0.022;

  // Liquid level
  const fillRatio = liquid && liquid.maxVolume ? Math.min(Math.max(liquid.volume / liquid.maxVolume, 0), 1) : 0;
  const liquidColor = liquid?.color || '#f1f5f9';

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Bench Pipette Rest (Stable weighted stand holding pipette at 70° angle) */}
      <mesh position={[0, 0.01, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.07, 0.02, 0.12]} />
        <meshStandardMaterial
          color={isSelected ? '#1e3a5f' : '#334155'}
          roughness={0.5}
          metalness={0.2}
          emissive={isSelected ? '#0284c7' : isHovered ? '#38bdf8' : '#000000'}
          emissiveIntensity={isSelected ? 0.25 : isHovered ? 0.12 : 0}
        />
      </mesh>
      <mesh position={[0, 0.04, 0.02]} receiveShadow castShadow>
        <boxGeometry args={[0.04, 0.06, 0.02]} />
        <meshStandardMaterial
          color={isSelected ? '#2563eb' : '#475569'}
          roughness={0.4}
          metalness={0.3}
          emissive={isSelected ? '#0284c7' : isHovered ? '#38bdf8' : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : isHovered ? 0.1 : 0}
        />
      </mesh>
      {/* Pipette cradle notch */}
      <mesh position={[0, 0.07, 0.02]}>
        <cylinderGeometry args={[0.012, 0.012, 0.05, 12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* Tilted Pipette Assembly */}
      <group position={[0, 0.12, -0.01]} rotation={[-0.2, 0, 0]}>
        {/* Lower Delivery Stem */}
        <mesh position={[0, -0.07, 0]} castShadow>
          <cylinderGeometry args={[stemRadius, stemRadius * 0.5, 0.1, 16, 1, true]} />
          <GlassMaterial isSelected={isSelected} isHovered={isHovered} opacity={0.48} />
        </mesh>

        {/* Lower stem liquid if filled */}
        {fillRatio > 0 && (
          <mesh position={[0, -0.07, 0]}>
            <cylinderGeometry args={[stemRadius * 0.82, stemRadius * 0.42, 0.098, 14]} />
            <meshStandardMaterial
              color={liquidColor}
              roughness={0.15}
              transparent
              opacity={0.88}
              emissive={liquidColor}
              emissiveIntensity={0.06}
            />
          </mesh>
        )}

        {/* Central Volumetric Bulb */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[bulbRadius, 24, 16]} />
          <GlassMaterial isSelected={isSelected} isHovered={isHovered} opacity={0.4} />
        </mesh>

        {/* Liquid inside bulb if present */}
        {fillRatio > 0 && (
          <mesh position={[0, -bulbRadius * (1 - fillRatio) * 0.5, 0]}>
            <sphereGeometry args={[bulbRadius * 0.94 * Math.min(1, fillRatio * 1.15), 18, 16]} />
            <meshStandardMaterial
              color={liquidColor}
              roughness={0.12}
              transparent
              opacity={0.9}
              emissive={liquidColor}
              emissiveIntensity={0.08}
            />
          </mesh>
        )}

        {/* Upper Suction Stem */}
        <mesh position={[0, 0.07, 0]} castShadow>
          <cylinderGeometry args={[stemRadius, stemRadius, 0.1, 16, 1, true]} />
          <GlassMaterial isSelected={isSelected} isHovered={isHovered} opacity={0.48} />
        </mesh>

        {/* Calibration Ring Etching (25 mL mark) */}
        <mesh position={[0, 0.08, 0]}>
          <torusGeometry args={[stemRadius * 1.05, 0.0009, 8, 20]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* Top Rubber Pipette Filler / Bulb */}
        <mesh position={[0, 0.13, 0]} castShadow>
          <sphereGeometry args={[0.016, 16, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.145, 0]} castShadow>
          <cylinderGeometry args={[0.006, 0.01, 0.015, 16]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
