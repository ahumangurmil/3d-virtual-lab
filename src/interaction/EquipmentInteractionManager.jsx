import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useLab } from '../context/LabContext';
import { validateApparatusPlacement } from './surfaces';
import { isApparatusPickable } from './interactionTypes';
import { PlacementIndicator } from './PlacementIndicator';

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

  // Bench height plane for mouse raycasting when placing apparatus
  const benchPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.92));
  const mouseIntersection = useRef(new THREE.Vector3());

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
          pourLiquid(heldApparatusId, targetApparatusId, 25);
        } else if (selectedId && targetApparatusId && selectedId !== targetApparatusId) {
          pourLiquid(selectedId, targetApparatusId, 25);
        }
      }

      // [T] Key: Turn burette stopcock (dispense titrant into conical flask)
      if (e.code === 'KeyT') {
        turnBuretteStopcock(10);
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
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);

    // Avatar forward direction in world space (-Z is front when rotY = 0)
    const avatarForwardX = -Math.sin(rotY);
    const avatarForwardZ = -Math.cos(rotY);

    const isFirstPerson = povMode === 'first-person';
    const forwardX = isFirstPerson ? camDir.x : avatarForwardX;
    const forwardZ = isFirstPerson ? camDir.z : avatarForwardZ;
    const fMag = Math.hypot(forwardX, forwardZ) || 1;
    const normForwardX = forwardX / fMag;
    const normForwardZ = forwardZ / fMag;

    // ================= 1. HELD APPARATUS PLACEMENT TARGETING =================
    if (heldApparatusId && heldApparatus) {
      let targetPlaceX = px + normForwardX * 0.95;
      const targetPlaceY = 0.92;
      let targetPlaceZ = pz + normForwardZ * 0.95;

      // In first-person or mouse mode, check if camera raycast hits benchtop within player reach (~2.5m)
      raycaster.setFromCamera(isFirstPerson ? new THREE.Vector2(0, 0) : mouse, camera);
      const hit = raycaster.ray.intersectPlane(benchPlane.current, mouseIntersection.current);
      if (hit) {
        const distFromPlayer = Math.hypot(hit.x - px, hit.z - pz);
        if (distFromPlayer <= 2.5) {
          targetPlaceX = hit.x;
          targetPlaceZ = hit.z;
        }
      }

      // Validate prospective placement surface
      const validation = validateApparatusPlacement(
        [targetPlaceX, targetPlaceY, targetPlaceZ],
        heldApparatus,
        apparatusList
      );

      setPlacementState(validation);
    } else if (placementState !== null) {
      setPlacementState(null);
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
      const toCamVec = new THREE.Vector3(
        ix - camera.position.x,
        iy - camera.position.y,
        iz - camera.position.z
      ).normalize();
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
