/**
 * Equipment Interaction System - Action & State Types
 * Designed for modular extension across future practical milestones (Titration, Reagents, Heating).
 */

export const INTERACTION_ACTIONS = {
  INSPECT: 'inspect',
  PICK_UP: 'pickUp',
  PLACE: 'place',
  // Generic action stubs reserved for future milestones
  POUR: 'pour',
  MEASURE: 'measure',
  MIX: 'mix',
  HEAT: 'heat',
  ADD_REAGENT: 'addReagent',
};

export const EQUIPMENT_STATES = {
  IDLE: 'idle',
  HELD: 'held',
  PLACED: 'placed',
  INSPECTING: 'inspecting',
};

export const APPARATUS_TYPES = {
  BEAKER_250: 'beaker_250',
  BEAKER_500: 'beaker_500',
  CONICAL_FLASK_250: 'conical_flask_250',
  TEST_TUBE: 'test_tube',
  TEST_TUBE_RACK: 'test_tube_rack',
  BURETTE: 'burette_50',
  BUNSEN_BURNER: 'bunsen_burner',
};

/**
 * Checks if an apparatus type is movable/pickable by the player.
 * Fixed installations (such as permanent gas burners or sinks) are stationary.
 */
export function isApparatusPickable(apparatus) {
  if (!apparatus) return false;
  if (apparatus.isPickable === false) return false;
  const pickableTypes = [
    APPARATUS_TYPES.BEAKER_250,
    APPARATUS_TYPES.BEAKER_500,
    APPARATUS_TYPES.CONICAL_FLASK_250,
    APPARATUS_TYPES.TEST_TUBE,
    APPARATUS_TYPES.TEST_TUBE_RACK,
    APPARATUS_TYPES.BURETTE,
  ];
  return pickableTypes.includes(apparatus.type) || apparatus.isPickable === true;
}

/**
 * Checks if an apparatus holds liquid.
 */
export function hasLiquidCapacity(apparatus) {
  return apparatus?.liquid !== undefined && apparatus?.liquid !== null;
}

/**
 * Stubs for future chemistry interaction pipelines.
 */
export function canPerformAction(action, apparatus, target = null) {
  switch (action) {
    case INTERACTION_ACTIONS.INSPECT:
      return Boolean(apparatus);
    case INTERACTION_ACTIONS.PICK_UP:
      return isApparatusPickable(apparatus) && !apparatus.isHeld;
    case INTERACTION_ACTIONS.PLACE:
      return Boolean(apparatus?.isHeld);
    case INTERACTION_ACTIONS.POUR:
      return apparatus?.isHeld && target && hasLiquidCapacity(target);
    case INTERACTION_ACTIONS.HEAT:
      return apparatus && target?.type === APPARATUS_TYPES.BUNSEN_BURNER && target.isIgnited;
    default:
      return false;
  }
}
