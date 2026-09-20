import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ApparatusModel } from '../components/apparatus/ApparatusModel';

/**
 * Visual 3D Avatar Representation.
 * Pure presentation component designed to be reused for both
 * the local player and future remote multiplayer students / teachers.
 *
 * Props:
 * - position: [x, y, z] (optional initial position)
 * - rotation: [rx, ry, rz] (optional initial rotation)
 * - name: string (Configurable username)
 * - role: 'student' | 'teacher'
 * - color: string (Student accent / lanyard color)
 * - movementRef: RefObject<{ isMoving: boolean, isRunning: boolean, speed: number, animationState: string }>
 * - movementState: { isMoving: boolean, isRunning: boolean, speed: number, animationState: string }
 * - isLocal: boolean
 * - isFirstPerson: boolean
 * - heldApparatus: object | null
 */
export function PlayerAvatar({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  name = 'Student',
  role = 'student',
  color = '#0284c7',
  movementRef = null,
  movementState = { isMoving: false, isRunning: false, animationState: 'idle' },
  isLocal = true,
  isFirstPerson = true,
  heldApparatus = null,
}) {
  const groupRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const bodyRef = useRef();

  // Animation cycle accumulator
  const animPhase = useRef(0);
  const [motionTag, setMotionTag] = useState('');
  const lastTag = useRef('');

  useFrame((state, delta) => {
    const isMoving = movementRef ? movementRef.current.isMoving : movementState?.isMoving;
    const isRunning = movementRef ? movementRef.current.isRunning : movementState?.isRunning;

    // Update motion tag state only on change
    const nextTag = isMoving ? (isRunning ? 'RUNNING' : 'WALKING') : '';
    if (nextTag !== lastTag.current) {
      lastTag.current = nextTag;
      setMotionTag(nextTag);
    }

    // Advance animation phase based on movement speed
    if (isMoving) {
      const cycleSpeed = isRunning ? 16.0 : 9.0;
      animPhase.current += delta * cycleSpeed;
    } else {
      // Smoothly return towards neutral stance
      animPhase.current = THREE.MathUtils.lerp(animPhase.current, 0, delta * 8.0);
    }

    const swing = Math.sin(animPhase.current);
    const armAmplitude = isMoving ? (isRunning ? 0.75 : 0.45) : 0.05;
    const legAmplitude = isMoving ? (isRunning ? 0.8 : 0.5) : 0.0;

    // Limb swinging (opposite pairs)
    if (heldApparatus) {
      // Carrying pose: arms angled forward and inward holding apparatus safely
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -0.55 + (isMoving ? Math.sin(animPhase.current) * 0.05 : 0);
        leftArmRef.current.rotation.z = 0.16;
        rightArmRef.current.rotation.x = -0.55 - (isMoving ? Math.sin(animPhase.current) * 0.05 : 0);
        rightArmRef.current.rotation.z = -0.16;
      }
    } else {
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = swing * armAmplitude;
        leftArmRef.current.rotation.z = 0;
        rightArmRef.current.rotation.x = -swing * armAmplitude;
        rightArmRef.current.rotation.z = 0;
      }
    }

    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = -swing * legAmplitude;
      rightLegRef.current.rotation.x = swing * legAmplitude;
    }

    // Subtle torso bobbing and idle breathing
    if (bodyRef.current) {
      const bob = isMoving ? Math.abs(Math.sin(animPhase.current * 2)) * 0.035 : Math.sin(state.clock.elapsedTime * 2) * 0.008;
      bodyRef.current.position.y = 0.75 + bob;
    }
  });

  const isTeacher = role === 'teacher';
  const showThirdPersonMesh = !(isLocal && isFirstPerson);

  return (
    <group ref={groupRef} position={position} rotation={rotation} name={`avatar-${name}`}>
      {/* 3D Visual Mesh Hierarchy (hidden in local first-person so eyes have clear unobstructed view, visible for remote players) */}
      <group visible={showThirdPersonMesh}>
        {/* ================= DIRECTION & SELECTION RING ================= */}
        <group position={[0, 0.015, 0]}>
          {/* Soft ground shadow circle */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.38, 24]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.18} />
          </mesh>
          {/* Accent player boundary ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.36, 0.4, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.7} />
          </mesh>
          {/* Forward direction arrow pointer */}
          <mesh position={[0, 0.001, -0.44]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.08, 0.14, 3]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>

      {/* ================= LEGS & SHOES ================= */}
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.12, 0.68, 0]}>
        {/* Dark Navy Lab Trousers */}
        <mesh position={[0, -0.32, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.055, 0.65, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        {/* Lab Safety Shoe */}
        <mesh position={[0, -0.64, -0.04]} castShadow>
          <boxGeometry args={[0.11, 0.08, 0.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.12, 0.68, 0]}>
        {/* Dark Navy Lab Trousers */}
        <mesh position={[0, -0.32, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.055, 0.65, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        {/* Lab Safety Shoe */}
        <mesh position={[0, -0.64, -0.04]} castShadow>
          <boxGeometry args={[0.11, 0.08, 0.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
      </group>

      {/* ================= TORSO, ARMS & HEAD (BOBBING GROUP) ================= */}
      <group ref={bodyRef} position={[0, 0.75, 0]}>
        {/* Torso: Laboratory Coat (Clean White) */}
        <group position={[0, 0.28, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.58, 0.24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.45} />
          </mesh>
          {/* Lab Coat Lapel & Button Strip */}
          <mesh position={[0, 0, -0.122]}>
            <planeGeometry args={[0.08, 0.54]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
          </mesh>
          {/* Buttons */}
          {[-0.15, 0, 0.15].map((by, bIdx) => (
            <mesh key={bIdx} position={[0, by, -0.124]}>
              <circleGeometry args={[0.012, 12]} />
              <meshBasicMaterial color="#94a3b8" />
            </mesh>
          ))}
          {/* Student ID Card Badge & Lanyard on Chest */}
          <group position={[-0.12, 0.14, -0.123]}>
            {/* Lanyard ribbon */}
            <mesh position={[0, 0.08, 0]}>
              <planeGeometry args={[0.018, 0.14]} />
              <meshBasicMaterial color={color} />
            </mesh>
            {/* ID Card Holder */}
            <mesh position={[0, 0, 0.001]}>
              <planeGeometry args={[0.08, 0.1]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            {/* ID Card Photo silhouette */}
            <mesh position={[-0.018, 0.015, 0.002]}>
              <planeGeometry args={[0.03, 0.035]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
          {/* Lab Coat Lower Skirt */}
          <mesh position={[0, -0.32, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.24, 0.2, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.45} />
          </mesh>
        </group>

        {/* Left Arm & Glove */}
        <group ref={leftArmRef} position={[-0.26, 0.5, 0]}>
          {/* Upper & Lower Arm Sleeve */}
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.048, 0.48, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.45} />
          </mesh>
          {/* Nitrile Laboratory Glove (Teal / Blue) */}
          <mesh position={[0, -0.48, 0]} castShadow>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial color={isTeacher ? '#0d9488' : '#0284c7'} roughness={0.3} />
          </mesh>
        </group>

        {/* Right Arm & Glove */}
        <group ref={rightArmRef} position={[0.26, 0.5, 0]}>
          {/* Upper & Lower Arm Sleeve */}
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.048, 0.48, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.45} />
          </mesh>
          {/* Nitrile Laboratory Glove */}
          <mesh position={[0, -0.48, 0]} castShadow>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial color={isTeacher ? '#0d9488' : '#0284c7'} roughness={0.3} />
          </mesh>
        </group>

        {/* Held Laboratory Apparatus Mount (Positioned right between the student's gloved hands) */}
        {heldApparatus && (
          <group position={[0, 0.05, -0.32]} rotation={[0, 0, 0]}>
            <ApparatusModel
              apparatus={heldApparatus}
              isSelected={false}
              isHovered={false}
            />
          </group>
        )}

        {/* Neck */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.06, 0.07, 0.1, 12]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.6} />
        </mesh>

        {/* Head */}
        <group position={[0, 0.76, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial color="#fcd34d" roughness={0.6} />
          </mesh>

          {/* Student Hair (Clean stylized modern cut) */}
          <group position={[0, 0.04, -0.01]}>
            <mesh castShadow>
              <sphereGeometry args={[0.135, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
              <meshStandardMaterial color="#332211" roughness={0.8} />
            </mesh>
            {/* Front Fringe */}
            <mesh position={[0, 0.07, -0.1]}>
              <boxGeometry args={[0.16, 0.06, 0.06]} />
              <meshStandardMaterial color="#332211" roughness={0.8} />
            </mesh>
          </group>

          {/* Laboratory Safety Goggles (Clear blue-tint polycarbonate) */}
          <group position={[0, 0.015, -0.1]}>
            {/* Goggle Frame */}
            <mesh>
              <boxGeometry args={[0.19, 0.065, 0.05]} />
              <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.2} />
            </mesh>
            {/* Clear Transparent Lens */}
            <mesh position={[0, 0, -0.026]}>
              <planeGeometry args={[0.17, 0.05]} />
              <meshPhysicalMaterial
                color="#e0f2fe"
                transparent
                opacity={0.6}
                roughness={0.1}
                transmission={0.85}
                ior={1.5}
              />
            </mesh>
            {/* Goggle Elastic Headstrap */}
            <mesh position={[0, 0, 0.07]}>
              <cylinderGeometry args={[0.136, 0.136, 0.02, 16]} />
              <meshBasicMaterial color="#1e293b" />
            </mesh>
          </group>
        </group>
      </group>

      {/* ================= FLOATING USERNAME / NAMEPLATE ================= */}
      <Html
        position={[0, 1.82, 0]}
        center
        distanceFactor={8}
        zIndexRange={[100, 0]}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            transform: 'translate3d(0, 0, 0)',
            whiteSpace: 'nowrap',
          }}
        >
          {/* Main Nameplate Bubble */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.82)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              border: `1px solid ${isLocal ? color : '#475569'}`,
              borderRadius: '12px',
              padding: '2px 8px',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.1px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {/* Role indicator icon or status dot */}
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: isLocal ? '#22c55e' : color,
                boxShadow: isLocal ? '0 0 4px #22c55e' : 'none',
                display: 'inline-block',
              }}
            />

            {/* Configurable Name */}
            <span>{name}</span>

            {/* Local "(You)" Tag or Role Badge */}
            {isLocal ? (
              <span
                style={{
                  fontSize: '8px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.18)',
                  padding: '0.5px 3.5px',
                  borderRadius: '3px',
                  letterSpacing: '0.3px',
                }}
              >
                YOU
              </span>
            ) : (
              <span
                style={{
                  fontSize: '8px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '0.5px 3.5px',
                  borderRadius: '3px',
                }}
              >
                {isTeacher ? 'TEACHER' : 'STUDENT'}
              </span>
            )}
          </div>

          {/* Activity / Movement Sub-badge */}
          {motionTag && (
            <div
              style={{
                fontSize: '8px',
                fontWeight: 600,
                color: motionTag === 'RUNNING' ? '#f59e0b' : '#38bdf8',
                background: 'rgba(15, 23, 42, 0.7)',
                padding: '0.5px 5px',
                borderRadius: '6px',
                letterSpacing: '0.2px',
              }}
            >
              {motionTag}
            </div>
          )}
        </div>
      </Html>
      </group>
    </group>
  );
}
