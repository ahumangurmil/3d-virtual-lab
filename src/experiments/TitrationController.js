/**
 * Titration Experiment Controller.
 * Manages experiment workflow, guided steps, action validation, and mistake detection.
 * 
 * Architecture:
 * Experiment Controller -> Experiment Step -> Action System -> Chemistry Engine -> Chemical / Apparatus State
 */

import { EXPERIMENT_STATUS, REQUIRED_TITRATION_EQUIPMENT } from './experimentTypes';
import { executeChemistryAction, CHEMISTRY_ACTION_TYPES } from '../chemistry/actionSystem';

export class TitrationController {
  constructor(experimentState) {
    this.state = experimentState;
  }

  /**
   * Validates a player chemical or equipment action against the active experiment rules.
   * Prevents destructive mistakes while providing educational feedback.
   * 
   * @param {string} actionType - One of CHEMISTRY_ACTION_TYPES
   * @param {Object} params - Action parameters
   * @param {Array} apparatusList - Current apparatus list
   * @returns {Object} { allowed: boolean, reason?: string }
   */
  validateAction(actionType, params = {}, apparatusList = []) {
    // If experiment is not running, allow free play without titration restrictions
    if (this.state.status !== EXPERIMENT_STATUS.IN_PROGRESS) {
      return { allowed: true };
    }

    const currentStep = this.state.getCurrentStep();
    if (!currentStep) return { allowed: true };

    const { targetId, sourceId, destId, chemicalId } = params;
    const target = apparatusList.find((a) => a.id === targetId || a.id === destId);
    const source = apparatusList.find((a) => a.id === sourceId);

    // MISTAKE RULE: Attempting to pour into non-liquid containers
    if (target && (target.type === 'bunsen_burner' || target.type === 'test_tube_rack')) {
      const msg = `Cannot pour liquid into a ${target.name}. Use a beaker or flask.`;
      this.state.setFeedback(msg, 'warning');
      return { allowed: false, reason: msg };
    }

    // MISTAKE RULE: Adding wrong chemical species to titration containers
    const titrationChemicals = ['hydrochloric-acid', 'sodium-hydroxide', 'phenolphthalein', 'water'];
    if (chemicalId && !titrationChemicals.includes(chemicalId)) {
      const msg = `Incorrect chemical: Acid–Base Titration requires HCl, NaOH, and Phenolphthalein, not ${chemicalId}.`;
      this.state.setFeedback(msg, 'warning');
      return { allowed: false, reason: msg };
    }

    // MISTAKE RULE: Student adds NaOH before preparing the flask
    const isAddingNaoh =
      chemicalId === 'sodium-hydroxide' ||
      (source && (source.liquid?.contents === 'sodium-hydroxide' || source.type === 'beaker_250' && source.name?.includes('NaOH')));
    if (isAddingNaoh && target?.type === 'conical_flask_250') {
      if (currentStep.stepNumber < 5) {
        const msg = 'Not yet. Add 25 mL HCl to the conical flask first.';
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }
    }

    // MISTAKE RULE: Student uses wrong equipment (e.g. pouring directly from beaker into flask without pipette)
    if (currentStep.stepNumber === 2) {
      const isHclSource = source && (source.liquid?.contents === 'hydrochloric-acid' || source.name?.includes('HCl'));
      if (isHclSource && source.type !== 'pipette_25' && target?.type === 'conical_flask_250') {
        const msg = 'Use the 25 mL volumetric pipette for this step.';
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }
    }

    // MISTAKE RULE: Student pours into the wrong container
    const isHclTransfer =
      chemicalId === 'hydrochloric-acid' ||
      (source && (source.liquid?.contents === 'hydrochloric-acid' || source.name?.includes('HCl')));
    if (isHclTransfer && target && target.type !== 'conical_flask_250' && target.type !== 'pipette_25') {
      const msg = 'The HCl must be added to the conical flask.';
      this.state.setFeedback(msg, 'warning');
      return { allowed: false, reason: msg };
    }

    // MISTAKE RULE: Adding Indicator before HCl analyte is in the flask
    if (chemicalId === 'phenolphthalein' || (source && source.type === 'indicator_bottle')) {
      if (target && target.type === 'burette_50') {
        const msg = 'Indicator must be added to the conical flask containing analyte, not the burette.';
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }

      if (target && target.type === 'conical_flask_250') {
        const hasHcl = target.liquid && (target.liquid.contents === 'hydrochloric-acid' || target.solution?.components?.some((c) => c.chemicalId === 'hydrochloric-acid'));
        if (!hasHcl || target.liquid.volume < 5) {
          const msg = 'Not yet. Add 25 mL HCl to the conical flask first.';
          this.state.setFeedback(msg, 'warning');
          return { allowed: false, reason: msg };
        }
      }
    }

    // MISTAKE RULE: Adding HCl to the Burette
    if (isHclTransfer && target?.type === 'burette_50') {
      const msg = 'Titration error: The burette must be filled with standard titrant (0.1 M NaOH), not acid.';
      this.state.setFeedback(msg, 'warning');
      return { allowed: false, reason: msg };
    }

    return { allowed: true };
  }

  /**
   * Checks if all 5 required equipment pieces are on the active workstation and advances Step 1.
   */
  checkStep1Equipment(apparatusList = [], activeWorkstationId = null) {
    if (this.state.status !== EXPERIMENT_STATUS.IN_PROGRESS) return false;
    const currentStep = this.state.getCurrentStep();
    if (!currentStep || currentStep.stepNumber !== 1) return false;

    this.state.syncWithApparatus(apparatusList, activeWorkstationId);
    const allCollected = REQUIRED_TITRATION_EQUIPMENT.every(
      (eq) => this.state.requiredEquipmentStatus[eq.key]?.collected
    );
    if (allCollected) {
      this.state.completeStep(1);
      this.state.setFeedback('All 5 pieces of titration equipment collected and verified on your bench! Step 1 Complete.', 'success');
      return true;
    }
    return false;
  }

  /**
   * Executes the canonical guided action for the current step.
   * Dispatches down through the Chemistry Action System to the Chemistry Engine.
   * 
   * @param {Array} apparatusList - Current apparatus list
   * @param {string} activeWorkstationId - Active workstation ID
   * @returns {Object} { success: boolean, message: string, updatedApparatusList: Array }
   */
  executeCurrentStepAction(apparatusList = [], activeWorkstationId = null) {
    const currentStep = this.state.getCurrentStep();
    if (!currentStep) {
      return { success: false, message: 'No active titration step.', updatedApparatusList: apparatusList };
    }

    // Find apparatus on the active workstation
    const stationItems = activeWorkstationId
      ? apparatusList.filter((a) => a.workstationId === activeWorkstationId || !a.workstationId)
      : apparatusList;

    const flask = stationItems.find((a) => a.type === 'conical_flask_250');
    const burette = stationItems.find((a) => a.type === 'burette_50');

    let updatedList = apparatusList;

    switch (currentStep.stepNumber) {
      case 1: {
        // Step 1: Collect required equipment
        this.state.syncWithApparatus(apparatusList, activeWorkstationId);
        const allCollected = REQUIRED_TITRATION_EQUIPMENT.every((eq) => {
          return this.state.requiredEquipmentStatus[eq.key]?.collected;
        });

        if (allCollected) {
          this.state.completeStep(1);
          return {
            success: true,
            message: 'All required equipment verified on the workstation.',
            updatedApparatusList: updatedList,
          };
        } else {
          const missing = REQUIRED_TITRATION_EQUIPMENT.filter(
            (eq) => !this.state.requiredEquipmentStatus[eq.key]?.collected
          ).map((eq) => eq.name).join(', ');
          const msg = `Missing equipment: ${missing}. Locate them on your lab bench.`;
          this.state.setFeedback(msg, 'warning');
          return { success: false, message: msg, updatedApparatusList: updatedList };
        }
      }

      case 2: {
        // Step 2: Add measured HCl (25 mL) to conical flask
        if (!flask) {
          const msg = 'Conical flask not found on workstation.';
          this.state.setFeedback(msg, 'error');
          return { success: false, message: msg, updatedApparatusList: updatedList };
        }

        const actionResult = executeChemistryAction(
          CHEMISTRY_ACTION_TYPES.ADD_REAGENT,
          {
            targetId: flask.id,
            chemicalId: 'hydrochloric-acid',
            amount: this.state.definition.config.analyte.targetVolume,
            concentration: this.state.definition.config.analyte.concentration,
          },
          apparatusList
        );

        if (actionResult.success) {
          updatedList = actionResult.updatedApparatusList;
          this.state.syncWithApparatus(updatedList, activeWorkstationId);
          this.state.completeStep(2);
          return {
            success: true,
            message: 'Transferred 25.0 mL of 0.1 M HCl into the conical flask.',
            updatedApparatusList: updatedList,
          };
        } else {
          this.state.setFeedback(actionResult.message, 'error');
          return { success: false, message: actionResult.message, updatedApparatusList: updatedList };
        }
      }

      case 3: {
        // Step 3: Add a few drops of phenolphthalein indicator
        if (!flask) {
          const msg = 'Conical flask not found on workstation.';
          this.state.setFeedback(msg, 'error');
          return { success: false, message: msg, updatedApparatusList: updatedList };
        }

        // Validate that flask has HCl
        const valid = this.validateAction(
          CHEMISTRY_ACTION_TYPES.ADD_REAGENT,
          { targetId: flask.id, chemicalId: 'phenolphthalein' },
          apparatusList
        );
        if (!valid.allowed) {
          return { success: false, message: valid.reason, updatedApparatusList: updatedList };
        }

        const actionResult = executeChemistryAction(
          CHEMISTRY_ACTION_TYPES.ADD_REAGENT,
          {
            targetId: flask.id,
            chemicalId: 'phenolphthalein',
            amount: this.state.definition.config.indicator.volumeEquivalent,
          },
          apparatusList
        );

        if (actionResult.success) {
          updatedList = actionResult.updatedApparatusList;
          this.state.syncWithApparatus(updatedList, activeWorkstationId);
          this.state.completeStep(3);
          return {
            success: true,
            message: 'Added 3 drops of phenolphthalein indicator to conical flask. Solution remains clear in acid.',
            updatedApparatusList: updatedList,
          };
        } else {
          this.state.setFeedback(actionResult.message, 'error');
          return { success: false, message: actionResult.message, updatedApparatusList: updatedList };
        }
      }

      case 4: {
        // Step 4: Fill burette with standard NaOH (50 mL)
        if (!burette) {
          const msg = 'Burette not found on workstation.';
          this.state.setFeedback(msg, 'error');
          return { success: false, message: msg, updatedApparatusList: updatedList };
        }

        const actionResult = executeChemistryAction(
          CHEMISTRY_ACTION_TYPES.ADD_REAGENT,
          {
            targetId: burette.id,
            chemicalId: 'sodium-hydroxide',
            amount: this.state.definition.config.titrant.initialBuretteVolume,
            concentration: this.state.definition.config.titrant.concentration,
          },
          apparatusList
        );

        if (actionResult.success) {
          updatedList = actionResult.updatedApparatusList;
          this.state.syncWithApparatus(updatedList, activeWorkstationId);
          this.state.completeStep(4);
          return {
            success: true,
            message: 'Filled burette to 50.0 mL graduation with standardized 0.1 M NaOH.',
            updatedApparatusList: updatedList,
          };
        } else {
          this.state.setFeedback(actionResult.message, 'error');
          return { success: false, message: actionResult.message, updatedApparatusList: updatedList };
        }
      }

      case 5: {
        // Step 5: Position burette correctly over conical flask
        if (!flask || !burette) {
          const msg = 'Both conical flask and burette must be in place.';
          this.state.setFeedback(msg, 'error');
          return { success: false, message: msg, updatedApparatusList: updatedList };
        }

        // Move flask directly under burette tip
        const burettePos = burette.position || [0, 0.92, 0];
        const alignedFlaskPos = [burettePos[0] + 0.05, 0.92, burettePos[2] + 0.08];

        updatedList = apparatusList.map((item) => {
          if (item.id === flask.id) {
            return {
              ...item,
              position: alignedFlaskPos,
              currentSurface: 'Titration Retort Stand Plate',
            };
          }
          return item;
        });

        this.state.burettePositioned = true;
        this.state.completeStep(5);
        return {
          success: true,
          message: 'Positioned conical flask directly beneath the burette tip ready for titration delivery.',
          updatedApparatusList: updatedList,
        };
      }

      case 6: {
        // Step 6: Begin adding NaOH (dispense initial 10 mL titrant)
        if (!burette || !flask) {
          const msg = 'Burette and conical flask must be present.';
          this.state.setFeedback(msg, 'error');
          return { success: false, message: msg, updatedApparatusList: updatedList };
        }

        const actionResult = executeChemistryAction(
          CHEMISTRY_ACTION_TYPES.POUR,
          {
            sourceId: burette.id,
            destId: flask.id,
            amount: 10.0,
          },
          apparatusList
        );

        if (actionResult.success) {
          updatedList = actionResult.updatedApparatusList;
          this.state.syncWithApparatus(updatedList, activeWorkstationId);
          this.state.completeStep(6);
          return {
            success: true,
            message: 'Dispensed 10.0 mL of 0.1 M NaOH from burette into conical flask. Neutralization in progress.',
            updatedApparatusList: updatedList,
          };
        } else {
          this.state.setFeedback(actionResult.message, 'error');
          return { success: false, message: actionResult.message, updatedApparatusList: updatedList };
        }
      }

      case 7: {
        // Step 7: Observe solution and transient colors
        if (!flask) {
          const msg = 'Conical flask not found.';
          this.state.setFeedback(msg, 'error');
          return { success: false, message: msg, updatedApparatusList: updatedList };
        }

        const measureResult = executeChemistryAction(
          CHEMISTRY_ACTION_TYPES.MEASURE,
          { targetId: flask.id },
          apparatusList
        );

        this.state.observedSwirl = true;
        this.state.completeStep(7);
        return {
          success: true,
          message: `Swirled flask and observed solution: ${measureResult.result?.solutionName || 'analyte mixture'}, pH ${measureResult.result?.ph}. Transient pink spots dissipate with swirling.`,
          updatedApparatusList: updatedList,
        };
      }

      case 8: {
        // Step 8: Stop at the endpoint (deliver final 15.0 mL to reach exact equivalence 25.0 mL)
        if (!burette || !flask) {
          const msg = 'Burette and conical flask must be present.';
          this.state.setFeedback(msg, 'error');
          return { success: false, message: msg, updatedApparatusList: updatedList };
        }

        // Pour remaining 15.0 mL to reach stoichiometric equivalence point
        const actionResult = executeChemistryAction(
          CHEMISTRY_ACTION_TYPES.POUR,
          {
            sourceId: burette.id,
            destId: flask.id,
            amount: 15.0,
          },
          apparatusList
        );

        if (actionResult.success) {
          updatedList = actionResult.updatedApparatusList;
          this.state.syncWithApparatus(updatedList, activeWorkstationId);
          this.state.completeStep(8);
          return {
            success: true,
            message: 'Endpoint Reached! Solution turned persistent faint pink (pH ≥ 8.2). Closed burette stopcock.',
            updatedApparatusList: updatedList,
          };
        } else {
          this.state.setFeedback(actionResult.message, 'error');
          return { success: false, message: actionResult.message, updatedApparatusList: updatedList };
        }
      }

      case 9: {
        // Step 9: Record the burette reading
        if (!this.state.studentReading) {
          const msg = 'Please enter your observed burette reading before completing the experiment.';
          this.state.setFeedback(msg, 'warning');
          return { success: false, message: msg, updatedApparatusList: updatedList };
        }

        const readingVal = parseFloat(this.state.studentReading);
        if (isNaN(readingVal) || readingVal <= 0) {
          const msg = 'Please enter a valid positive volume reading in mL (e.g. 25.0).';
          this.state.setFeedback(msg, 'warning');
          return { success: false, message: msg, updatedApparatusList: updatedList };
        }

        this.state.completeStep(9);
        return {
          success: true,
          message: `Recorded burette reading: ${readingVal.toFixed(1)} mL. Titration analysis completed successfully!`,
          updatedApparatusList: updatedList,
        };
      }

      default:
        return { success: false, message: 'Unknown step.', updatedApparatusList: updatedList };
    }
  }

  /**
   * Called when player executes a physical action in the lab to verify step progress.
   */
  handlePlayerAction(actionType, params, actionResult, apparatusList, activeWorkstationId) {
    if (this.state.status !== EXPERIMENT_STATUS.IN_PROGRESS) return;

    this.state.syncWithApparatus(apparatusList, activeWorkstationId);
    const currentStep = this.state.getCurrentStep();
    if (!currentStep) return;

    const stationItems = activeWorkstationId
      ? apparatusList.filter((a) => a.workstationId === activeWorkstationId || !a.workstationId)
      : apparatusList;

    const flask = stationItems.find((a) => a.type === 'conical_flask_250');
    const burette = stationItems.find((a) => a.type === 'burette_50');

    // STEP 1: Collect Required Equipment
    if (currentStep.stepNumber === 1) {
      const allCollected = REQUIRED_TITRATION_EQUIPMENT.every(
        (eq) => this.state.requiredEquipmentStatus[eq.key]?.collected
      );
      if (allCollected) {
        this.state.completeStep(1);
        this.state.setFeedback('All 5 pieces of titration equipment collected and verified on your bench! Step 1 Complete.', 'success');
      }
    }
    // STEP 2: Add 25 mL HCl to Conical Flask
    else if (currentStep.stepNumber === 2 && flask?.liquid?.volume >= 20) {
      const hasHcl = flask.solution?.components?.some((c) => c.chemicalId === 'hydrochloric-acid') || flask.liquid?.contents === 'hydrochloric-acid';
      if (hasHcl) {
        this.state.completeStep(2);
        this.state.setFeedback('Transferred 25.0 mL of 0.1 M HCl into conical flask. Step 2 Complete!', 'success');
      }
    }
    // STEP 3: Add Phenolphthalein Indicator
    else if (currentStep.stepNumber === 3 && (flask?.liquid?.hasIndicator || flask?.solution?.hasIndicator)) {
      this.state.completeStep(3);
      this.state.setFeedback('Added phenolphthalein indicator to conical flask. Solution remains clear in acidic medium. Step 3 Complete!', 'success');
    }
    // STEP 4: Fill Burette with NaOH Titrant
    else if (currentStep.stepNumber === 4 && burette?.liquid?.volume >= 40) {
      const hasNaoh = burette.solution?.components?.some((c) => c.chemicalId === 'sodium-hydroxide') || burette.liquid?.contents === 'sodium-hydroxide';
      if (hasNaoh) {
        this.state.completeStep(4);
        this.state.setFeedback('Filled burette to 50.0 mL graduation mark with standardized 0.1 M NaOH titrant. Step 4 Complete!', 'success');
      }
    }
    // STEP 5: Position Burette Over Conical Flask
    else if (currentStep.stepNumber === 5) {
      if (actionType === 'ALIGN' || this.state.burettePositioned) {
        this.state.completeStep(5);
        this.state.setFeedback('Conical flask positioned securely beneath burette delivery tip. Step 5 Complete!', 'success');
      } else if (flask && burette) {
        const dx = Math.abs(flask.position[0] - burette.position[0]);
        const dz = Math.abs(flask.position[2] - burette.position[2]);
        if (dx < 0.25 && dz < 0.3) {
          this.state.burettePositioned = true;
          this.state.completeStep(5);
          this.state.setFeedback('Conical flask positioned securely beneath burette delivery tip. Step 5 Complete!', 'success');
        }
      }
    }
    // STEP 6: Begin Adding NaOH Titrant
    else if (currentStep.stepNumber === 6) {
      if (actionType === 'TURN_STOPCOCK' || actionType === CHEMISTRY_ACTION_TYPES.POUR) {
        this.state.titrationStarted = true;
        this.state.completeStep(6);
        this.state.setFeedback('Dispensed NaOH titrant from burette into conical flask. Neutralization in progress. Step 6 Complete!', 'success');
      }
    }
    // STEP 7: Observe Solution and Swirl Flask
    else if (currentStep.stepNumber === 7) {
      if (actionType === 'SWIRL' || actionType === CHEMISTRY_ACTION_TYPES.MEASURE) {
        this.state.flaskSwirled = true;
        this.state.completeStep(7);
        this.state.setFeedback('Swirled conical flask. Transient pink flashes disappear upon mixing as unreacted acid neutralizes base. Step 7 Complete!', 'success');
      }
    }
    // STEP 8: Stop Titration at Endpoint
    else if (currentStep.stepNumber === 8) {
      if (this.state.endpointDetected && (actionType === 'CLOSE_STOPCOCK' || actionType === 'STOP_TITRATION' || actionType === 'TURN_STOPCOCK')) {
        this.state.completeStep(8);
        this.state.setFeedback('Endpoint reached! Solution turned persistent faint pink (pH 8.2). Closed burette stopcock. Step 8 Complete!', 'success');
      }
    }
  }

  /**
   * Positions the conical flask directly on the retort stand base plate under the burette tip.
   */
  positionFlaskUnderBurette(apparatusList = [], activeWorkstationId = null) {
    const stationItems = activeWorkstationId
      ? apparatusList.filter((a) => a.workstationId === activeWorkstationId || !a.workstationId)
      : apparatusList;
    const flask = stationItems.find((a) => a.type === 'conical_flask_250');
    const burette = stationItems.find((a) => a.type === 'burette_50');
    if (!flask || !burette) return { success: false, message: 'Conical flask or burette not found on workstation.', updatedApparatusList: apparatusList };

    const targetPos = [burette.position[0], 0.92, burette.position[2] + 0.12];
    const updated = apparatusList.map((a) => a.id === flask.id ? { ...a, position: targetPos } : a);
    this.state.burettePositioned = true;
    this.handlePlayerAction('ALIGN', { flaskId: flask.id, buretteId: burette.id }, { success: true }, updated, activeWorkstationId);
    return { success: true, message: 'Positioned conical flask directly beneath burette tip.', updatedApparatusList: updated };
  }
}
