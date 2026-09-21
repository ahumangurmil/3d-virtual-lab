/**
 * Experiment System Core Types & Constants.
 * Fully decoupled from React and Three.js rendering pipelines.
 */

export const EXPERIMENT_STATUS = {
  IDLE: 'idle',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  COMPLETED: 'completed',
};

export const TITRATION_STEP_IDS = {
  COLLECT_EQUIPMENT: 'step-1-collect-equipment',
  ADD_HCL_TO_FLASK: 'step-2-add-hcl-flask',
  ADD_INDICATOR: 'step-3-add-indicator',
  FILL_BURETTE: 'step-4-fill-burette',
  POSITION_BURETTE: 'step-5-position-burette',
  BEGIN_TITRATION: 'step-6-begin-titration',
  OBSERVE_SOLUTION: 'step-7-observe-solution',
  STOP_AT_ENDPOINT: 'step-8-stop-endpoint',
  RECORD_READING: 'step-9-record-reading',
};

export const REQUIRED_TITRATION_EQUIPMENT = [
  {
    key: 'conical_flask',
    name: 'Conical Flask (Erlenmeyer)',
    matchTypes: ['conical_flask_250'],
    description: 'Reaction vessel for the analyte acid sample',
  },
  {
    key: 'burette',
    name: 'Titration Burette',
    matchTypes: ['burette_50'],
    description: 'Precision graduated tube mounted on stand for delivering standard titrant',
  },
  {
    key: 'beaker',
    name: 'Laboratory Beaker',
    matchTypes: ['beaker_250', 'beaker_500'],
    description: 'Stock container holding reagent solution',
  },
  {
    key: 'pipette',
    name: 'Volumetric Transfer Pipette',
    matchTypes: ['pipette_25'],
    description: 'Class A volumetric measuring pipette for precise 25 mL analyte aliquots',
  },
  {
    key: 'indicator',
    name: 'Phenolphthalein Indicator Bottle',
    matchTypes: ['indicator_bottle'],
    description: 'Reagent dropper bottle containing phenolphthalein indicator',
  },
];

/**
 * Checks if a given apparatus matches a required equipment key.
 */
export function matchesEquipmentKey(apparatus, key) {
  if (!apparatus) return false;
  const def = REQUIRED_TITRATION_EQUIPMENT.find((item) => item.key === key);
  if (!def) return false;
  return def.matchTypes.includes(apparatus.type);
}
