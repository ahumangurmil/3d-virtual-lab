import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { GlassMaterial } from './GlassMaterial';

export function Beaker({
  id,
  type = 'beaker_250',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  liquid,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) {
  const groupRef = useRef();

  const is500 = type === 'beaker_500';
  const radius = is500 ? 0.08 : 0.06;
  const height = is500 ? 0.16 : 0.12;

  // Calculate liquid fill level
  const fillRatio = liquid && liquid.maxVolume ? Math.min(Math.max(liquid.volume / liquid.maxVolume, 0), 1) : 0;
  const liquidHeight = height * 0.85 * fillRatio;
  const liquidRadius = radius * 0.94;

  // Graduation line heights
  const graduationMarks = useMemo(() => {
    const marks = [];
    const stepCount = is500 ? 5 : 4;
    for (let i = 1; i <= stepCount; i++) {
      marks.push({
        y: (height * 0.8 / (stepCount + 1)) * i,
        width: i % 2 === 0 ? 0.018 : 0.012,
      });
    }
    return marks;
  }, [is500, height]);

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
      {/* Outer Glass Wall */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 0.98, height, 32, 1, true]} />
        <GlassMaterial isSelected={isSelected} isHovered={isHovered} />
      </mesh>

      {/* Glass Bottom */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[radius * 0.98, 32]} />
        <GlassMaterial isSelected={isSelected} isHovered={isHovered} opacity={0.6} />
      </mesh>

      {/* Top Rim Lip */}
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.0025, 10, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.12}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Pouring Spout Characteristic Notch */}
      <mesh position={[0, height - 0.004, radius + 0.006]} rotation={[0.4, 0, 0]}>
        <coneGeometry args={[0.012, 0.018, 12, 1, true]} />
        <meshStandardMaterial color="#ffffff" roughness={0.12} transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>

      {/* White Frosted Marking Patch (Classic School Lab Glassware) */}
      <mesh position={[0, height * 0.55, radius * 0.99]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.024, 0.035]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>

      {/* Graduation Marks */}
      {graduationMarks.map((mark, index) => (
        <mesh key={index} position={[radius * 0.99, mark.y, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.0015, mark.width]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.75} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Chemical Liquid */}
      {liquidHeight > 0.005 && (
        <group position={[0, liquidHeight / 2, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[liquidRadius, liquidRadius, liquidHeight, 28]} />
            <meshPhysicalMaterial
              color={liquid.color || '#0284c7'}
              transparent
              opacity={0.8}
              roughness={0.12}
              metalness={0.02}
              transmission={0.55}
              ior={1.33} // Water refractive index
            />
          </mesh>
          {/* Meniscus surface */}
          <mesh position={[0, liquidHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[liquidRadius, 28]} />
            <meshStandardMaterial
              color={liquid.color || '#0284c7'}
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
          {/* Subtle soft grounding disc */}
          <mesh>
            <circleGeometry args={[radius * 1.35, 32]} />
            <meshBasicMaterial
              color="#0284c7"
              transparent
              opacity={isSelected ? 0.18 : 0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Clean target outline ring */}
          <mesh>
            <ringGeometry args={[radius * 1.25, radius * 1.35, 32]} />
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
