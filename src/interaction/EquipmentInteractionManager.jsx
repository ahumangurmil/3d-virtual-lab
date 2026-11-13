import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useLab } from '../context/LabContext';
import { validateApparatusPlacement } from './surfaces';
import { isApparatusPickable } from './interactionTypes';
import { PlacementIndicator } from './PlacementIndicator';

function hasPlacementChanged(prev, next) {
  if (prev === next) return false;
  if (!prev || !next) return true;
  if (
    prev.isValid !== next.isValid ||
    prev.surfaceId !== next.surfaceId ||
    prev.surfaceName !== next.surfaceName ||
    prev.reason !== next.reason
  ) {
    return true;
  }
  const prevPos = prev.snappedPosition;
  const nextPos = next.snappedPosition;
  if (!prevPos || !nextPos) return prevPos !== nextPos;
  return (
    Math.abs(prevPos[0] - nextPos[0]) >= 0.005 ||
    Math.abs(prevPos[1] - nextPos[1]) >= 0.005 ||
    Math.abs(prevPos[2] - nextPos[2]) >= 0.005
  );
}

/**
 * Centralized Equipment Interaction Manager.
 * Handles:
 * - Proximity & line-of-sight apparatus detection
 * - Prospective placement surface calculation & validation
 * - Global keyboard shortcuts ([E] Inspect, [F] Pick Up / Place, [Esc] Cancel)
 * - 3D Placement visual feedback rendering
 */
export function EquipmentInteractionManager() {
  const { raycaster, mouse, camera } = useThree();
  const {
    apparatusList,
    heldApparatus,
    heldApparatusId,
    targetApparatusId,
    setTargetApparatusId,
    selectedId,
    placementState,
    setPlacementState,
    pickUpApparatus,
    placeApparatus,
    selectApparatus,
    pourLiquid,
    measureApparatus,
    turnBuretteStopcock,
    swirlConicalFlask,
    alignFlaskUnderBurette,
    playerStateRef,
    controlMode,
    povMode,
  } = useLab();

  // Pre-allocated math objects & tracking refs to avoid per-frame GC allocations
  const benchPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.92));
  const mouseIntersection = useRef(new THREE.Vector3());
  const camDir = useRef(new THREE.Vector3());
  const toCamVec = useRef(new THREE.Vector3());
  const centerScreen = useRef(new THREE.Vector2(0, 0));
  const targetPoint = useRef([0, 0.92, 0]);
  const lastPlacementRef = useRef(placementState);
  const lastValidationInputRef = useRef({
    x: NaN,
    z: NaN,
    heldId: null,
    apparatusList: null,
  });

  useEffect(() => {
    lastPlacementRef.current = placementState;
  }, [placementState]);

  // Global Keyboard listener for natural game-like interaction
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is currently typing in an input field (e.g. editing player name)
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      // [F] Key: Pick up targeted apparatus OR Place currently held apparatus
      if (e.code === 'KeyF') {
        if (heldApparatusId) {
          placeApparatus();
        } else if (targetApparatusId) {
          const target = apparatusList.find((a) => a.id === targetApparatusId);
          if (target && isApparatusPickable(target)) {
            pickUpApparatus(target.id);
          }
        }
      }

      // [P] Key: Pour liquid from held container into targeted container (or aspirate into pipette)
      if (e.code === 'KeyP') {
        if (heldApparatusId && targetApparatusId) {
          const heldItem = heldApparatus || apparatusList.find((a) => a.id === heldApparatusId);
          const amount = heldItem?.type === 'indicator_bottle' ? 2 : 25;
          pourLiquid(heldApparatusId, targetApparatusId, amount);
        } else if (selectedId && targetApparatusId && selectedId !== targetApparatusId) {
          const selectedItem = apparatusList.find((a) => a.id === selectedId);
          const amount = selectedItem?.type === 'indicator_bottle' ? 2 : 25;
          pourLiquid(selectedId, targetApparatusId, amount);
        }
      }

      // [T] Key: Turn burette stopcock (5 mL gradual, or Shift+T for 0.1 mL drop)
      if (e.code === 'KeyT') {
        turnBuretteStopcock(e.shiftKey ? 0.1 : 5);
      }

      // [G] Key: Dropwise burette stopcock (0.1 mL single drop)
      if (e.code === 'KeyG') {
        turnBuretteStopcock(0.1);
      }

      // [S] Key: Swirl conical flask
      if (e.code === 'KeyS') {
        swirlConicalFlask();
      }

      // [A] Key: Align conical flask under burette tip
      if (e.code === 'KeyA') {
        alignFlaskUnderBurette();
      }

      // [M] Key: Measure targeted or selected apparatus
      if (e.code === 'KeyM') {
        const toMeasure = selectedId || targetApparatusId || heldApparatusId;
        if (toMeasure) {
          measureApparatus(toMeasure);
        }
      }

      // [E] Key: Open / toggle info panel for targeted apparatus
      if (e.code === 'KeyE') {
        if (selectedId) {
          if (targetApparatusId && targetApparatusId !== selectedId) {
            selectApparatus(targetApparatusId);
          } else {
            selectApparatus(null);
          }
        } else if (targetApparatusId) {
          selectApparatus(targetApparatusId);
        }
      }

      // [Escape] Key: Clear selection
      if (e.code === 'Escape') {
        selectApparatus(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    heldApparatusId,
    heldApparatus,
    targetApparatusId,
    selectedId,
    apparatusList,
    pickUpApparatus,
    placeApparatus,
    selectApparatus,
    pourLiquid,
    measureApparatus,
    turnBuretteStopcock,
    swirlConicalFlask,
    alignFlaskUnderBurette,
  ]);

  // Frame loop: Continuous detection & placement raycasting
  useFrame(() => {
    // Only run proximity detection when in avatar mode
    if (controlMode !== 'avatar') return;

    const pState = playerStateRef?.current;
    if (!pState) return;

    const [px, , pz] = pState.position;
    const rotY = pState.rotation[1] || 0;

    // Get camera look direction in world space
    camera.getWorldDirection(camDir.current);

    // Avatar forward direction in world space (-Z is front when rotY = 0)
    const avatarForwardX = -Math.sin(rotY);
    const avatarForwardZ = -Math.cos(rotY);

    const isFirstPerson = povMode === 'first-person';
    const forwardX = isFirstPerson ? camDir.current.x : avatarForwardX;
    const forwardZ = isFirstPerson ? camDir.current.z : avatarForwardZ;
    const fMag = Math.hypot(forwardX, forwardZ) || 1;
    const normForwardX = forwardX / fMag;
    const normForwardZ = forwardZ / fMag;

    // ================= 1. HELD APPARATUS PLACEMENT TARGETING =================
    if (heldApparatusId && heldApparatus) {
      let targetPlaceX = px + normForwardX * 0.95;
      const targetPlaceY = 0.92;
      let targetPlaceZ = pz + normForwardZ * 0.95;

      // In first-person or mouse mode, check if camera raycast hits benchtop within player reach (~2.5m)
      raycaster.setFromCamera(isFirstPerson ? centerScreen.current : mouse, camera);
      const hit = raycaster.ray.intersectPlane(benchPlane.current, mouseIntersection.current);
      if (hit) {
        const distFromPlayer = Math.hypot(hit.x - px, hit.z - pz);
        if (distFromPlayer <= 2.5) {
          targetPlaceX = hit.x;
          targetPlaceZ = hit.z;
        }
      }

      const lastInput = lastValidationInputRef.current;
      const needsValidation =
        lastPlacementRef.current === null ||
        lastInput.heldId !== heldApparatusId ||
        lastInput.apparatusList !== apparatusList ||
        Math.abs(targetPlaceX - lastInput.x) >= 0.001 ||
        Math.abs(targetPlaceZ - lastInput.z) >= 0.001;

      if (needsValidation) {
        lastInput.x = targetPlaceX;
        lastInput.z = targetPlaceZ;
        lastInput.heldId = heldApparatusId;
        lastInput.apparatusList = apparatusList;

        targetPoint.current[0] = targetPlaceX;
        targetPoint.current[1] = targetPlaceY;
        targetPoint.current[2] = targetPlaceZ;

        // Validate prospective placement surface
        const validation = validateApparatusPlacement(
          targetPoint.current,
          heldApparatus,
          apparatusList
        );

        if (hasPlacementChanged(lastPlacementRef.current, validation)) {
          lastPlacementRef.current = validation;
          setPlacementState(validation);
        }
      }
    } else if (lastPlacementRef.current !== null || placementState !== null) {
      lastValidationInputRef.current.heldId = null;
      lastValidationInputRef.current.apparatusList = null;
      lastPlacementRef.current = null;
      if (placementState !== null) {
        setPlacementState(null);
      }
    }

    // ================= 2. PROXIMITY & LINE-OF-SIGHT APPARATUS DETECTION =================
    const MAX_INTERACTION_DIST = 2.5;
    let closestItem = null;
    let highestScore = -Infinity;

    for (const item of apparatusList) {
      if (item.isHeld || item.id === heldApparatusId) continue;

      const [ix, iy, iz] = item.position;
      const dx = ix - px;
      const dz = iz - pz;
      const dist = Math.hypot(dx, dz);

      if (dist > MAX_INTERACTION_DIST) continue;

      // 1. Line-of-sight check from camera
      toCamVec.current
        .set(ix - camera.position.x, iy - camera.position.y, iz - camera.position.z)
        .normalize();
      const camDot = camDir.current.dot(toCamVec.current);

      // 2. Forward direction check from avatar
      const dirX = dx / (dist || 1);
      const dirZ = dz / (dist || 1);
      const avatarDot = normForwardX * dirX + normForwardZ * dirZ;

      const effectiveDot = isFirstPerson ? camDot : Math.max(camDot, avatarDot);

      // Must be in line of sight or very close
      if (effectiveDot > 0.25 || dist < 1.0) {
        const score = effectiveDot * 3.0 - dist;
        if (score > highestScore) {
          highestScore = score;
          closestItem = item;
        }
      }
    }

    const newTargetId = closestItem ? closestItem.id : null;
    if (newTargetId !== targetApparatusId) {
      setTargetApparatusId(newTargetId);
    }
  });

  return (
    <PlacementIndicator
      placementState={placementState}
      heldApparatus={heldApparatus}
    />
  );
}
