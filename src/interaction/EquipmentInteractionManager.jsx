import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useLab } from '../context/LabContext';
import { labStore, useHeldApparatus, usePlacementState } from '../store/labStore';
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
 * Pure helper handling global equipment interaction shortcuts against latest store state.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function processEquipmentInteractionKeyDown(e, store, actions) {
  // Ignore if user is currently typing in an input field (e.g. editing player name)
  const activeTag =
    typeof document !== 'undefined' ? document.activeElement?.tagName?.toLowerCase() : undefined;
  if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
    return false;
  }

  const { heldApparatusId, targetApparatusId, selectedId, apparatusById } = store.getState();

  // [F] Key: Pick up targeted apparatus OR Place currently held apparatus
  if (e.code === 'KeyF') {
    if (heldApparatusId) {
      actions.placeApparatus();
    } else if (targetApparatusId) {
      const target = apparatusById[targetApparatusId];
      if (target && isApparatusPickable(target)) {
        actions.pickUpApparatus(target.id);
      }
    }
    return true;
  }

  // [P] Key: Pour liquid from held container into targeted container (or aspirate into pipette)
  if (e.code === 'KeyP') {
    if (heldApparatusId && targetApparatusId) {
      const heldItem = apparatusById[heldApparatusId];
      const amount = heldItem?.type === 'indicator_bottle' ? 2 : 25;
      actions.pourLiquid(heldApparatusId, targetApparatusId, amount);
    } else if (selectedId && targetApparatusId && selectedId !== targetApparatusId) {
      const selectedItem = apparatusById[selectedId];
      const amount = selectedItem?.type === 'indicator_bottle' ? 2 : 25;
      actions.pourLiquid(selectedId, targetApparatusId, amount);
    }
    return true;
  }

  // [T] Key: Turn burette stopcock (5 mL gradual, or Shift+T for 0.1 mL drop)
  if (e.code === 'KeyT') {
    actions.turnBuretteStopcock(e.shiftKey ? 0.1 : 5);
    return true;
  }

  // [G] Key: Dropwise burette stopcock (0.1 mL single drop)
  if (e.code === 'KeyG') {
    actions.turnBuretteStopcock(0.1);
    return true;
  }

  // [S] Key: Swirl conical flask
  if (e.code === 'KeyS') {
    actions.swirlConicalFlask();
    return true;
  }

  // [A] Key: Align conical flask under burette tip
  if (e.code === 'KeyA') {
    actions.alignFlaskUnderBurette();
    return true;
  }

  // [M] Key: Measure targeted or selected apparatus
  if (e.code === 'KeyM') {
    const toMeasure = selectedId || targetApparatusId || heldApparatusId;
    if (toMeasure) {
      actions.measureApparatus(toMeasure);
    }
    return true;
  }

  // [E] Key: Open / toggle info panel for targeted apparatus
  if (e.code === 'KeyE') {
    if (selectedId) {
      if (targetApparatusId && targetApparatusId !== selectedId) {
        actions.selectApparatus(targetApparatusId);
      } else {
        actions.selectApparatus(null);
      }
    } else if (targetApparatusId) {
      actions.selectApparatus(targetApparatusId);
    }
    return true;
  }

  // [Escape] Key: Clear selection
  if (e.code === 'Escape') {
    actions.selectApparatus(null);
    return true;
  }

  return false;
}

/**
 * Pure helper evaluating held-apparatus placement validation against latest store state.
 * Only emits a new placement state when inputs change and validation visibly differs.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function evaluatePlacementValidation({
  heldApparatusId,
  heldApparatus,
  currentPlacementState,
  apparatusList,
  targetPlaceX,
  targetPlaceY,
  targetPlaceZ,
  lastPlacementRef,
  lastValidationInputRef,
  targetPoint,
  setPlacementState,
}) {
  if (heldApparatusId && heldApparatus) {
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

      const validation = validateApparatusPlacement(
        targetPoint.current,
        heldApparatus,
        apparatusList
      );

      if (hasPlacementChanged(lastPlacementRef.current, validation)) {
        lastPlacementRef.current = validation;
        setPlacementState(validation);
        return true;
      }
    }
    return false;
  }

  if (lastPlacementRef.current !== null || currentPlacementState !== null) {
    lastValidationInputRef.current.heldId = null;
    lastValidationInputRef.current.apparatusList = null;
    lastPlacementRef.current = null;
    if (currentPlacementState !== null) {
      setPlacementState(null);
      return true;
    }
  }

  return false;
}

/**
 * Pure helper finding the highest-scoring apparatus within proximity & line of sight.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function findTargetApparatusId({
  apparatusList,
  heldApparatusId,
  playerX,
  playerZ,
  cameraPosition,
  camDir,
  normForwardX,
  normForwardZ,
  isFirstPerson,
  toCamVec,
  maxDist = 2.5,
}) {
  let closestItem = null;
  let highestScore = -Infinity;

  for (const item of apparatusList) {
    if (item.isHeld || item.id === heldApparatusId) continue;

    const [ix, iy, iz] = item.position;
    const dx = ix - playerX;
    const dz = iz - playerZ;
    const dist = Math.hypot(dx, dz);

    if (dist > maxDist) continue;

    // 1. Line-of-sight check from camera
    toCamVec
      .set(ix - cameraPosition.x, iy - cameraPosition.y, iz - cameraPosition.z)
      .normalize();
    const camDot = camDir.dot(toCamVec);

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

  return closestItem ? closestItem.id : null;
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
    setTargetApparatusId,
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

  // Only subscribe to the minimal slices needed to render <PlacementIndicator>
  const placementState = usePlacementState();
  const heldApparatus = useHeldApparatus();

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

  const actionsRef = useRef({
    pickUpApparatus,
    placeApparatus,
    selectApparatus,
    pourLiquid,
    measureApparatus,
    turnBuretteStopcock,
    swirlConicalFlask,
    alignFlaskUnderBurette,
  });

  useEffect(() => {
    actionsRef.current = {
      pickUpApparatus,
      placeApparatus,
      selectApparatus,
      pourLiquid,
      measureApparatus,
      turnBuretteStopcock,
      swirlConicalFlask,
      alignFlaskUnderBurette,
    };
  }, [
    pickUpApparatus,
    placeApparatus,
    selectApparatus,
    pourLiquid,
    measureApparatus,
    turnBuretteStopcock,
    swirlConicalFlask,
    alignFlaskUnderBurette,
  ]);

  useEffect(() => {
    lastPlacementRef.current = placementState;
  }, [placementState]);

  // Global Keyboard listener attached once; reads latest state imperatively from labStore
  useEffect(() => {
    const handleKeyDown = (e) => {
      processEquipmentInteractionKeyDown(e, labStore, actionsRef.current);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Frame loop: Continuous detection & placement raycasting reading latest store state
  useFrame(() => {
    // Only run proximity detection when in avatar mode
    if (controlMode !== 'avatar') return;

    const pState = playerStateRef?.current;
    if (!pState) return;

    const storeState = labStore.getState();
    const apparatusList = labStore.getApparatusList();
    const heldApparatusId = storeState.heldApparatusId;
    const currentHeldApparatus = heldApparatusId
      ? storeState.apparatusById[heldApparatusId] || null
      : null;
    const currentPlacementState = storeState.placementState;
    const currentTargetId = storeState.targetApparatusId;

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
    let targetPlaceX = px + normForwardX * 0.95;
    const targetPlaceY = 0.92;
    let targetPlaceZ = pz + normForwardZ * 0.95;

    if (heldApparatusId && currentHeldApparatus) {
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
    }

    evaluatePlacementValidation({
      heldApparatusId,
      heldApparatus: currentHeldApparatus,
      currentPlacementState,
      apparatusList,
      targetPlaceX,
      targetPlaceY,
      targetPlaceZ,
      lastPlacementRef,
      lastValidationInputRef,
      targetPoint,
      setPlacementState,
    });

    // ================= 2. PROXIMITY & LINE-OF-SIGHT APPARATUS DETECTION =================
    const newTargetId = findTargetApparatusId({
      apparatusList,
      heldApparatusId,
      playerX: px,
      playerZ: pz,
      cameraPosition: camera.position,
      camDir: camDir.current,
      normForwardX,
      normForwardZ,
      isFirstPerson,
      toCamVec: toCamVec.current,
    });

    if (newTargetId !== currentTargetId) {
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
