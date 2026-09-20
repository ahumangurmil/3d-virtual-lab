import { useRef } from 'react';
import * as THREE from 'three';
import { GlassMaterial } from './GlassMaterial';

export function TestTubeRack({
  id,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  tubes = [],
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) {
  const groupRef = useRef();

  const rackWidth = 0.28;
  const rackDepth = 0.08;
  const rackHeight = 0.14;
  const tubeRadius = 0.012;
  const tubeHeight = 0.14;

  const tubePositions = [
    -0.1, -0.06, -0.02, 0.02, 0.06, 0.1,
  ];

  const rackMaterialColor = '#e2d9cc'; // Warm natural school laboratory wood/polymer tone
  const rackAccentColor = '#0d9488'; // Subtle teal accent trim

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1] + (isHovered && !isSelected ? 0.005 : 0), position[2]]}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (onHover) onHover(id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        if (onHover) onHover(null);
        document.body.style.cursor = 'default';
      }}
    >
      {/* --- RACK STRUCTURE --- */}
      {/* Bottom Base Plate */}
      <mesh position={[0, 0.008, 0]} castShadow receiveShadow>
        <boxGeometry args={[rackWidth, 0.014, rackDepth]} />
        <meshStandardMaterial
          color={rackMaterialColor}
          roughness={0.5}
          metalness={0.05}
        />
      </mesh>

      {/* Base Accent Edge Trim */}
      <mesh position={[0, 0.003, rackDepth / 2 + 0.001]}>
        <boxGeometry args={[rackWidth, 0.005, 0.002]} />
        <meshStandardMaterial color={rackAccentColor} roughness={0.4} />
      </mesh>

      {/* Middle Support Rail */}
      <mesh position={[0, rackHeight * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[rackWidth, 0.01, rackDepth]} />
        <meshStandardMaterial
          color={rackMaterialColor}
          roughness={0.5}
          metalness={0.05}
        />
      </mesh>

      {/* Top Guide Plate */}
      <mesh position={[0, rackHeight, 0]} castShadow receiveShadow>
        <boxGeometry args={[rackWidth, 0.012, rackDepth]} />
        <meshStandardMaterial
          color={rackMaterialColor}
          roughness={0.5}
          metalness={0.05}
        />
      </mesh>

      {/* Left End Pillar */}
      <mesh position={[-rackWidth / 2 + 0.008, rackHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.016, rackHeight, rackDepth]} />
        <meshStandardMaterial color={rackMaterialColor} roughness={0.5} />
      </mesh>

      {/* Right End Pillar */}
      <mesh position={[rackWidth / 2 - 0.008, rackHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.016, rackHeight, rackDepth]} />
        <meshStandardMaterial color={rackMaterialColor} roughness={0.5} />
      </mesh>

      {/* --- 6 TEST TUBES --- */}
      {tubePositions.map((posX, index) => {
        const tubeData = tubes[index] || { color: '#0284c7', volumeRatio: 0.5 };
        const fillHeight = tubeHeight * 0.7 * (tubeData.volumeRatio || 0.5);

        return (
          <group key={index} position={[posX, 0.015, 0]}>
            {/* Tube Glass Wall */}
            <mesh position={[0, tubeHeight / 2, 0]} castShadow>
              <cylinderGeometry args={[tubeRadius, tubeRadius, tubeHeight, 20, 1, true]} />
              <GlassMaterial isSelected={isSelected} isHovered={isHovered} opacity={0.32} />
            </mesh>

            {/* Rounded Hemispherical Bottom */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
              <sphereGeometry args={[tubeRadius, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <GlassMaterial isSelected={isSelected} isHovered={isHovered} opacity={0.4} />
            </mesh>

            {/* Flared Glass Top Rim */}
            <mesh position={[0, tubeHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[tubeRadius * 1.05, 0.002, 8, 16]} />
              <meshStandardMaterial color="#ffffff" roughness={0.12} transparent opacity={0.65} />
            </mesh>

            {/* Liquid Solution */}
            {fillHeight > 0.008 && (
              <group position={[0, fillHeight / 2, 0]}>
                <mesh>
                  <cylinderGeometry
                    args={[tubeRadius * 0.88, tubeRadius * 0.88, fillHeight, 16]}
                  />
                  <meshPhysicalMaterial
                    color={tubeData.color}
                    transparent
                    opacity={0.82}
                    roughness={0.12}
                    transmission={0.5}
                    ior={1.33}
                  />
                </mesh>
                {/* Meniscus */}
                <mesh position={[0, fillHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[tubeRadius * 0.88, 16]} />
                  <meshStandardMaterial color={tubeData.color} roughness={0.08} transparent opacity={0.9} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* Bench Ground Indicator for Hover / Selection */}
      {(isSelected || isHovered) && (
        <group position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <planeGeometry args={[rackWidth * 1.25, rackDepth * 1.4]} />
            <meshBasicMaterial
              color="#0284c7"
              transparent
              opacity={isSelected ? 0.16 : 0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[rackWidth * 0.55, rackWidth * 0.6, 32]} />
            <meshBasicMaterial
              color="#0284c7"
              transparent
              opacity={isSelected ? 0.85 : 0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
