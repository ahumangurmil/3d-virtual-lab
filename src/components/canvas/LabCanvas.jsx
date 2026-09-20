import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { LabRoom } from './LabRoom';
import { Workstation } from './Workstation';
import { CameraController } from './CameraController';
import { Player } from '../../player/Player';
import { useLab } from '../../context/LabContext';
import { InteractiveApparatus } from '../../interaction/InteractiveApparatus';
import { ApparatusModel } from '../apparatus/ApparatusModel';
import { EquipmentInteractionManager } from '../../interaction/EquipmentInteractionManager';
import { isApparatusPickable } from '../../interaction/interactionTypes';

export function LabCanvas() {
  const {
    workstations,
    activeStationId,
    selectStation,
    apparatusList,
    selectedId,
    hoveredId,
    heldApparatusId,
    heldApparatus,
    targetApparatusId,
    selectApparatus,
    hoverApparatus,
    pickUpApparatus,
    playerName,
    playerRole,
    controlMode,
    teleportTarget,
    handlePlayerStateUpdate,
  } = useLab();

  return (
    <div className="canvas-container">
      <Canvas
        shadows
        camera={{
          position: [0, 10.5, 14.5],
          fov: 48,
          near: 0.1,
          far: 75,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.12,
        }}
        onPointerMissed={() => {
          // Deselect when clicking empty floor space
          selectApparatus(null);
        }}
      >
        {/* ================= LIGHTING: UNIFORM CLASSROOM ILLUMINATION ================= */}
        {/* Soft, cool ambient fill lighting across the entire 22m x 24m classroom */}
        <ambientLight intensity={0.72} color="#f0f9ff" />

        {/* Primary overhead daylight illumination (5000K daylight) */}
        <directionalLight
          position={[3, 14, 2]}
          intensity={1.15}
          color="#fffdfa"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={32}
          shadow-camera-left={-13}
          shadow-camera-right={13}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
          shadow-bias={-0.00015}
        />

        {/* Soft fill light from front teacher board perspective */}
        <directionalLight
          position={[0, 8, -10]}
          intensity={0.45}
          color="#f8fafc"
        />

        {/* Diffused fill light from window wall (East/Right side) */}
        <directionalLight
          position={[12, 6, 0]}
          intensity={0.4}
          color="#e0f2fe"
        />

        {/* Rear student entrance fill light */}
        <directionalLight
          position={[0, 7, 12]}
          intensity={0.35}
          color="#f1f5f9"
        />

        {/* Dedicated task light for Teacher Demonstration bench */}
        <pointLight
          position={[0, 3.5, -8.0]}
          intensity={0.5}
          distance={8}
          decay={2}
          color="#ffffff"
        />

        {/* ================= 3D CLASSROOM ENVIRONMENT & STORAGE ================= */}
        <LabRoom />

        {/* ================= REUSABLE WORKSTATIONS ================= */}
        <group name="workstations-layer">
          {workstations.map((ws) => (
            <Workstation
              key={ws.id}
              id={ws.id}
              stationNumber={ws.stationNumber}
              title={ws.name}
              position={ws.position}
              rotation={ws.rotation}
              width={ws.width}
              depth={ws.depth}
              height={ws.height}
              isTeacher={ws.type === 'teacher'}
              isSelected={activeStationId === ws.id}
              onSelectStation={selectStation}
            />
          ))}
        </group>

        {/* ================= MODULAR 3D APPARATUS COLLECTION ================= */}
        <group name="apparatus-layer">
          {apparatusList.map((item) => (
            <InteractiveApparatus
              key={item.id}
              apparatus={item}
              isTargeted={targetApparatusId === item.id}
              isSelected={selectedId === item.id}
              isHovered={hoveredId === item.id}
              isHeld={heldApparatusId === item.id}
              canPickUp={isApparatusPickable(item)}
              onSelect={selectApparatus}
              onPickUp={pickUpApparatus}
              onHover={hoverApparatus}
            >
              <ApparatusModel
                apparatus={item}
                isSelected={selectedId === item.id}
                isHovered={hoveredId === item.id || targetApparatusId === item.id}
              />
            </InteractiveApparatus>
          ))}
        </group>

        {/* ================= EQUIPMENT INTERACTION & PLACEMENT MANAGER ================= */}
        <EquipmentInteractionManager />

        {/* ================= LOCAL STUDENT PLAYER ================= */}
        <Player
          playerName={playerName}
          role={playerRole}
          color="#0284c7"
          isActive={controlMode === 'avatar'}
          teleportTarget={teleportTarget}
          heldApparatus={heldApparatus}
          onStateUpdate={handlePlayerStateUpdate}
        />

        {/* Camera Navigation Controller */}
        <CameraController />
      </Canvas>
    </div>
  );
}
