import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerControls } from './usePlayerControls';
import { resolvePlayerCollision, PLAYER_RADIUS } from './playerCollision';
import { createInitialPlayerState } from './playerTypes';
import { PlayerAvatar } from './PlayerAvatar';

/**
 * Player Controller Component.
 * Encapsulates:
 * - WASD & Arrow Key input handling
 * - Walk / Run speed states (Shift key)
 * - Axis-sliding collision detection with walls, benches, and fixed equipment
 * - Mouse-based 3rd-person camera look & follow controls
 * - Player state tracking structured for future Socket.IO synchronization
 */
export function PlayerController({
  playerName = 'Arjun Sharma',
  role = 'student',
  color = '#0284c7',
  isActive = true,
  teleportTarget = null,
  heldApparatus = null,
  onStateUpdate,
}) {
  const { camera, gl } = useThree();
  const keys = usePlayerControls();

  // Internal Player State Structure (pre-formatted for network synchronization)
  const playerState = useRef(
    createInitialPlayerState({
      name: playerName,
      role,
      color,
      position: [0, 0, 8.5], // Spawns in rear central corridor
      rotation: [0, Math.PI, 0],
    })
  );

  // Sync prop changes (e.g. user edits name in HUD)
  useEffect(() => {
    playerState.current.name = playerName;
    playerState.current.color = color;
  }, [playerName, color]);

  // Movement physics tracking
  const currentPos = useRef(new THREE.Vector3(0, 0, 8.5));
  const currentVel = useRef(new THREE.Vector3(0, 0, 0));
  const currentRotY = useRef(Math.PI);
  const targetRotY = useRef(Math.PI);

  // Handle teleportation to stations or points
  useEffect(() => {
    if (teleportTarget && teleportTarget.x !== undefined && teleportTarget.z !== undefined) {
      currentPos.current.set(teleportTarget.x, 0, teleportTarget.z);
      currentVel.current.set(0, 0, 0);
      if (teleportTarget.rotY !== undefined) {
        currentRotY.current = teleportTarget.rotY;
        targetRotY.current = teleportTarget.rotY;
        cameraYaw.current = teleportTarget.rotY;
      }
    }
  }, [teleportTarget]);

  // Mouse camera look tracking
  const cameraYaw = useRef(Math.PI); // Horizontal rotation
  const cameraPitch = useRef(0.28); // Vertical rotation (tilt)
  const cameraDistance = useRef(3.8); // Distance from avatar
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // Camera damping targets
  const cameraTarget = useRef(new THREE.Vector3(0, 1.35, 8.5));
  const desiredCamPos = useRef(new THREE.Vector3(0, 2.5, 12.0));

  // Avatar group ref and movement ref
  const avatarGroupRef = useRef();
  const visualMovement = useRef({
    isMoving: false,
    isRunning: false,
    speed: 0,
    animationState: 'idle',
  });

  // Setup Mouse Look & Zoom Event Listeners on the Canvas element
  useEffect(() => {
    const domElement = gl.domElement;
    if (!domElement) return;

    const onPointerDown = (e) => {
      // Left click (button 0) or Right click (button 2) for camera rotation
      if (e.button === 0 || e.button === 2) {
        isDragging.current = true;
        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerMove = (e) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      previousMousePosition.current = { x: e.clientX, y: e.clientY };

      const sensitivity = 0.0045;
      cameraYaw.current -= deltaX * sensitivity;

      // Clamp pitch between -10 deg and 75 deg
      cameraPitch.current = Math.max(
        -0.08,
        Math.min(1.22, cameraPitch.current + deltaY * sensitivity)
      );
    };

    const onPointerUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e) => {
      if (!isActive) return;
      // Smooth zoom distance between 1.8m and 7.2m
      cameraDistance.current = Math.max(
        1.8,
        Math.min(7.5, cameraDistance.current + e.deltaY * 0.0035)
      );
    };

    const onContextMenu = (e) => {
      // Prevent browser context menu on right click inside canvas
      e.preventDefault();
    };

    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('wheel', onWheel, { passive: true });
    domElement.addEventListener('contextmenu', onContextMenu);

    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('contextmenu', onContextMenu);
    };
  }, [gl, isActive]);

  // Main Movement & Camera Follow Loop (60/120 FPS)
  useFrame((state, delta) => {
    if (!isActive) return;

    // Constrain delta to avoid physics explosions during tab switching
    const dt = Math.min(delta, 0.08);

    const { forward, backward, left, right, run } = keys.current;

    // 1. Calculate Input Direction in Camera-Relative Space
    let inputX = 0;
    let inputZ = 0;

    if (forward) inputZ -= 1;
    if (backward) inputZ += 1;
    if (left) inputX -= 1;
    if (right) inputX += 1;

    const hasInput = inputX !== 0 || inputZ !== 0;

    // Speed configuration (Walking: 3.2 m/s, Running: 6.2 m/s)
    const targetSpeed = hasInput ? (run ? 6.2 : 3.2) : 0;

    let targetVelX = 0;
    let targetVelZ = 0;

    if (hasInput) {
      // Normalize diagonal movement
      const inputLen = Math.hypot(inputX, inputZ);
      const normX = inputX / inputLen;
      const normZ = inputZ / inputLen;

      // Rotate movement vector by current camera yaw
      // Forward (normZ = -1) points where camera is facing
      const cosYaw = Math.cos(cameraYaw.current);
      const sinYaw = Math.sin(cameraYaw.current);

      const moveWorldX = normX * cosYaw + normZ * sinYaw;
      const moveWorldZ = -normX * sinYaw + normZ * cosYaw;

      targetVelX = moveWorldX * targetSpeed;
      targetVelZ = moveWorldZ * targetSpeed;

      // Target avatar rotation to face movement direction
      targetRotY.current = Math.atan2(moveWorldX, moveWorldZ);
    }

    // 2. Smooth Acceleration and Deceleration
    const accelRate = hasInput ? 12.0 : 16.0;
    currentVel.current.x = THREE.MathUtils.lerp(currentVel.current.x, targetVelX, dt * accelRate);
    currentVel.current.z = THREE.MathUtils.lerp(currentVel.current.z, targetVelZ, dt * accelRate);

    // Stop micro-drift
    if (Math.abs(currentVel.current.x) < 0.001) currentVel.current.x = 0;
    if (Math.abs(currentVel.current.z) < 0.001) currentVel.current.z = 0;

    const actualSpeed = Math.hypot(currentVel.current.x, currentVel.current.z);
    const isMoving = actualSpeed > 0.15;
    const isRunning = isMoving && run && actualSpeed > 4.0;

    // 3. Collision Resolution with Walls, Benches & Equipment
    const startX = currentPos.current.x;
    const startZ = currentPos.current.z;
    const desiredX = startX + currentVel.current.x * dt;
    const desiredZ = startZ + currentVel.current.z * dt;

    const resolved = resolvePlayerCollision(startX, startZ, desiredX, desiredZ, PLAYER_RADIUS);

    currentPos.current.x = resolved.x;
    currentPos.current.z = resolved.z;

    // 4. Smooth Rotation (Turn towards movement direction)
    if (isMoving) {
      let diff = targetRotY.current - currentRotY.current;
      // Normalize angle difference to [-PI, PI] for shortest rotation path
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      currentRotY.current += diff * Math.min(1.0, dt * 14.0);
    }

    // 5. Update Visual Avatar Transforms
    if (avatarGroupRef.current) {
      avatarGroupRef.current.position.set(currentPos.current.x, 0, currentPos.current.z);
      avatarGroupRef.current.rotation.y = currentRotY.current;
    }

    visualMovement.current = {
      isMoving,
      isRunning,
      speed: actualSpeed,
      animationState: isRunning ? 'run' : isMoving ? 'walk' : 'idle',
    };

    // 6. Update Synchronizable Player State Structure
    playerState.current.position[0] = currentPos.current.x;
    playerState.current.position[1] = 0;
    playerState.current.position[2] = currentPos.current.z;
    playerState.current.rotation[1] = currentRotY.current;
    playerState.current.movement.isMoving = isMoving;
    playerState.current.movement.isRunning = isRunning;
    playerState.current.movement.speed = actualSpeed;
    playerState.current.movement.velocity[0] = currentVel.current.x;
    playerState.current.movement.velocity[2] = currentVel.current.z;
    playerState.current.movement.animationState = visualMovement.current.animationState;
    playerState.current.timestamp = Date.now();

    if (onStateUpdate) {
      onStateUpdate(playerState.current);
    }

    // 7. Mouse 3rd-Person Camera Look & Position Follow
    // Target position is centered at avatar shoulder height (1.35m)
    const targetX = currentPos.current.x;
    const targetY = 1.35;
    const targetZ = currentPos.current.z;

    cameraTarget.current.set(targetX, targetY, targetZ);

    // Compute spherical offset
    const dist = cameraDistance.current;
    const pitch = cameraPitch.current;
    const yaw = cameraYaw.current;

    const offsetX = Math.sin(yaw) * Math.cos(pitch) * dist;
    const offsetY = Math.sin(pitch) * dist;
    const offsetZ = Math.cos(yaw) * Math.cos(pitch) * dist;

    // Ensure camera stays above laboratory floor
    const targetCamY = Math.max(0.45, targetY + offsetY);
    desiredCamPos.current.set(targetX + offsetX, targetCamY, targetZ + offsetZ);

    // Smoothly damp camera movement to eliminate motion sickness
    camera.position.lerp(desiredCamPos.current, Math.min(1.0, dt * 8.0));
    camera.lookAt(cameraTarget.current);
  });

  return (
    <group ref={avatarGroupRef} position={[0, 0, 8.5]} rotation={[0, Math.PI, 0]}>
      <PlayerAvatar
        name={playerName}
        role={role}
        color={color}
        movementRef={visualMovement}
        isLocal={true}
        heldApparatus={heldApparatus}
      />
    </group>
  );
}
