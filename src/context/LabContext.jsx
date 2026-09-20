import { createContext, useContext, useState, useMemo, useCallback, useRef } from 'react';
import { INITIAL_APPARATUS, CAMERA_PRESETS, WORKSTATIONS } from './labConstants';
import { DEFAULT_PLAYER_NAME, createInitialPlayerState } from '../player/playerTypes';
import { CHEMISTRY_ACTION_TYPES, executeChemistryAction } from '../chemistry/actionSystem';

export { CAMERA_PRESETS, WORKSTATIONS };

const LabContext = createContext(null);

export function LabProvider({ children }) {
  const [apparatusList, setApparatusList] = useState(INITIAL_APPARATUS);
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [activeStationId, setActiveStationId] = useState('station-teacher');
  const [cameraPreset, setCameraPreset] = useState('classroom');

  // Equipment Interaction State
  const [heldApparatusId, setHeldApparatusId] = useState(null);
  const [targetApparatusId, setTargetApparatusId] = useState(null);
  const [placementState, setPlacementState] = useState(null);
  const [interactionNotice, setInteractionNotice] = useState(null);

  // Player / Avatar & Camera Control Mode
  const [playerName, setPlayerName] = useState(DEFAULT_PLAYER_NAME);
  const [playerRole] = useState('student'); // 'student' | 'teacher'
  const [controlMode, setControlMode] = useState('avatar'); // 'avatar' (3rd person WASD) | 'overview' (Orbit)
  const [povMode, setPovMode] = useState('first-person'); // 'first-person' | 'third-person'
  const [teleportTarget, setTeleportTarget] = useState(null);

  const togglePovMode = useCallback(() => {
    setPovMode((prev) => (prev === 'first-person' ? 'third-person' : 'first-person'));
  }, []);

  // Synchronizable Player State Structure (ready for future Socket.IO sync)
  const playerStateRef = useRef(createInitialPlayerState({ name: playerName, role: playerRole }));

  const selectedApparatus = useMemo(() => {
    return apparatusList.find((item) => item.id === selectedId) || null;
  }, [apparatusList, selectedId]);

  const heldApparatus = useMemo(() => {
    return apparatusList.find((item) => item.id === heldApparatusId) || null;
  }, [apparatusList, heldApparatusId]);

  const targetApparatus = useMemo(() => {
    return apparatusList.find((item) => item.id === targetApparatusId) || null;
  }, [apparatusList, targetApparatusId]);

  const activeStation = useMemo(() => {
    return WORKSTATIONS.find((ws) => ws.id === activeStationId) || WORKSTATIONS[0];
  }, [activeStationId]);

  const selectApparatus = useCallback((id) => {
    setSelectedId(id);
    if (id) {
      const item = apparatusList.find((a) => a.id === id);
      if (item && item.workstationId) {
        setActiveStationId(item.workstationId);
      }
    }
  }, [apparatusList]);

  const hoverApparatus = useCallback((id) => {
    setHoveredId(id);
  }, []);

  const pickUpApparatus = useCallback((id) => {
    const item = apparatusList.find((a) => a.id === id);
    if (!item) return;

    // Check pickable condition
    if (item.isPickable === false) {
      setInteractionNotice({
        message: `${item.name} is a stationary installation and cannot be moved.`,
        type: 'warning',
        timestamp: Date.now(),
      });
      return;
    }

    setApparatusList((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, isHeld: true, heldBy: 'player', currentSurface: 'In Hands (Carried)' }
          : a
      )
    );
    setHeldApparatusId(id);
    setSelectedId(id);
    setTargetApparatusId(null);
    setInteractionNotice({
      message: `Carrying ${item.name}. Walk to any workstation and press [F] to place.`,
      type: 'success',
      timestamp: Date.now(),
    });
  }, [apparatusList]);

  const placeApparatus = useCallback(() => {
    if (!heldApparatusId) return;

    const item = apparatusList.find((a) => a.id === heldApparatusId);
    if (!item) return;

    if (!placementState || !placementState.isValid) {
      setInteractionNotice({
        message: placementState?.reason || 'Cannot place equipment here. Must be on a laboratory benchtop.',
        type: 'warning',
        timestamp: Date.now(),
      });
      return;
    }

    const { snappedPosition, surfaceId, surfaceName } = placementState;

    setApparatusList((prev) =>
      prev.map((a) =>
        a.id === heldApparatusId
          ? {
              ...a,
              isHeld: false,
              heldBy: null,
              position: snappedPosition,
              currentSurface: surfaceName,
              workstationId: surfaceId || a.workstationId,
            }
          : a
      )
    );

    setHeldApparatusId(null);
    setInteractionNotice({
      message: `Placed ${item.name} on ${surfaceName}.`,
      type: 'success',
      timestamp: Date.now(),
    });
  }, [heldApparatusId, apparatusList, placementState]);

  const selectStation = useCallback((stationId) => {
    setActiveStationId(stationId);
    setControlMode((currentMode) => {
      if (currentMode === 'overview') {
        if (stationId === 'station-teacher') {
          setCameraPreset('teacher');
        } else if (stationId === 'station-1') {
          setCameraPreset('workbench');
        } else {
          setCameraPreset(stationId);
        }
      }
      return currentMode;
    });
  }, []);

  const teleportPlayerTo = useCallback((x, z, rotY = Math.PI) => {
    setTeleportTarget({ x, z, rotY, timestamp: Date.now() });
    setControlMode('avatar');
  }, []);

  const teleportToStation = useCallback((stationId) => {
    setActiveStationId(stationId);
    const station = WORKSTATIONS.find((ws) => ws.id === stationId);
    if (station) {
      // Spawn student standing comfortably in front of the workstation
      const [sx, , sz] = station.position;
      const targetZ = station.type === 'teacher' ? sz + 1.4 : sz + 1.4;
      teleportPlayerTo(sx, targetZ, Math.PI);
    }
  }, [teleportPlayerTo]);

  const updateApparatusState = useCallback((id, partialUpdate) => {
    setApparatusList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...partialUpdate } : item))
    );
  }, []);

  const handlePlayerStateUpdate = useCallback((latestState) => {
    playerStateRef.current = latestState;
  }, []);

  // ================= CHEMISTRY ACTION DISPATCHERS =================
  const pourLiquid = useCallback((sourceId = null, destId = null, amount = 25) => {
    const src = sourceId || heldApparatusId;
    const dst = destId || targetApparatusId;

    if (!src || !dst) {
      setInteractionNotice({
        message: 'Pour action requires both a source container and a target container.',
        type: 'warning',
        timestamp: Date.now(),
      });
      return false;
    }

    let success = false;
    setApparatusList((prevList) => {
      const outcome = executeChemistryAction(
        CHEMISTRY_ACTION_TYPES.POUR,
        { sourceId: src, destId: dst, amount },
        prevList
      );
      success = outcome.success;
      setInteractionNotice({
        message: outcome.message,
        type: outcome.success ? 'success' : 'warning',
        timestamp: Date.now(),
      });
      return outcome.success ? outcome.updatedApparatusList : prevList;
    });
    return success;
  }, [heldApparatusId, targetApparatusId]);

  const mixContainers = useCallback((containerAId, containerBId, amount = 25) => {
    return pourLiquid(containerAId, containerBId, amount);
  }, [pourLiquid]);

  const addReagent = useCallback((targetId, chemicalId, amount = 25, concentration = null) => {
    if (!targetId || !chemicalId) return false;

    let success = false;
    setApparatusList((prevList) => {
      const outcome = executeChemistryAction(
        CHEMISTRY_ACTION_TYPES.ADD_REAGENT,
        { targetId, chemicalId, amount, concentration },
        prevList
      );
      success = outcome.success;
      setInteractionNotice({
        message: outcome.message,
        type: outcome.success ? 'success' : 'warning',
        timestamp: Date.now(),
      });
      return outcome.success ? outcome.updatedApparatusList : prevList;
    });
    return success;
  }, []);

  const measureApparatus = useCallback((targetId) => {
    if (!targetId) return null;
    let measurement = null;
    setApparatusList((prevList) => {
      const outcome = executeChemistryAction(
        CHEMISTRY_ACTION_TYPES.MEASURE,
        { targetId },
        prevList
      );
      measurement = outcome.result;
      setInteractionNotice({
        message: outcome.message,
        type: 'info',
        timestamp: Date.now(),
      });
      return prevList;
    });
    return measurement;
  }, []);

  const heatApparatus = useCallback((targetId, deltaTemp = 5) => {
    if (!targetId) return false;
    let success = false;
    setApparatusList((prevList) => {
      const outcome = executeChemistryAction(
        CHEMISTRY_ACTION_TYPES.HEAT,
        { targetId, deltaTemp },
        prevList
      );
      success = outcome.success;
      setInteractionNotice({
        message: outcome.message,
        type: outcome.success ? 'success' : 'warning',
        timestamp: Date.now(),
      });
      return outcome.success ? outcome.updatedApparatusList : prevList;
    });
    return success;
  }, []);

  const value = useMemo(
    () => ({
      workstations: WORKSTATIONS,
      activeStationId,
      activeStation,
      apparatusList,
      selectedId,
      selectedApparatus,
      hoveredId,
      cameraPreset,
      controlMode,
      povMode,
      setPovMode,
      togglePovMode,
      playerName,
      playerRole,
      playerStateRef,
      teleportTarget,
      // Interaction System
      heldApparatusId,
      heldApparatus,
      targetApparatusId,
      targetApparatus,
      setTargetApparatusId,
      placementState,
      setPlacementState,
      pickUpApparatus,
      placeApparatus,
      interactionNotice,
      setInteractionNotice,
      // Chemistry Action System
      pourLiquid,
      mixContainers,
      addReagent,
      measureApparatus,
      heatApparatus,
      setControlMode,
      setPlayerName,
      selectStation,
      selectApparatus,
      hoverApparatus,
      setCameraPreset,
      updateApparatusState,
      teleportPlayerTo,
      teleportToStation,
      handlePlayerStateUpdate,
    }),
    [
      activeStationId,
      activeStation,
      apparatusList,
      selectedId,
      selectedApparatus,
      hoveredId,
      cameraPreset,
      controlMode,
      povMode,
      togglePovMode,
      playerName,
      playerRole,
      teleportTarget,
      heldApparatusId,
      heldApparatus,
      targetApparatusId,
      targetApparatus,
      placementState,
      interactionNotice,
      pickUpApparatus,
      placeApparatus,
      pourLiquid,
      mixContainers,
      addReagent,
      measureApparatus,
      heatApparatus,
      selectStation,
      selectApparatus,
      hoverApparatus,
      setCameraPreset,
      updateApparatusState,
      teleportPlayerTo,
      teleportToStation,
      handlePlayerStateUpdate,
    ]
  );

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLab() {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
}
