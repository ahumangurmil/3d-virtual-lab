import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { LabRoom } from './LabRoom';
import { CameraController } from './CameraController';
import { Beaker } from '../apparatus/Beaker';
import { ConicalFlask } from '../apparatus/ConicalFlask';
import { TestTubeRack } from '../apparatus/TestTubeRack';
import { BunsenBurner } from '../apparatus/BunsenBurner';
import { useLab } from '../../context/LabContext';

export function LabCanvas() {
  const {
    apparatusList,
    selectedId,
    hoveredId,
    selectApparatus,
    hoverApparatus,
  } = useLab();

  return (
    <div className="canvas-container">
      <Canvas
        shadows
        camera={{
          position: [0, 1.8, 1.7],
          fov: 46,
          near: 0.1,
          far: 25,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        onPointerMissed={() => {
          // Deselect when clicking empty space
          selectApparatus(null);
        }}
      >
        {/* ================= LIGHTING ================= */}
        {/* Cool, clear ambient illumination for soft fill across the entire room */}
        <ambientLight intensity={0.65} color="#f0f9ff" />

        {/* Primary warm-neutral overhead daylight illumination (5000K) */}
        <directionalLight
          position={[0, 4.2, 0.5]}
          intensity={1.25}
          color="#fffdfa"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={8}
          shadow-camera-left={-2.5}
          shadow-camera-right={2.5}
          shadow-camera-top={2.5}
          shadow-camera-bottom={-2.5}
          shadow-bias={-0.0001}
        />

        {/* Soft front fill light from student/observer perspective */}
        <directionalLight
          position={[1.2, 2.2, 2.0]}
          intensity={0.35}
          color="#f1f5f9"
        />

        {/* Counter balanced soft fill */}
        <directionalLight
          position={[-1.8, 2.0, -0.8]}
          intensity={0.25}
          color="#e0f2fe"
        />

        {/* Workbench localized task illumination */}
        <pointLight
          position={[0, 2.2, 0.2]}
          intensity={0.4}
          distance={4}
          decay={2}
          color="#ffffff"
        />

        {/* ================= 3D ENVIRONMENT ================= */}
        <LabRoom />

        {/* ================= 3D APPARATUS COLLECTION ================= */}
        <group name="apparatus-layer">
          {apparatusList.map((item) => {
            const isSelected = selectedId === item.id;
            const isHovered = hoveredId === item.id;

            if (item.type === 'beaker_250' || item.type === 'beaker_500') {
              return (
                <Beaker
                  key={item.id}
                  {...item}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  onSelect={selectApparatus}
                  onHover={hoverApparatus}
                />
              );
            }

            if (item.type === 'conical_flask_250') {
              return (
                <ConicalFlask
                  key={item.id}
                  {...item}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  onSelect={selectApparatus}
                  onHover={hoverApparatus}
                />
              );
            }

            if (item.type === 'test_tube_rack') {
              return (
                <TestTubeRack
                  key={item.id}
                  {...item}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  onSelect={selectApparatus}
                  onHover={hoverApparatus}
                />
              );
            }

            if (item.type === 'bunsen_burner') {
              return (
                <BunsenBurner
                  key={item.id}
                  {...item}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  onSelect={selectApparatus}
                  onHover={hoverApparatus}
                />
              );
            }

            return null;
          })}
        </group>

        {/* Camera Navigation */}
        <CameraController />
      </Canvas>
    </div>
  );
}
