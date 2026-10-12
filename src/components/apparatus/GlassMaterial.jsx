import * as THREE from 'three';

/**
 * Natural educational laboratory borosilicate glass material.
 * Balanced transmission, clearcoat sheen, realistic refraction,
 * and subtle targeting/selection outline glow.
 */
export function GlassMaterial({ isSelected = false, isHovered = false, opacity = 0.48 }) {
  // Gentle highlight tint when targeted or selected
  const baseColor = isSelected ? '#bae6fd' : isHovered ? '#e0f2fe' : '#f8fafc';
  const effectiveOpacity = isSelected ? Math.max(opacity, 0.65) : isHovered ? Math.max(opacity, 0.58) : opacity;

  return (
    <meshPhysicalMaterial
      color={baseColor}
      transparent
      opacity={effectiveOpacity}
      roughness={0.12}
      metalness={0.04}
      transmission={0.86}
      thickness={0.05}
      ior={1.52} // Standard borosilicate glass index of refraction
      reflectivity={0.85}
      clearcoat={0.9}
      clearcoatRoughness={0.08}
      specularIntensity={1.0}
      specularColor="#ffffff"
      emissive={isSelected ? '#0284c7' : isHovered ? '#38bdf8' : '#000000'}
      emissiveIntensity={isSelected ? 0.32 : isHovered ? 0.16 : 0.0}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

