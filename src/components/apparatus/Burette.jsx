import { useRef } from 'react';
import * as THREE from 'three';
import { GlassMaterial } from './GlassMaterial';

/**
 * 50 mL Class 11–12 Titration Burette with Retort Stand Assembly.
 * Includes heavy cast iron base, vertical rod, clamp with bosshead,
 * graduated glass barrel, PTFE stopcock, delivery jet, and reagent solution.
 */
export function Burette({
  liquid = {
    volume: 38,
    maxVolume: 50,
    color: '#38bdf8',
    name: '0.1 M NaOH Solution',
  },
  isSelected = false,
  isHovered = false,
}) {
  const groupRef = useRef();

  // Retort Stand geometry
  const baseWidth = 0.18;
  const baseDepth = 0.13;
  const rodHeight = 0.64;
  const rodRadius = 0.0055;

  // Burette tube geometry
  const buretteRadius = 0.012;
  const buretteLength = 0.48;
  const clampHeight = 0.28;
  const buretteY = 0.12; // Bottom of jet relative to table

  // Liquid level (0 mL is at the top, 50 mL is at the bottom in a real burette!)
  const maxVol = liquid?.maxVolume || 50;
  const currentVol = liquid?.volume !== undefined ? liquid.volume : 35;
  const fillRatio = Math.min(Math.max(currentVol / maxVol, 0), 1);
  const liquidHeight = buretteLength * fillRatio;
  const liquidColor = liquid?.color || '#38bdf8';

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* ================= 1. HEAVY CAST-IRON RETORT STAND ================= */}
      {/* Base Plate */}
      <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
        <boxGeometry args={[baseWidth, 0.02, baseDepth]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.65}
          metalness={0.4}
        />
      </mesh>

      {/* Upright Steel Rod (Mounted off-center towards back-left of base) */}
      <mesh position={[-0.05, 0.02 + rodHeight / 2, -0.03]} castShadow>
        <cylinderGeometry args={[rodRadius, rodRadius, rodHeight, 16]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.25} metalness={0.85} />
      </mesh>

      {/* Rod Top Cap */}
      <mesh position={[-0.05, 0.02 + rodHeight, -0.03]}>
        <sphereGeometry args={[rodRadius * 1.2, 12, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} />
      </mesh>

      {/* ================= 2. BOSSHEAD & TWO-PRONG CLAMP ================= */}
      <group position={[-0.05, clampHeight, -0.03]}>
        {/* Bosshead Body */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.026, 0.032, 0.026]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.5} />
        </mesh>

        {/* Tightening Screws */}
        <mesh position={[-0.018, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.003, 0.003, 0.016, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, -0.018]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.016, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>

        {/* Extension Arm reaching forward towards burette position */}
        <mesh position={[0.03, 0, 0.03]} rotation={[0, -Math.PI / 4, 0]}>
          <boxGeometry args={[0.008, 0.01, 0.08]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Clamp Prongs holding the glass tube */}
        <group position={[0.05, 0, 0.05]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[buretteRadius * 1.15, 0.0035, 8, 20, Math.PI * 1.4]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.6} /> {/* Red rubber/cork jaw pads */}
          </mesh>
        </group>
      </group>

      {/* ================= 3. BURETTE GLASS ASSEMBLY ================= */}
      {/* Positioned directly over the base plate center */}
      <group position={[0, buretteY, 0]}>
        {/* Dispensing Tapered Jet Tip (bottom) */}
        <mesh position={[0, 0.025, 0]}>
          <cylinderGeometry args={[0.002, 0.0012, 0.04, 16]} />
          <GlassMaterial isSelected={isSelected} isHovered={isHovered} opacity={0.6} />
        </mesh>

        {/* PTFE / Teflon Stopcock Valve Body */}
        <group position={[0, 0.06, 0]}>
          {/* Glass Valve Barrel */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.03, 16]} />
            <GlassMaterial isSelected={isSelected} isHovered={isHovered} />
          </mesh>
          {/* Blue PTFE Stopcock Key */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0055, 0.0055, 0.042, 12]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} />
          </mesh>
          {/* Stopcock Turning Handle */}
          <mesh position={[0.022, 0, 0]}>
            <boxGeometry args={[0.006, 0.016, 0.01]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} />
          </mesh>
        </group>

        {/* Main Graduated Borosilicate Tube */}
        <mesh position={[0, 0.075 + buretteLength / 2, 0]} castShadow>
          <cylinderGeometry args={[buretteRadius, buretteRadius, buretteLength, 24, 1, true]} />
          <GlassMaterial isSelected={isSelected} isHovered={isHovered} opacity={0.3} />
        </mesh>

        {/* Top Funnel Lip */}
        <mesh position={[0, 0.075 + buretteLength, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[buretteRadius * 1.1, 0.002, 10, 24]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.1} transparent opacity={0.7} />
        </mesh>

        {/* Printed Sub-milliliter Graduation Marks (Sample ticks along tube) */}
        {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((fraction, idx) => (
          <mesh
            key={idx}
            position={[0, 0.075 + buretteLength * fraction, buretteRadius + 0.0004]}
            rotation={[0, 0, 0]}
          >
            <planeGeometry args={[idx % 2 === 0 ? 0.012 : 0.007, 0.0015]} />
            <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
          </mesh>
        ))}

        {/* Liquid Column inside Burette */}
        {fillRatio > 0.01 && (
          <group position={[0, 0.075, 0]}>
            <mesh position={[0, liquidHeight / 2, 0]}>
              <cylinderGeometry args={[buretteRadius * 0.92, buretteRadius * 0.92, liquidHeight, 18]} />
              <meshStandardMaterial
                color={liquidColor}
                roughness={0.1}
                transparent
                opacity={0.8}
              />
            </mesh>
            {/* Liquid Meniscus Curve at Top */}
            <mesh position={[0, liquidHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[buretteRadius * 0.9, 18]} />
              <meshStandardMaterial
                color={liquidColor}
                roughness={0.08}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}
