import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { INITIAL_APPARATUS, CAMERA_PRESETS } from './labConstants';

export { CAMERA_PRESETS };

const LabContext = createContext(null);

export function LabProvider({ children }) {
  const [apparatusList, setApparatusList] = useState(INITIAL_APPARATUS);
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [cameraPreset, setCameraPreset] = useState('workbench');

  const selectedApparatus = useMemo(() => {
    return apparatusList.find((item) => item.id === selectedId) || null;
  }, [apparatusList, selectedId]);

  const selectApparatus = useCallback((id) => {
    setSelectedId(id);
  }, []);

  const hoverApparatus = useCallback((id) => {
    setHoveredId(id);
  }, []);

  const updateApparatusState = useCallback((id, partialUpdate) => {
    setApparatusList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...partialUpdate } : item))
    );
  }, []);

  const value = useMemo(
    () => ({
      apparatusList,
      selectedId,
      selectedApparatus,
      hoveredId,
      cameraPreset,
      selectApparatus,
      hoverApparatus,
      setCameraPreset,
      updateApparatusState,
    }),
    [
      apparatusList,
      selectedId,
      selectedApparatus,
      hoveredId,
      cameraPreset,
      selectApparatus,
      hoverApparatus,
      setCameraPreset,
      updateApparatusState,
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
