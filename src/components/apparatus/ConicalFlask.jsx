import { useRef } from 'react';
import * as THREE from 'three';
import { GlassMaterial } from './GlassMaterial';

export function ConicalFlask({
  id,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  liquid,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) {
  const groupRef = useRef();

  const baseRadius = 0.075;
  const neckRadius = 0.024;
  const bodyHeight = 0.12;
  const neckHeight = 0.06;
  const totalHeight = bodyHeight + neckHeight;

  // Liquid volume ratio
  const fillRatio = liquid && liquid.maxVolume ? Math.min(Math.max(liquid.volume / liquid.maxVolume, 0), 1) : 0;
  const liquidHeight = bodyHeight * 0.9 * fillRatio;
  
  // Calculate top radius of conical liquid based on height
  const liquidTopRadius = baseRadius - ((baseRadius - neckRadius) * (liquidHeight / bodyHeight));

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
      {/* Conical Body */}
      <mesh position={[0, bodyHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[neckRadius, baseRadius, bodyHeight, 32, 1, true]} />
        <GlassMaterial isSelected={isSelected} isHovered={isHovered} />
      </mesh>

      {/* Flat Glass Bottom */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[baseRadius, 32]} />
        <GlassMaterial isSelected={isSelected} isHovered={isHovered} opacity={0.6} />
      </mesh>

      {/* Cylindrical Neck */}
      <mesh position={[0, bodyHeight + neckHeight / 2, 0]}>
        <cylinderGeometry args={[neckRadius, neckRadius, neckHeight, 28, 1, true]} />
        <GlassMaterial isSelected={isSelected} isHovered={isHovered} />
      </mesh>

      {/* Flask Lip Rim */}
      <mesh position={[0, totalHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[neckRadius * 1.05, 0.0025, 10, 24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.12} transparent opacity={0.65} />
      </mesh>

      {/* White Frosted Label Patch (Erlenmeyer write-on area) */}
      <mesh position={[0, bodyHeight * 0.58, baseRadius * 0.55]} rotation={[-0.32, 0, 0]}>
        <planeGeometry args={[0.026, 0.024]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>

      {/* Graduation Volume Markings */}
      {[0.03, 0.055, 0.08, 0.10].map((gh, gidx) => {
        const rAtH = baseRadius - ((baseRadius - neckRadius) * (gh / bodyHeight));
        return (
          <mesh key={gidx} position={[rAtH * 0.98, gh, 0]} rotation={[-0.32, 0, 0]}>
            <planeGeometry args={[0.0015, 0.012]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        );
      })}

      {/* Conical Liquid */}
      {liquidHeight > 0.005 && (
        <group position={[0, liquidHeight / 2, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry
              args={[liquidTopRadius * 0.96, baseRadius * 0.96, liquidHeight, 28]}
            />
            <meshPhysicalMaterial
              color={liquid.color || '#ec4899'}
              transparent
              opacity={0.82}
              roughness={0.1}
              metalness={0.02}
              transmission={0.55}
              ior={1.33}
            />
          </mesh>
          {/* Surface Meniscus */}
          <mesh position={[0, liquidHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[liquidTopRadius * 0.96, 28]} />
            <meshStandardMaterial
              color={liquid.color || '#ec4899'}
              roughness={0.06}
              transparent
              opacity={0.88}
            />
          </mesh>
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
