import { createContext, useContext, useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { INITIAL_APPARATUS, CAMERA_PRESETS, WORKSTATIONS } from './labConstants';
import { DEFAULT_PLAYER_NAME, createInitialPlayerState } from '../player/playerTypes';
import { CHEMISTRY_ACTION_TYPES, executeChemistryAction } from '../chemistry/actionSystem';
import { TitrationExperimentState } from '../experiments/experimentState';
import { TitrationController } from '../experiments/TitrationController';

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

  // Titration Experiment Controller & State
  const titrationInstance = useMemo(() => {
    const state = new TitrationExperimentState();
    const controller = new TitrationController(state);
    return { state, controller };
  }, []);
  const [titrationState, setTitrationState] = useState(() => titrationInstance.state.getSnapshot());

  useEffect(() => {
    const unsub = titrationInstance.state.subscribe((snap) => {
      setTitrationState(snap);
    });
    return unsub;
  }, [titrationInstance]);

  // Synchronize titration state when apparatus list changes
  useEffect(() => {
    titrationInstance.state.syncWithApparatus(apparatusList, activeStationId);
  }, [titrationInstance, apparatusList, activeStationId]);

  const startTitration = useCallback(() => {
    titrationInstance.state.start();
    titrationInstance.state.syncWithApparatus(apparatusList, activeStationId);
  }, [titrationInstance, apparatusList, activeStationId]);

  const resetTitration = useCallback(() => {
    titrationInstance.state.reset();
  }, [titrationInstance]);

  const pauseTitration = useCallback(() => {
    titrationInstance.state.pause();
  }, [titrationInstance]);

  const resumeTitration = useCallback(() => {
    titrationInstance.state.resume();
  }, [titrationInstance]);

  const executeTitrationStepAction = useCallback(() => {
    const res = titrationInstance.controller.executeCurrentStepAction(apparatusList, activeStationId);
    if (res.updatedApparatusList && res.updatedApparatusList !== apparatusList) {
      setApparatusList(res.updatedApparatusList);
    }
    setInteractionNotice({
      message: res.message,
      type: res.success ? 'success' : 'warning',
      timestamp: Date.now(),
    });
    return res;
  }, [titrationInstance, apparatusList, activeStationId]);

  const setTitrationStudentReading = useCallback((reading) => {
    const res = titrationInstance.controller.validateAndSubmitReading(
      reading,
      apparatusList,
      activeStationId
    );
    setInteractionNotice({
      message: res.message,
      type: res.success ? 'success' : 'warning',
      timestamp: Date.now(),
    });
    return res.success;
  }, [titrationInstance, apparatusList, activeStationId]);

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
      const targetStationId = item?.workstationId || activeStationId;
      if (item && item.workstationId && item.workstationId !== activeStationId) {
        setActiveStationId(item.workstationId);
      }
      if (titrationInstance.state.status === 'in_progress') {
        titrationInstance.controller.handlePlayerAction(
          'INSPECT',
          { targetId: id },
          { success: true },
          apparatusList,
          targetStationId
        );
      }
    }
  }, [apparatusList, activeStationId, titrationInstance]);

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

    const targetStationId = item.workstationId || activeStationId;
    if (item.workstationId && item.workstationId !== activeStationId) {
      setActiveStationId(item.workstationId);
    }

    const nextList = apparatusList.map((a) =>
      a.id === id
        ? { ...a, isHeld: true, heldBy: 'player', currentSurface: 'In Hands (Carried)' }
        : a
    );
    setApparatusList(nextList);
    setHeldApparatusId(id);
    setSelectedId(id);
    setTargetApparatusId(null);
    setInteractionNotice({
      message: `Carrying ${item.name}. Walk to any workstation and press [F] to place.`,
      type: 'success',
      timestamp: Date.now(),
    });

    titrationInstance.controller.handlePlayerAction(
      'PICK_UP',
      { targetId: id },
      { success: true },
      nextList,
      targetStationId
    );
  }, [apparatusList, activeStationId, titrationInstance]);

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
    const targetStationId = surfaceId || item.workstationId || activeStationId;
    if (surfaceId && surfaceId !== activeStationId) {
      setActiveStationId(surfaceId);
    }

    const nextList = apparatusList.map((a) =>
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
    );
    setApparatusList(nextList);

    setHeldApparatusId(null);
    setPlacementState(null);
    setInteractionNotice({
      message: `Placed ${item.name} on ${surfaceName}.`,
      type: 'success',
      timestamp: Date.now(),
    });

    titrationInstance.controller.handlePlayerAction(
      'PLACE',
      { targetId: heldApparatusId },
      { success: true },
      nextList,
      targetStationId
    );
  }, [heldApparatusId, apparatusList, placementState, activeStationId, titrationInstance]);

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
    let src = sourceId || heldApparatusId;
    let dst = destId || targetApparatusId;

    if (!src || !dst) {
      setInteractionNotice({
        message: 'Action requires both a held/source container and a target container.',
        type: 'warning',
        timestamp: Date.now(),
      });
      return false;
    }

    const srcItem = apparatusList.find((a) => a.id === src);
    const dstItem = apparatusList.find((a) => a.id === dst);

    // Case: Player holds an empty/partially-filled pipette and targets a liquid container
    // Natural lab action: Draw (aspirate) from target into pipette!
    let isPipetteAspirate = false;
    if (srcItem?.type === 'pipette_25' && (srcItem.liquid?.volume || 0) < 5 && (dstItem?.liquid?.volume || 0) > 0) {
      const tmp = src;
      src = dst;
      dst = tmp;
      isPipetteAspirate = true;
    }

    // Educational Titration Mistake Detection & Step Validation
    const validation = titrationInstance.controller.validateAction(
      CHEMISTRY_ACTION_TYPES.POUR,
      { sourceId: src, destId: dst, amount },
      apparatusList
    );
    if (!validation.allowed) {
      setInteractionNotice({
        message: validation.reason,
        type: 'warning',
        timestamp: Date.now(),
      });
      return false;
    }

    const outcome = executeChemistryAction(
      CHEMISTRY_ACTION_TYPES.POUR,
      { sourceId: src, destId: dst, amount },
      apparatusList
    );

    let noticeMsg = outcome.message;
    if (isPipetteAspirate && outcome.success) {
      const actualVol = outcome.result?.transferredVolume || amount;
      noticeMsg = `Aspirated ${actualVol.toFixed(1)} mL of solution into the 25 mL volumetric pipette. Move to conical flask to dispense.`;
    }

    const targetStationId = dstItem?.workstationId || srcItem?.workstationId || activeStationId;
    if ((dstItem?.workstationId || srcItem?.workstationId) && targetStationId !== activeStationId) {
      setActiveStationId(targetStationId);
    }

    if (outcome.success) {
      setApparatusList(outcome.updatedApparatusList);
      titrationInstance.controller.handlePlayerAction(
        isPipetteAspirate ? 'ASPIRATE' : CHEMISTRY_ACTION_TYPES.POUR,
        { sourceId: src, destId: dst, amount },
        outcome,
        outcome.updatedApparatusList,
        targetStationId
      );
    }

    setInteractionNotice({
      message: noticeMsg,
      type: outcome.success ? 'success' : 'warning',
      timestamp: Date.now(),
    });

    return outcome.success;
  }, [heldApparatusId, targetApparatusId, titrationInstance, apparatusList, activeStationId]);

  const turnBuretteStopcock = useCallback((amount = 5) => {
    const stationItems = activeStationId
      ? apparatusList.filter((a) => a.workstationId === activeStationId || !a.workstationId)
      : apparatusList;
    const burette = stationItems.find((a) => a.type === 'burette_50');
    const flask = stationItems.find((a) => a.type === 'conical_flask_250');

    if (!burette || !flask) {
      setInteractionNotice({
        message: 'Burette or conical flask not found on workstation.',
        type: 'warning',
        timestamp: Date.now(),
      });
      return false;
    }

    const validation = titrationInstance.controller.validateAction(
      CHEMISTRY_ACTION_TYPES.POUR,
      { sourceId: burette.id, destId: flask.id, amount, actionKind: 'TURN_STOPCOCK' },
      apparatusList
    );
    if (!validation.allowed) {
      setInteractionNotice({
        message: validation.reason,
        type: 'warning',
        timestamp: Date.now(),
      });
      return false;
    }

    if ((burette.liquid?.volume || 0) <= 0) {
      setInteractionNotice({
        message: 'Burette is empty. Fill burette with 0.1 M NaOH titrant first.',
        type: 'warning',
        timestamp: Date.now(),
      });
      return false;
    }

    // Transfer titrant from burette into conical flask
    const outcome = executeChemistryAction(
      CHEMISTRY_ACTION_TYPES.POUR,
      { sourceId: burette.id, destId: flask.id, amount },
      apparatusList
    );

    if (outcome.success) {
      setApparatusList(outcome.updatedApparatusList);
      titrationInstance.controller.handlePlayerAction(
        'TURN_STOPCOCK',
        { sourceId: burette.id, destId: flask.id, amount },
        outcome,
        outcome.updatedApparatusList,
        activeStationId
      );
    }

    setInteractionNotice({
      message: outcome.message,
      type: outcome.success ? 'success' : 'warning',
      timestamp: Date.now(),
    });

    return outcome.success;
  }, [activeStationId, apparatusList, titrationInstance]);

  const swirlConicalFlask = useCallback((flaskId = null) => {
    const stationItems = activeStationId
      ? apparatusList.filter((a) => a.workstationId === activeStationId || !a.workstationId)
      : apparatusList;
    const targetFlask = flaskId
      ? apparatusList.find((a) => a.id === flaskId)
      : stationItems.find((a) => a.type === 'conical_flask_250');

    if (!targetFlask) return false;

    const vol = targetFlask.liquid?.volume || 0;
    const ph = targetFlask.liquid?.ph || 7.0;
    const hasIndicator = targetFlask.liquid?.hasIndicator;
    const isPink = hasIndicator && ph >= 8.2;

    let msg = `Swirled conical flask (${vol} mL). `;
    if (isPink) {
      msg += `Persistent faint pink color observed (pH ${ph.toFixed(1)}). Stoichiometric endpoint reached!`;
    } else if (hasIndicator && vol > 25) {
      msg += `Transient pink flashes disappear rapidly upon swirling as excess acid neutralizes localized base (pH ${ph.toFixed(1)}).`;
    } else {
      msg += `Solution thoroughly mixed (pH ${ph.toFixed(1)}).`;
    }

    setInteractionNotice({
      message: msg,
      type: 'info',
      timestamp: Date.now(),
    });

    titrationInstance.controller.handlePlayerAction(
      'SWIRL',
      { flaskId: targetFlask.id },
      { success: true, message: msg },
      apparatusList,
      activeStationId
    );
    return true;
  }, [activeStationId, apparatusList, titrationInstance]);

  const alignFlaskUnderBurette = useCallback(() => {
    const res = titrationInstance.controller.positionFlaskUnderBurette(apparatusList, activeStationId);
    if (res.success && res.updatedApparatusList) {
      setApparatusList(res.updatedApparatusList);
    }
    setInteractionNotice({
      message: res.message,
      type: res.success ? 'success' : 'warning',
      timestamp: Date.now(),
    });
    return res.success;
  }, [titrationInstance, apparatusList, activeStationId]);

  const mixContainers = useCallback((containerAId, containerBId, amount = 25) => {
    return pourLiquid(containerAId, containerBId, amount);
  }, [pourLiquid]);

  const addReagent = useCallback((targetId, chemicalId, amount = 25, concentration = null) => {
    if (!targetId || !chemicalId) return false;

    // Educational Titration Mistake Detection & Step Validation
    const validation = titrationInstance.controller.validateAction(
      CHEMISTRY_ACTION_TYPES.ADD_REAGENT,
      { targetId, chemicalId, amount, concentration },
      apparatusList
    );
    if (!validation.allowed) {
      setInteractionNotice({
        message: validation.reason,
        type: 'warning',
        timestamp: Date.now(),
      });
      return false;
    }

    const outcome = executeChemistryAction(
      CHEMISTRY_ACTION_TYPES.ADD_REAGENT,
      { targetId, chemicalId, amount, concentration },
      apparatusList
    );

    if (outcome.success) {
      setApparatusList(outcome.updatedApparatusList);
      titrationInstance.controller.handlePlayerAction(
        CHEMISTRY_ACTION_TYPES.ADD_REAGENT,
        { targetId, chemicalId, amount, concentration },
        outcome,
        outcome.updatedApparatusList,
        activeStationId
      );
    }

    setInteractionNotice({
      message: outcome.message,
      type: outcome.success ? 'success' : 'warning',
      timestamp: Date.now(),
    });

    return outcome.success;
  }, [titrationInstance, apparatusList, activeStationId]);

  const measureApparatus = useCallback((targetId) => {
    if (!targetId) return null;
    const outcome = executeChemistryAction(
      CHEMISTRY_ACTION_TYPES.MEASURE,
      { targetId },
      apparatusList
    );
    setInteractionNotice({
      message: outcome.message,
      type: 'info',
      timestamp: Date.now(),
    });
    return outcome.result;
  }, [apparatusList]);

  const heatApparatus = useCallback((targetId, deltaTemp = 5) => {
    if (!targetId) return false;
    const outcome = executeChemistryAction(
      CHEMISTRY_ACTION_TYPES.HEAT,
      { targetId, deltaTemp },
      apparatusList
    );
    if (outcome.success) {
      setApparatusList(outcome.updatedApparatusList);
    }
    setInteractionNotice({
      message: outcome.message,
      type: outcome.success ? 'success' : 'warning',
      timestamp: Date.now(),
    });
    return outcome.success;
  }, [apparatusList]);

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
      turnBuretteStopcock,
      swirlConicalFlask,
      alignFlaskUnderBurette,
      // Titration Experiment System
      titrationState,
      startTitration,
      resetTitration,
      pauseTitration,
      resumeTitration,
      executeTitrationStepAction,
      setTitrationStudentReading,
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
      turnBuretteStopcock,
      swirlConicalFlask,
      alignFlaskUnderBurette,
      titrationState,
      startTitration,
      resetTitration,
      pauseTitration,
      resumeTitration,
      executeTitrationStepAction,
      setTitrationStudentReading,
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
