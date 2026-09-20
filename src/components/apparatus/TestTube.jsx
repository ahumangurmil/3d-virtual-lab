import { useRef } from 'react';
import * as THREE from 'three';
import { GlassMaterial } from './GlassMaterial';

/**
 * Standard 16mm x 150mm Borosilicate Laboratory Test Tube.
 * Includes glass tube, hemispherical bottom, flared rim, reagent liquid,
 * and a compact acrylic support base for stable benchtop placement.
 */
export function TestTube({
  liquid,
  isSelected = false,
  isHovered = false,
}) {
  const groupRef = useRef();

  const radius = 0.018;
  const height = 0.14;
  const bottomRadius = radius;

  // Liquid fill ratio
  const fillRatio = liquid && liquid.maxVolume ? Math.min(Math.max(liquid.volume / liquid.maxVolume, 0), 1) : 0.5;
  const liquidHeight = (height - bottomRadius) * fillRatio;
  const liquidColor = liquid?.color || '#0284c7';

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Mini Acrylic Bench Stand (Keeps individual test tube stable when placed on table) */}
      <mesh position={[0, 0.008, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.038, 0.042, 0.016, 20]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Stand Collar / Holding Ring */}
      <mesh position={[0, 0.024, 0]}>
        <cylinderGeometry args={[0.022, 0.024, 0.016, 20]} />
        <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Main Cylindrical Glass Tube */}
      <mesh position={[0, bottomRadius + (height - bottomRadius) / 2, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, height - bottomRadius, 24, 1, true]} />
        <GlassMaterial isSelected={isSelected} isHovered={isHovered} />
      </mesh>

      {/* Hemispherical Rounded Glass Bottom */}
      <mesh position={[0, bottomRadius, 0]}>
        <sphereGeometry args={[bottomRadius, 20, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <GlassMaterial isSelected={isSelected} isHovered={isHovered} opacity={0.45} />
      </mesh>

      {/* Flared Glass Bead Rim at Top */}
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.06, 0.002, 10, 24]} />
        <meshPhysicalMaterial
          color="#f8fafc"
          transmission={0.9}
          roughness={0.1}
          ior={1.52}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* White Frosted Labeling Patch */}
      <mesh position={[0, height * 0.65, radius + 0.0005]}>
        <planeGeometry args={[0.016, 0.032]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.8}
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Chemical Solution Liquid Column */}
      {fillRatio > 0.02 && (
        <group position={[0, bottomRadius, 0]}>
          {/* Lower Liquid Body (in hemispherical bottom) */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[bottomRadius * 0.94, 18, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshStandardMaterial
              color={liquidColor}
              roughness={0.1}
              transparent
              opacity={0.88}
            />
          </mesh>

          {/* Cylindrical Liquid Body */}
          {liquidHeight > 0.005 && (
            <mesh position={[0, liquidHeight / 2, 0]}>
              <cylinderGeometry args={[radius * 0.93, radius * 0.93, liquidHeight, 20]} />
              <meshStandardMaterial
                color={liquidColor}
                roughness={0.15}
                transparent
                opacity={0.85}
              />
            </mesh>
          )}

          {/* Meniscus Top Surface */}
          <mesh position={[0, liquidHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[radius * 0.92, 20]} />
            <meshStandardMaterial
              color={liquidColor}
              roughness={0.08}
              transparent
              opacity={0.92}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
