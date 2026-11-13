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
      instruction: 'Walk to your workstation and inspect [E] or pick up [F] all 5 required items: Conical Flask, Burette, Beaker, Pipette, and Indicator Bottle.',
      hint: 'Target each apparatus on your bench and press [E] to inspect or [F] to pick up and verify it.',
      actionLabel: 'Verify Equipment',
    },
    {
      stepNumber: 2,
      id: TITRATION_STEP_IDS.ADD_HCL_TO_FLASK,
      title: 'Pipette 25 mL HCl into Flask',
      instruction: 'Pick up the 25 mL Pipette [F], aspirate 25 mL from the 0.1 M HCl Beaker [P], then dispense it into the Conical Flask [P].',
      hint: 'Always use the volumetric pipette for the analyte aliquot — do not pour directly from the HCl stock beaker.',
      actionLabel: 'Transfer 25 mL HCl',
    },
    {
      stepNumber: 3,
      id: TITRATION_STEP_IDS.ADD_INDICATOR,
      title: 'Add Phenolphthalein Indicator',
      instruction: 'Pick up the Phenolphthalein Indicator Bottle [F], target the Conical Flask, and press [P] to add 3 drops.',
      hint: 'Notice that phenolphthalein remains colorless in the acidic HCl solution.',
      actionLabel: 'Add 3 Drops Indicator',
    },
    {
      stepNumber: 4,
      id: TITRATION_STEP_IDS.FILL_BURETTE,
      title: 'Fill Burette with NaOH Titrant',
      instruction: 'Pick up the 0.1 M NaOH Beaker [F], target the 50 mL Burette, and press [P] until filled to the 50.0 mL mark.',
      hint: 'Each pour transfers 25 mL. Pour twice from the NaOH supply beaker to fill the burette to 50.0 mL.',
      actionLabel: 'Fill Burette (50 mL NaOH)',
    },
    {
      stepNumber: 5,
      id: TITRATION_STEP_IDS.POSITION_BURETTE,
      title: 'Position Flask Beneath Burette',
      instruction: 'Place the Conical Flask beneath the burette tip ([F] on the retort stand base or target the flask and press [A]).',
      hint: 'The flask must sit directly under the burette delivery jet before opening the stopcock.',
      actionLabel: 'Align Flask & Burette',
    },
    {
      stepNumber: 6,
      id: TITRATION_STEP_IDS.BEGIN_TITRATION,
      title: 'Begin Dispensing NaOH Titrant',
      instruction: 'Target the Burette and press [T] to open the stopcock and begin dispensing 0.1 M NaOH into the flask.',
      hint: 'Dispense an initial portion (e.g. 5–10 mL) while watching the liquid level.',
      actionLabel: 'Dispense NaOH',
    },
    {
      stepNumber: 7,
      id: TITRATION_STEP_IDS.OBSERVE_SOLUTION,
      title: 'Swirl Flask & Observe Mixing',
      instruction: 'Target the Conical Flask and press [S] to swirl and observe the partially neutralized mixture.',
      hint: 'Swirling disperses localized pink flashes as excess HCl neutralizes the added NaOH.',
      actionLabel: 'Swirl & Inspect Flask',
    },
    {
      stepNumber: 8,
      id: TITRATION_STEP_IDS.STOP_AT_ENDPOINT,
      title: 'Titrate Dropwise to Endpoint',
      instruction: 'Add NaOH gradually ([T] for 5 mL, [G] or Drop button for 0.1 mL drops) and swirl [S] until persistent pink appears (pH ≥ 8.2).',
      hint: 'Theoretical equivalence is at 25.0 mL added; switch to 0.1 mL drops [G] around 24–25 mL so you do not overshoot!',
      actionLabel: 'Reach Endpoint',
    },
    {
      stepNumber: 9,
      id: TITRATION_STEP_IDS.RECORD_READING,
      title: 'Measure & Record Burette Reading',
      instruction: 'Measure the burette ([M] or [E]) to find the volume of NaOH dispensed (Initial − Remaining) and submit it below.',
      hint: 'Record the volume delivered from the burette (e.g. 25.1 mL) to complete the practical.',
      actionLabel: 'Submit Reading',
    },
  ],
};
