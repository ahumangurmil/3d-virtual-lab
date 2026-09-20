import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useLab, CAMERA_PRESETS, WORKSTATIONS } from '../../context/LabContext';

export function CameraController() {
  const controlsRef = useRef();
  const { camera } = useThree();
  const { cameraPreset, selectedApparatus, controlMode } = useLab();

  // Target coordinates for smooth camera interpolation
  const desiredPos = useRef(new THREE.Vector3(0, 10.5, 14.5));
  const desiredTarget = useRef(new THREE.Vector3(0, 1.2, -1.0));
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (controlMode === 'avatar') return;

    let preset = CAMERA_PRESETS[cameraPreset];

    // If cameraPreset is a specific workstation id (e.g. 'station-3')
    if (!preset && cameraPreset) {
      const station = WORKSTATIONS.find((ws) => ws.id === cameraPreset);
      if (station && station.cameraFocus) {
        preset = station.cameraFocus;
      }
    }

    // If an apparatus is selected and in closeup mode, focus camera on its position
    if (cameraPreset === 'closeup' && selectedApparatus) {
      const [ax, ay, az] = selectedApparatus.position;
      desiredTarget.current.set(ax, ay + 0.08, az);
      desiredPos.current.set(ax, ay + 0.35, az + 0.55);
    } else if (preset) {
      desiredPos.current.set(...preset.position);
      desiredTarget.current.set(...preset.target);
    }

    isTransitioning.current = true;
  }, [cameraPreset, selectedApparatus, controlMode]);

  useFrame((state, delta) => {
    if (controlMode === 'avatar') return;

    if (isTransitioning.current && controlsRef.current) {
      const step = Math.min(delta * 4.0, 0.2);
      camera.position.lerp(desiredPos.current, step);
      controlsRef.current.target.lerp(desiredTarget.current, step);
      controlsRef.current.update();

      // Stop transition when close enough
      if (
        camera.position.distanceTo(desiredPos.current) < 0.02 &&
        controlsRef.current.target.distanceTo(desiredTarget.current) < 0.02
      ) {
        isTransitioning.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={controlMode === 'overview'}
      enableDamping
      dampingFactor={0.06}
      minDistance={0.35}
      maxDistance={28.0}
      minPolarAngle={0.05}
      maxPolarAngle={Math.PI / 2 - 0.02} // Restrict camera from going underneath the floor
      onStart={() => {
        // Cancel automated transition if user manually moves the camera
        isTransitioning.current = false;
      }}
    />
  );
}
