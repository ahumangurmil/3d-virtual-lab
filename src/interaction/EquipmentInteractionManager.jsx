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
    placementState,
    setPlacementState,
    pickUpApparatus,
    placeApparatus,
    selectApparatus,
    playerStateRef,
    controlMode,
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

      // [E] Key: Inspect / select targeted apparatus
      if (e.code === 'KeyE') {
        if (targetApparatusId) {
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
    apparatusList,
    pickUpApparatus,
    placeApparatus,
    selectApparatus,
  ]);

  // Frame loop: Continuous detection & placement raycasting
  useFrame(() => {
    // Only run proximity detection when in 3rd-person avatar mode
    if (controlMode !== 'avatar') return;

    const pState = playerStateRef?.current;
    if (!pState) return;

    const [px, , pz] = pState.position;
    const rotY = pState.rotation[1] || 0;

    // Avatar forward direction in world space (front is -Z in local avatar space)
    // with rotY = PI (facing front), forward vector is [0, 0, -1]
    const forwardX = Math.sin(rotY);
    const forwardZ = Math.cos(rotY);

    // ================= 1. HELD APPARATUS PLACEMENT TARGETING =================
    if (heldApparatusId && heldApparatus) {
      let targetPlaceX = px + forwardX * 0.95;
      const targetPlaceY = 0.92;
      let targetPlaceZ = pz + forwardZ * 0.95;

      // If user is hovering mouse over canvas, check if raycast hits benchtop within player reach (~2.4m)
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster.ray.intersectPlane(benchPlane.current, mouseIntersection.current);
      if (hit) {
        const distFromPlayerSq = (hit.x - px) ** 2 + (hit.z - pz) ** 2;
        if (distFromPlayerSq <= 2.4 ** 2) {
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
      return;
    }

    // ================= 2. PROXIMITY & LINE-OF-SIGHT APPARATUS DETECTION =================
    const MAX_INTERACTION_DIST = 2.4;
    let closestItem = null;
    let highestScore = -Infinity;

    for (const item of apparatusList) {
      if (item.isHeld) continue;

      const [ix, , iz] = item.position;
      const dx = ix - px;
      const dz = iz - pz;
      const dist = Math.hypot(dx, dz);

      if (dist > MAX_INTERACTION_DIST) continue;

      // Angle calculation between avatar facing vector and vector to apparatus
      const dirX = dx / (dist || 1);
      const dirZ = dz / (dist || 1);
      const dot = forwardX * dirX + forwardZ * dirZ; // 1.0 = directly in front, -1.0 = behind

      // Must be roughly in front of avatar (dot > 0.15) or very close (dist < 1.1)
      if (dot > 0.15 || dist < 1.1) {
        // Score favors items directly in line of sight and closer to the student
        const score = dot * 2.0 - dist;
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
