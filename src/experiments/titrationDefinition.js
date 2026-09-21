/**
 * Data-Driven Experiment Definition: Acid–Base Titration.
 * Configurable educational scenario decoupled from UI components.
 */

import { TITRATION_STEP_IDS, REQUIRED_TITRATION_EQUIPMENT } from './experimentTypes';

export const ACID_BASE_TITRATION_DEFINITION = {
  id: 'acid-base-titration',
  name: 'Acid–Base Titration',
  subtitle: 'Quantitative Neutralization of HCl with Standard NaOH',
  description:
    'Determine the stoichiometric equivalence point of a hydrochloric acid (HCl) sample using standardized sodium hydroxide (NaOH) titrant with phenolphthalein indicator.',

  // Fully configurable concentrations and quantities
  config: {
    analyte: {
      chemicalId: 'hydrochloric-acid',
      name: 'Hydrochloric Acid',
      formula: 'HCl',
      concentration: 0.1, // 0.1 M
      targetVolume: 25.0, // 25.0 mL aliquot
      unit: 'M',
    },
    titrant: {
      chemicalId: 'sodium-hydroxide',
      name: 'Sodium Hydroxide',
      formula: 'NaOH',
      concentration: 0.1, // 0.1 M
      initialBuretteVolume: 50.0, // 50.0 mL initial fill
      expectedEndpointVolume: 25.0, // 25.0 mL theoretical endpoint
      unit: 'M',
    },
    indicator: {
      chemicalId: 'phenolphthalein',
      name: 'Phenolphthalein',
      drops: 3,
      volumeEquivalent: 2.0, // 2 mL indicator solution
      transitionPh: 8.2,
      acidColor: 'clear',
      endpointColor: '#ec4899', // Faint persistent pink
    },
  },

  requiredEquipment: REQUIRED_TITRATION_EQUIPMENT,

  steps: [
    {
      stepNumber: 1,
      id: TITRATION_STEP_IDS.COLLECT_EQUIPMENT,
      title: 'Collect Required Equipment',
      instruction: 'Verify and gather all 5 pieces of equipment: Conical Flask, Burette, Beaker, Pipette, and Indicator.',
      hint: 'Inspect or pick up each piece of glassware on your workstation bench.',
      actionLabel: 'Check Equipment',
    },
    {
      stepNumber: 2,
      id: TITRATION_STEP_IDS.ADD_HCL_TO_FLASK,
      title: 'Add Measured HCl to Conical Flask',
      instruction: 'Transfer 25.0 mL of 0.1 M Hydrochloric Acid (HCl) into the clean conical flask.',
      hint: 'Use the 25 mL volumetric pipette or pour from the HCl stock beaker into the conical flask.',
      actionLabel: 'Transfer 25 mL HCl',
    },
    {
      stepNumber: 3,
      id: TITRATION_STEP_IDS.ADD_INDICATOR,
      title: 'Add Phenolphthalein Indicator',
      instruction: 'Add 2–3 drops of phenolphthalein indicator solution to the conical flask.',
      hint: 'Use the indicator dropper bottle. Notice that the acidic solution remains completely clear.',
      actionLabel: 'Add 3 Drops Indicator',
    },
    {
      stepNumber: 4,
      id: TITRATION_STEP_IDS.FILL_BURETTE,
      title: 'Fill Burette with NaOH Titrant',
      instruction: 'Fill the 50 mL burette with standard 0.1 M Sodium Hydroxide (NaOH) solution.',
      hint: 'Ensure the stopcock is closed and fill the burette up to the 50 mL mark.',
      actionLabel: 'Fill Burette (50 mL NaOH)',
    },
    {
      stepNumber: 5,
      id: TITRATION_STEP_IDS.POSITION_BURETTE,
      title: 'Position Burette Over Flask',
      instruction: 'Position the burette tip directly over the mouth of the conical flask on the bench.',
      hint: 'The flask should sit securely directly beneath the burette tip for clean dropwise delivery.',
      actionLabel: 'Align Flask & Burette',
    },
    {
      stepNumber: 6,
      id: TITRATION_STEP_IDS.BEGIN_TITRATION,
      title: 'Begin Adding NaOH Titrant',
      instruction: 'Open the burette stopcock and begin dispensing 0.1 M NaOH into the conical flask.',
      hint: 'Deliver NaOH incrementally (e.g. 5–10 mL at a time) while swirling the flask.',
      actionLabel: 'Dispense 10 mL NaOH',
    },
    {
      stepNumber: 7,
      id: TITRATION_STEP_IDS.OBSERVE_SOLUTION,
      title: 'Observe Solution and Transient Colors',
      instruction: 'Observe transient pink color flashes near the drop zone as equivalence is approached.',
      hint: 'Swirl continuously. The pink flashes disappear quickly as long as unreacted acid remains.',
      actionLabel: 'Swirl & Inspect Flask',
    },
    {
      stepNumber: 8,
      id: TITRATION_STEP_IDS.STOP_AT_ENDPOINT,
      title: 'Stop Titration at Endpoint',
      instruction: 'Add dropwise until a single drop produces a faint, persistent pink color lasting >30 seconds.',
      hint: 'At stoichiometric equivalence (25.0 mL added), moles of NaOH equal moles of HCl (pH ≥ 8.2).',
      actionLabel: 'Reach Endpoint',
    },
    {
      stepNumber: 9,
      id: TITRATION_STEP_IDS.RECORD_READING,
      title: 'Record Burette Reading',
      instruction: 'Read the bottom of the liquid meniscus on the burette scale and record your final volume.',
      hint: 'Enter your burette reading (e.g. 25.0 mL) to conclude the quantitative titration analysis.',
      actionLabel: 'Submit Reading',
    },
  ],
};
