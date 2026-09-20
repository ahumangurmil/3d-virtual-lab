import * as THREE from 'three';

/**
 * Natural educational laboratory borosilicate glass material.
 * Balanced transmission, realistic refraction, and soft highlights without artificial neon glow.
 */
export function GlassMaterial({ isSelected, isHovered, opacity = 0.35 }) {
  // Gentle tint when focused, keeping the glass natural and transparent
  const baseColor = isSelected ? '#e0f2fe' : isHovered ? '#f0f9ff' : '#f8fafc';

  return (
    <meshPhysicalMaterial
      color={baseColor}
      transparent
      opacity={opacity}
      roughness={0.08}
      metalness={0.02}
      transmission={0.93}
      thickness={0.04}
      ior={1.52} // Standard borosilicate glass index of refraction
      specularIntensity={0.85}
      specularColor="#ffffff"
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

