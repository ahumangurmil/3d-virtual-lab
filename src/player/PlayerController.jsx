import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerControls } from './usePlayerControls';
import { resolvePlayerCollision, PLAYER_RADIUS } from './playerCollision';
import { createInitialPlayerState } from './playerTypes';
import { PlayerAvatar } from './PlayerAvatar';

/**
 * Player Controller Component (First-Person POV).
 * Encapsulates:
 * - First-Person Camera at student eye level (~1.65m)
 * - Mouse look with pointer lock and drag fallback (yaw/pitch)
 * - WASD & Arrow Key movement relative to view angle
 * - Walk / Sprint speed states (Shift key)
 * - Axis-sliding collision detection with walls, benches, and fixed equipment
 * - Authoritative player state tracking structured for future Socket.IO synchronization
 * - Non-obstructing local avatar representation preserved for multiplayer readiness
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

  // First-Person Camera Look Angles
  // yaw = 0 faces -Z (toward the teacher demonstration bench and blackboard)
  const cameraYaw = useRef(0);
  const cameraPitch = useRef(0); // 0 = level eye line
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // Handle teleportation to stations or points
  useEffect(() => {
    if (teleportTarget && teleportTarget.x !== undefined && teleportTarget.z !== undefined) {
      currentPos.current.set(teleportTarget.x, 0, teleportTarget.z);
      currentVel.current.set(0, 0, 0);
      if (teleportTarget.rotY !== undefined) {
        currentRotY.current = teleportTarget.rotY;
        cameraYaw.current = teleportTarget.rotY;
      }
      cameraPitch.current = 0;
    }
  }, [teleportTarget]);

  // Avatar group ref and movement ref
  const avatarGroupRef = useRef();
  const visualMovement = useRef({
    isMoving: false,
    isRunning: false,
    speed: 0,
    animationState: 'idle',
  });

  // Setup First-Person Mouse Look (Pointer Lock with Smooth Drag Fallback)
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

      // Left or right click requests pointer lock for game-like mouse look
      if (e.button === 0 || e.button === 2) {
        requestLock();
      }
    };

    const onPointerMove = (e) => {
      if (!isActive) return;

      const isPointerLocked = document.pointerLockElement === domElement;

      if (isPointerLocked) {
        // Native pointer lock mouse delta
        const sensitivity = 0.0022;
        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;

        cameraYaw.current -= movementX * sensitivity;
        // Pitch clamped between -85 deg (-1.48 rad) looking down and +85 deg looking up
        cameraPitch.current = Math.max(
          -1.48,
          Math.min(1.48, cameraPitch.current - movementY * sensitivity)
        );
      } else if (isDragging.current) {
        // Drag fallback (useful in iframes or before pointer lock engaged)
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;
        previousMousePosition.current = { x: e.clientX, y: e.clientY };

        const sensitivity = 0.0035;
        cameraYaw.current -= deltaX * sensitivity;
        cameraPitch.current = Math.max(
          -1.48,
          Math.min(1.48, cameraPitch.current - deltaY * sensitivity)
        );
      }
    };

    const onPointerUp = () => {
      isDragging.current = false;
    };

    const onContextMenu = (e) => {
      // Prevent browser context menu on right click inside canvas
      e.preventDefault();
    };

    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('contextmenu', onContextMenu);

    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('contextmenu', onContextMenu);
    };
  }, [gl, isActive]);

  // Main First-Person Movement & Camera Update Loop (60/120 FPS)
  useFrame((state, delta) => {
    if (!isActive) return;

    // Constrain delta to avoid physics explosions during tab switching
    const dt = Math.min(delta, 0.08);

    const { forward, backward, left, right, run } = keys.current;

    // 1. Calculate Input Direction in First-Person Camera Space
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
      // Forward (normZ = -1) moves toward where the student's eyes are looking
      const cosYaw = Math.cos(cameraYaw.current);
      const sinYaw = Math.sin(cameraYaw.current);

      const moveWorldX = normX * cosYaw + normZ * sinYaw;
      const moveWorldZ = -normX * sinYaw + normZ * cosYaw;

      targetVelX = moveWorldX * targetSpeed;
      targetVelZ = moveWorldZ * targetSpeed;
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
    currentRotY.current = cameraYaw.current;

    if (avatarGroupRef.current) {
      avatarGroupRef.current.position.set(currentPos.current.x, 0, currentPos.current.z);
      avatarGroupRef.current.rotation.y = cameraYaw.current;
    }

    visualMovement.current = {
      isMoving,
      isRunning,
      speed: actualSpeed,
      animationState: isRunning ? 'run' : isMoving ? 'walk' : 'idle',
    };

    // 5. Update Synchronizable Player State Structure (ready for remote replication)
    playerState.current.position[0] = currentPos.current.x;
    playerState.current.position[1] = 0;
    playerState.current.position[2] = currentPos.current.z;
    playerState.current.rotation[1] = cameraYaw.current;
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

    // 6. First-Person Camera Position & View Vector
    // Student Eye Level: 1.65 meters above the floor
    const EYE_HEIGHT = 1.65;
    const eyeX = currentPos.current.x;
    const eyeY = EYE_HEIGHT;
    const eyeZ = currentPos.current.z;

    camera.position.set(eyeX, eyeY, eyeZ);

    // Compute forward sight vector from pitch and yaw
    const dirX = -Math.sin(cameraYaw.current) * Math.cos(cameraPitch.current);
    const dirY = Math.sin(cameraPitch.current);
    const dirZ = -Math.cos(cameraYaw.current) * Math.cos(cameraPitch.current);

    camera.lookAt(eyeX + dirX, eyeY + dirY, eyeZ + dirZ);
  });

  return (
    <group ref={avatarGroupRef} position={[0, 0, 8.5]} rotation={[0, 0, 0]}>
      <PlayerAvatar
        name={playerName}
        role={role}
        color={color}
        movementRef={visualMovement}
        isLocal={true}
        isFirstPerson={true}
        heldApparatus={heldApparatus}
      />
    </group>
  );
}
