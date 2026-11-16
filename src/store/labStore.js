import { useCallback, useRef, useSyncExternalStore } from 'react';
import { INITIAL_APPARATUS } from '../context/labConstants';

/**
 * Pure Helper: Builds ordered ID index and per-ID entity lookup map from an apparatus array.
 * Preserves existing object references for unchanged apparatus items and retains
 * `apparatusIds` array identity whenever the ordered IDs have not changed.
 */
function computeApparatusIndex(prevIds = [], prevById = {}, nextList = []) {
  const nextIds = [];
  const nextById = {};
  let idsChanged = false;
  let mapChanged = false;

  for (let i = 0; i < nextList.length; i += 1) {
    const item = nextList[i];
    if (!item || !item.id) continue;
    const id = item.id;
    nextIds.push(id);

    if (i >= prevIds.length || prevIds[i] !== id) {
      idsChanged = true;
    }

    const prevItem = prevById[id];
    if (prevItem && Object.is(prevItem, item)) {
      nextById[id] = prevItem;
    } else {
      nextById[id] = item;
      mapChanged = true;
    }
  }

  if (nextIds.length !== prevIds.length) {
    idsChanged = true;
    mapChanged = true;
  }

  return {
    apparatusIds: idsChanged ? nextIds : prevIds,
    apparatusById: mapChanged ? nextById : prevById,
    changed: idsChanged || mapChanged,
  };
}

/**
 * Creates a vanilla external store for high-frequency interaction and apparatus entity state.
 * Compatible with React's `useSyncExternalStore` without third-party dependencies.
 *
 * State shape:
 * {
 *   apparatusIds: string[],
 *   apparatusById: Record<string, object>,
 *   activeStationId: string,
 *   selectedId: string | null,
 *   hoveredId: string | null,
 *   heldApparatusId: string | null,
 *   targetApparatusId: string | null,
 *   placementState: object | null,
 *   interactionNotice: object | null,
 * }
 */
export function createLabStore(initialApparatus = INITIAL_APPARATUS) {
  const initialIndex = computeApparatusIndex([], {}, initialApparatus);

  let state = {
    apparatusIds: initialIndex.apparatusIds,
    apparatusById: initialIndex.apparatusById,
    activeStationId: 'station-teacher',
    selectedId: null,
    hoveredId: null,
    heldApparatusId: null,
    targetApparatusId: null,
    placementState: null,
    interactionNotice: null,
  };

  const listeners = new Set();

  let cachedListIds = null;
  let cachedListById = null;
  let cachedList = null;

  function getState() {
    return state;
  }

  function getSnapshot() {
    return state;
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      return () => {};
    }
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function emit() {
    listeners.forEach((listener) => {
      listener();
    });
  }

  function getApparatusList() {
    if (
      cachedList !== null &&
      cachedListIds === state.apparatusIds &&
      cachedListById === state.apparatusById
    ) {
      return cachedList;
    }
    cachedListIds = state.apparatusIds;
    cachedListById = state.apparatusById;
    cachedList = state.apparatusIds.map((id) => state.apparatusById[id]).filter(Boolean);
    return cachedList;
  }

  function setField(key, value) {
    if (!Object.prototype.hasOwnProperty.call(state, key)) {
      return false;
    }
    if (Object.is(state[key], value)) {
      return false;
    }
    state = {
      ...state,
      [key]: value,
    };
    emit();
    return true;
  }

  function patch(partialState) {
    if (!partialState || typeof partialState !== 'object') {
      return false;
    }

    let nextState = state;
    let changed = false;

    if (Object.prototype.hasOwnProperty.call(partialState, 'apparatusList')) {
      const incomingList = Array.isArray(partialState.apparatusList)
        ? partialState.apparatusList
        : [];
      const idx = computeApparatusIndex(nextState.apparatusIds, nextState.apparatusById, incomingList);
      if (idx.changed) {
        nextState = {
          ...nextState,
          apparatusIds: idx.apparatusIds,
          apparatusById: idx.apparatusById,
        };
        changed = true;
      }
    }

    const keys = Object.keys(partialState);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (key === 'apparatusList') continue;
      if (!Object.prototype.hasOwnProperty.call(nextState, key)) continue;

      const nextVal = partialState[key];
      if (!Object.is(nextState[key], nextVal)) {
        if (nextState === state) {
          nextState = { ...state };
        }
        nextState[key] = nextVal;
        changed = true;
      }
    }

    if (!changed) {
      return false;
    }

    state = nextState;
    emit();
    return true;
  }

  function setApparatusList(nextListOrUpdater) {
    const prevList = getApparatusList();
    const resolvedList =
      typeof nextListOrUpdater === 'function' ? nextListOrUpdater(prevList) : nextListOrUpdater;

    if (!Array.isArray(resolvedList)) {
      return false;
    }

    const idx = computeApparatusIndex(state.apparatusIds, state.apparatusById, resolvedList);
    if (!idx.changed) {
      return false;
    }

    state = {
      ...state,
      apparatusIds: idx.apparatusIds,
      apparatusById: idx.apparatusById,
    };
    emit();
    return true;
  }

  function updateApparatusById(id, updaterOrPartial) {
    if (!id || !Object.prototype.hasOwnProperty.call(state.apparatusById, id)) {
      return false;
    }

    const prevItem = state.apparatusById[id];
    const nextItem =
      typeof updaterOrPartial === 'function'
        ? updaterOrPartial(prevItem)
        : updaterOrPartial && typeof updaterOrPartial === 'object'
        ? { ...prevItem, ...updaterOrPartial }
        : prevItem;

    if (!nextItem || Object.is(prevItem, nextItem)) {
      return false;
    }

    state = {
      ...state,
      apparatusById: {
        ...state.apparatusById,
        [id]: nextItem,
      },
    };
    emit();
    return true;
  }

  return {
    getState,
    getSnapshot,
    subscribe,
    setField,
    patch,
    setApparatusList,
    updateApparatusById,
    getApparatusList,
  };
}

export const labStore = createLabStore();

/**
 * Pure helper creating a memoized snapshot getter for a store + selector.
 * Guarantees referential stability when unrelated store fields change and
 * handles selector function identity changes safely.
 */
export function createSelectorSnapshotGetter(store, selector, isEqual = Object.is) {
  let initialized = false;
  let lastRootState = null;
  let lastSelector = selector;
  let lastIsEqual = isEqual;
  let lastValue;

  return function getSelectedSnapshot(nextSelector = lastSelector, nextIsEqual = lastIsEqual) {
    const nextRoot = store.getSnapshot();

    if (
      initialized &&
      Object.is(lastRootState, nextRoot) &&
      lastSelector === nextSelector &&
      lastIsEqual === nextIsEqual
    ) {
      return lastValue;
    }

    const nextValue = nextSelector(nextRoot);
    if (initialized && nextIsEqual(lastValue, nextValue)) {
      lastRootState = nextRoot;
      lastSelector = nextSelector;
      lastIsEqual = nextIsEqual;
      return lastValue;
    }

    initialized = true;
    lastRootState = nextRoot;
    lastSelector = nextSelector;
    lastIsEqual = nextIsEqual;
    lastValue = nextValue;
    return lastValue;
  };
}

/**
 * React hook subscribing to a slice of `labStore` (or a custom store instance)
 * via `React.useSyncExternalStore`.
 */
export function useLabSelector(selector, isEqual = Object.is, store = labStore) {
  const cacheRef = useRef({
    store: null,
    getter: null,
  });

  const getSelectedSnapshot = useCallback(() => {
    if (cacheRef.current.store !== store || !cacheRef.current.getter) {
      cacheRef.current.store = store;
      cacheRef.current.getter = createSelectorSnapshotGetter(store, selector, isEqual);
    }
    return cacheRef.current.getter(selector, isEqual);
  }, [store, selector, isEqual]);

  return useSyncExternalStore(store.subscribe, getSelectedSnapshot, getSelectedSnapshot);
}

// Module-level static selectors (never allocate new objects/arrays)
const selectApparatusIds = (state) => state.apparatusIds;
const selectSelectedId = (state) => state.selectedId;
const selectHoveredId = (state) => state.hoveredId;
const selectHeldApparatusId = (state) => state.heldApparatusId;
const selectTargetApparatusId = (state) => state.targetApparatusId;
const selectPlacementState = (state) => state.placementState;
const selectInteractionNotice = (state) => state.interactionNotice;
const selectSelectedApparatus = (state) =>
  state.selectedId ? state.apparatusById[state.selectedId] || null : null;
const selectHeldApparatus = (state) =>
  state.heldApparatusId ? state.apparatusById[state.heldApparatusId] || null : null;
const selectTargetApparatus = (state) =>
  state.targetApparatusId ? state.apparatusById[state.targetApparatusId] || null : null;

export function useApparatusIds(store = labStore) {
  return useLabSelector(selectApparatusIds, Object.is, store);
}

export function useApparatusById(id, store = labStore) {
  const selector = useCallback(
    (state) => (id ? state.apparatusById[id] || null : null),
    [id]
  );
  return useLabSelector(selector, Object.is, store);
}

export function useIsApparatusSelected(id, store = labStore) {
  const selector = useCallback((state) => Boolean(id && state.selectedId === id), [id]);
  return useLabSelector(selector, Object.is, store);
}

export function useIsApparatusHovered(id, store = labStore) {
  const selector = useCallback((state) => Boolean(id && state.hoveredId === id), [id]);
  return useLabSelector(selector, Object.is, store);
}

export function useIsApparatusTargeted(id, store = labStore) {
  const selector = useCallback((state) => Boolean(id && state.targetApparatusId === id), [id]);
  return useLabSelector(selector, Object.is, store);
}

export function useIsApparatusHeld(id, store = labStore) {
  const selector = useCallback((state) => Boolean(id && state.heldApparatusId === id), [id]);
  return useLabSelector(selector, Object.is, store);
}

export function useSelectedId(store = labStore) {
  return useLabSelector(selectSelectedId, Object.is, store);
}

export function useHoveredId(store = labStore) {
  return useLabSelector(selectHoveredId, Object.is, store);
}

export function useHeldApparatusId(store = labStore) {
  return useLabSelector(selectHeldApparatusId, Object.is, store);
}

export function useTargetApparatusId(store = labStore) {
  return useLabSelector(selectTargetApparatusId, Object.is, store);
}

export function useSelectedApparatus(store = labStore) {
  return useLabSelector(selectSelectedApparatus, Object.is, store);
}

export function useHeldApparatus(store = labStore) {
  return useLabSelector(selectHeldApparatus, Object.is, store);
}

export function useTargetApparatus(store = labStore) {
  return useLabSelector(selectTargetApparatus, Object.is, store);
}

export function usePlacementState(store = labStore) {
  return useLabSelector(selectPlacementState, Object.is, store);
}

export function useInteractionNotice(store = labStore) {
  return useLabSelector(selectInteractionNotice, Object.is, store);
}
