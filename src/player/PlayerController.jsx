import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerControls } from './usePlayerControls';
import { resolvePlayerCollision, PLAYER_RADIUS } from './playerCollision';
import { createInitialPlayerState } from './playerTypes';
import { PlayerAvatar } from './PlayerAvatar';
import { ApparatusModel } from '../components/apparatus/ApparatusModel';

/**
 * Player Controller Component.
 * Supports dual camera perspectives:
 * - First-Person POV: Eye level (~1.65m), sight-vector mouse look, direct body alignment
 * - Third-Person POV: Smooth follow camera with orbital rotation, zoom, and turning avatar
 * - Seamless preservation of player position, heading, velocity, and collision detection across modes
 */
export function PlayerController({
  playerName = 'Arjun Sharma',
  role = 'student',
  color = '#0284c7',
  isActive = true,
  povMode = 'first-person', // 'first-person' | 'third-person'
  teleportTarget = null,
  heldApparatus = null,
  onStateUpdate,
}) {
  const { camera, gl } = useThree();
  const keys = usePlayerControls();

  const isFirstPerson = povMode === 'first-person';

  // Internal Player State Structure (pre-formatted for network synchronization)
  const playerState = useRef(
    createInitialPlayerState({
      name: playerName,
      role,
      color,
      position: [0, 0, 8.5], // Spawns in rear central corridor
      rotation: [0, 0, 0], // Facing forward into lab (-Z)
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
  const currentRotY = useRef(0);
  const targetRotY = useRef(0);

  // Camera Look & Orbital Angles
  // yaw = 0 faces -Z (toward front blackboard)
  const cameraYaw = useRef(0);
  const cameraPitch = useRef(0); // 0 = eye level
  const cameraDistance = useRef(3.8); // 3rd-person follow distance
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // Camera damping targets for 3rd person
  const cameraTarget = useRef(new THREE.Vector3(0, 1.35, 8.5));
  const desiredCamPos = useRef(new THREE.Vector3(0, 2.5, 12.0));

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
      cameraPitch.current = isFirstPerson ? 0 : 0.28;
    }
  }, [teleportTarget, isFirstPerson]);

  // Avatar group ref and movement ref
  const avatarGroupRef = useRef();
  const heldApparatusFPRef = useRef();
  const visualMovement = useRef({
    isMoving: false,
    isRunning: false,
    speed: 0,
    animationState: 'idle',
  });

  // Setup Mouse Look (Pointer Lock for 1st-Person & Drag / Zoom for 3rd-Person)
  useEffect(() => {
    const domElement = gl.domElement;
    if (!domElement) return;

    const requestLock = () => {
      if (!isActive) return;
      if (document.pointerLockElement !== domElement && domElement.requestPointerLock) {
        domElement.requestPointerLock();
      }
    };

    const onPointerDown = (e) => {
      if (!isActive) return;
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };

      // In first-person mode, clicking requests pointer lock
      if (isFirstPerson && (e.button === 0 || e.button === 2)) {
        requestLock();
      }
    };

    const onPointerMove = (e) => {
      if (!isActive) return;

      const isPointerLocked = document.pointerLockElement === domElement;

      if (isFirstPerson && isPointerLocked) {
        // First-person native pointer lock
        const sensitivity = 0.0022;
        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;

        cameraYaw.current -= movementX * sensitivity;
        cameraPitch.current = Math.max(
          -1.48,
          Math.min(1.48, cameraPitch.current - movementY * sensitivity)
        );
      } else if (isDragging.current) {
        // Drag fallback (1st person drag or 3rd person orbit)
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;
        previousMousePosition.current = { x: e.clientX, y: e.clientY };

        const sensitivity = isFirstPerson ? 0.0035 : 0.0045;
        cameraYaw.current -= deltaX * sensitivity;

        if (isFirstPerson) {
          cameraPitch.current = Math.max(
            -1.48,
            Math.min(1.48, cameraPitch.current - deltaY * sensitivity)
          );
        } else {
          // In 3rd person, dragging down looks down / pitches up
          cameraPitch.current = Math.max(
            -0.08,
            Math.min(1.22, cameraPitch.current + deltaY * sensitivity)
          );
        }
      }
    };

    const onPointerUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e) => {
      if (!isActive || isFirstPerson) return;
      // Zoom camera distance in 3rd person mode
      cameraDistance.current = Math.max(
        1.8,
        Math.min(7.5, cameraDistance.current + e.deltaY * 0.0035)
      );
    };

    const onContextMenu = (e) => {
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
  }, [gl, isActive, isFirstPerson]);

  // Main Movement & Camera Update Loop (60/120 FPS)
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

    // Speed configuration (Walking: 3.2 m/s, Sprinting: 6.2 m/s)
    const targetSpeed = hasInput ? (run ? 6.2 : 3.2) : 0;

    let targetVelX = 0;
    let targetVelZ = 0;

    if (hasInput) {
      // Normalize diagonal movement
      const inputLen = Math.hypot(inputX, inputZ);
      const normX = inputX / inputLen;
      const normZ = inputZ / inputLen;

      // Rotate movement vector by current camera yaw
      // Forward (normZ = -1) moves toward where the camera is facing
      const cosYaw = Math.cos(cameraYaw.current);
      const sinYaw = Math.sin(cameraYaw.current);

      const moveWorldX = normX * cosYaw + normZ * sinYaw;
      const moveWorldZ = -normX * sinYaw + normZ * cosYaw;

      targetVelX = moveWorldX * targetSpeed;
      targetVelZ = moveWorldZ * targetSpeed;

      // In 3rd-person, face movement direction; in 1st-person, face camera yaw
      if (!isFirstPerson) {
        targetRotY.current = Math.atan2(moveWorldX, moveWorldZ);
      }
    }

    // 2. Smooth Acceleration and Deceleration
    const accelRate = hasInput ? 14.0 : 18.0;
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

    // 4. Update Avatar Position & Heading
    if (isFirstPerson) {
      currentRotY.current = cameraYaw.current;
    } else if (isMoving) {
      let diff = targetRotY.current - currentRotY.current;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      currentRotY.current += diff * Math.min(1.0, dt * 14.0);
    }

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

    // 5. Update Synchronizable Player State Structure
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

    // 6. Camera Position & Look Update
    if (isFirstPerson) {
      // First-Person POV at 1.65m eye level
      const EYE_HEIGHT = 1.65;
      const eyeX = currentPos.current.x;
      const eyeY = EYE_HEIGHT;
      const eyeZ = currentPos.current.z;

      camera.position.set(eyeX, eyeY, eyeZ);

      const dirX = -Math.sin(cameraYaw.current) * Math.cos(cameraPitch.current);
      const dirY = Math.sin(cameraPitch.current);
      const dirZ = -Math.cos(cameraYaw.current) * Math.cos(cameraPitch.current);

      camera.lookAt(eyeX + dirX, eyeY + dirY, eyeZ + dirZ);
    } else {
      // Third-Person POV orbiting behind player
      const targetX = currentPos.current.x;
      const targetY = 1.35;
      const targetZ = currentPos.current.z;

      cameraTarget.current.set(targetX, targetY, targetZ);

      const dist = cameraDistance.current;
      const pitch = cameraPitch.current;
      const yaw = cameraYaw.current;

      const offsetX = Math.sin(yaw) * Math.cos(pitch) * dist;
      const offsetY = Math.sin(pitch) * dist;
      const offsetZ = Math.cos(yaw) * Math.cos(pitch) * dist;

      const targetCamY = Math.max(0.45, targetY + offsetY);
      desiredCamPos.current.set(targetX + offsetX, targetCamY, targetZ + offsetZ);

      camera.position.lerp(desiredCamPos.current, Math.min(1.0, dt * 8.0));
      camera.lookAt(cameraTarget.current);
    }

    // 7. Update First-Person Held Apparatus Position
    if (isFirstPerson && heldApparatus && heldApparatusFPRef.current) {
      heldApparatusFPRef.current.visible = true;
      const camPos = camera.position;
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
      const up = new THREE.Vector3().crossVectors(right, forward).normalize();

      const isMov = visualMovement.current.isMoving;
      const isRun = visualMovement.current.isRunning;
      const t = state.clock.getElapsedTime();
      const bob = isMov ? Math.sin(t * (isRun ? 13 : 8.5)) * 0.007 : Math.sin(t * 2.2) * 0.002;
      const sway = isMov ? Math.cos(t * (isRun ? 6.5 : 4.2)) * 0.005 : 0;

      const isBurette = heldApparatus.type === 'burette_50';
      const yOffset = isBurette ? -0.26 : -0.15;
      const forwardDist = isBurette ? 0.44 : 0.38;

      heldApparatusFPRef.current.position.copy(camPos)
        .addScaledVector(forward, forwardDist)
        .addScaledVector(right, 0.13 + sway)
        .addScaledVector(up, yOffset + bob);

      heldApparatusFPRef.current.rotation.set(
        cameraPitch.current * 0.4,
        cameraYaw.current + 0.12,
        -0.03
      );
    } else if (heldApparatusFPRef.current) {
      heldApparatusFPRef.current.visible = false;
    }
  });

  return (
    <>
      <group ref={avatarGroupRef} position={[0, 0, 8.5]} rotation={[0, 0, 0]}>
        <PlayerAvatar
          name={playerName}
          role={role}
          color={color}
          movementRef={visualMovement}
          isLocal={true}
          isFirstPerson={isFirstPerson}
          heldApparatus={heldApparatus}
        />
      </group>

      {/* First-person held apparatus viewmodel */}
      {heldApparatus && (
        <group ref={heldApparatusFPRef} visible={isFirstPerson}>
          <group scale={heldApparatus.type === 'burette_50' ? 0.65 : 0.85}>
            <ApparatusModel
              apparatus={heldApparatus}
              isSelected={false}
              isHovered={false}
            />
          </group>
        </group>
      )}
    </>
  );
}
