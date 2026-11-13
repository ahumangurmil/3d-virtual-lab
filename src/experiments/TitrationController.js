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

  _getStationItems(apparatusList = [], activeWorkstationId = null) {
    return activeWorkstationId
      ? apparatusList.filter((a) => a.workstationId === activeWorkstationId || !a.workstationId)
      : apparatusList;
  }

  _isFlaskAlignedWithBurette(flask, burette) {
    if (!flask || !burette) return false;
    const dx = Math.abs(flask.position[0] - burette.position[0]);
    const dz = Math.abs(flask.position[2] - burette.position[2]);
    return dx < 0.25 && dz < 0.3;
  }

  _hasChemical(apparatus, chemicalId) {
    if (!apparatus) return false;
    return Boolean(
      apparatus.solution?.components?.some(
        (c) => c.chemicalId === chemicalId && (c.moles || 0) > 1e-12
      ) || apparatus.liquid?.contents === chemicalId
    );
  }

  /**
   * Validates a player chemical or equipment action against the active experiment rules.
   * Prevents out-of-order steps, shortcut reagent buttons, and chemical errors while giving teacher feedback.
   */
  validateAction(actionType, params = {}, apparatusList = []) {
    if (this.state.status !== EXPERIMENT_STATUS.IN_PROGRESS) {
      return { allowed: true };
    }

    const currentStep = this.state.getCurrentStep();
    if (!currentStep) return { allowed: true };

    const stepNum = currentStep.stepNumber;
    const { targetId, sourceId, destId, chemicalId, actionKind } = params;
    const target = apparatusList.find((a) => a.id === targetId || a.id === destId);
    const source = apparatusList.find((a) => a.id === sourceId);

    // Block shortcut Inspector "+ Reagent" buttons during guided practical
    if (actionType === CHEMISTRY_ACTION_TYPES.ADD_REAGENT) {
      const guidance =
        stepNum === 2
          ? 'Use the 25 mL Volumetric Pipette in the 3D lab ([F] pick up pipette, [P] aspirate from HCl beaker, [P] dispense into flask).'
          : stepNum === 3
          ? 'Pick up the Phenolphthalein Indicator Bottle ([F]) and press [P] at the Conical Flask to add 3 drops.'
          : stepNum === 4
          ? 'Pick up the 0.1 M NaOH Supply Beaker ([F]) and press [P] at the 50 mL Burette to fill it.'
          : 'Perform chemical additions physically using the 3D apparatus in the laboratory.';
      this.state.setFeedback(guidance, 'warning');
      return { allowed: false, reason: guidance };
    }

    // Attempting to pour into non-liquid apparatus
    if (target && (target.type === 'bunsen_burner' || target.type === 'test_tube_rack')) {
      const msg = `Cannot pour liquid into ${target.name}. Use appropriate volumetric glassware.`;
      this.state.setFeedback(msg, 'warning');
      return { allowed: false, reason: msg };
    }

    // Wrong chemical species outside titration reagents
    const titrationChemicals = ['hydrochloric-acid', 'sodium-hydroxide', 'phenolphthalein', 'sodium-chloride', 'water'];
    if (chemicalId && !titrationChemicals.includes(chemicalId)) {
      const msg = `Incorrect chemical: Acid–Base Titration requires HCl, NaOH, and Phenolphthalein, not ${chemicalId}.`;
      this.state.setFeedback(msg, 'warning');
      return { allowed: false, reason: msg };
    }
    if (source?.solution?.components?.length) {
      const hasDisallowed = source.solution.components.some(
        (c) => !titrationChemicals.includes(c.chemicalId) && (c.moles || 0) > 1e-12
      );
      if (hasDisallowed) {
        const msg = `Do not contaminate the titration with ${source.liquid?.name || source.name}. Use only HCl, NaOH, and Phenolphthalein.`;
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }
    }

    // Step 1: Must verify/collect all 5 required equipment items before performing chemical transfers
    if (stepNum === 1) {
      const msg = 'Complete Step 1 first: inspect [E] or pick up [F] all 5 required equipment items on your bench.';
      this.state.setFeedback(msg, 'warning');
      return { allowed: false, reason: msg };
    }

    const isHclSource = this._hasChemical(source, 'hydrochloric-acid') || Boolean(source?.name?.includes('HCl'));
    const isNaohSource = this._hasChemical(source, 'sodium-hydroxide') || Boolean(source?.name?.includes('NaOH'));
    const isIndicatorSource = source?.type === 'indicator_bottle' || this._hasChemical(source, 'phenolphthalein');

    // Step 2: Pipette 25 mL HCl into Conical Flask
    if (stepNum === 2) {
      if (actionKind === 'TURN_STOPCOCK' || target?.type === 'burette_50') {
        const msg = 'Not yet! First pipette 25.0 mL of 0.1 M HCl into the conical flask before setting up the burette.';
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }
      if (isIndicatorSource) {
        const msg = 'Not yet! Add 25.0 mL of 0.1 M HCl to the conical flask before adding phenolphthalein indicator.';
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }
      if (target?.type === 'pipette_25' && !isHclSource) {
        const msg = `Wrong reagent in pipette! Aspirate 0.1 M HCl from the HCl Beaker, not ${source?.name || 'that container'}.`;
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }
      if (isHclSource && source?.type !== 'pipette_25' && target?.type === 'conical_flask_250') {
        const msg = 'Use the 25 mL Volumetric Pipette ([F] pipette -> [P] at HCl beaker -> [P] at flask) instead of pouring directly from the beaker.';
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }
      if (source?.type === 'pipette_25' && target && target.type !== 'conical_flask_250') {
        const msg = 'Dispense the pipetted HCl aliquot into the Conical Flask.';
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }
      if (isNaohSource && target?.type === 'conical_flask_250') {
        const msg = 'Not yet! Add 25.0 mL HCl and indicator to the conical flask before adding NaOH.';
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }
      return { allowed: true };
    }

    // Step 3: Add Phenolphthalein Indicator to Conical Flask
    if (stepNum === 3) {
      if (target?.type === 'burette_50' || actionKind === 'TURN_STOPCOCK') {
        const msg = isIndicatorSource
          ? 'Indicator must be added to the Conical Flask containing HCl, not the burette!'
          : 'Not yet! First add 3 drops of Phenolphthalein Indicator ([F] bottle -> [P] at Conical Flask) before filling the burette.';
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }
      if (!isIndicatorSource) {
        const msg = 'Use the Phenolphthalein Indicator Bottle ([F] pick up, [P] at Conical Flask) to add 3 drops of indicator.';
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }
      if (target?.type !== 'conical_flask_250') {
        const msg = 'Add phenolphthalein indicator into the Conical Flask containing the HCl analyte.';
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }
      return { allowed: true };
    }

    // Step 4: Fill Burette with 0.1 M NaOH
    if (stepNum === 4) {
      if (actionKind === 'TURN_STOPCOCK') {
        const msg = 'Fill the burette to the 50.0 mL mark with 0.1 M NaOH before opening the stopcock.';
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }
      if (target?.type !== 'burette_50') {
        const msg = 'In Step 4, pour 0.1 M NaOH from the NaOH Supply Beaker into the 50 mL Burette.';
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }
      if (!isNaohSource) {
        const msg = 'Titration error: The burette must only be filled with standardized 0.1 M NaOH titrant.';
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }
      return { allowed: true };
    }

    // Step 5: Position Conical Flask beneath Burette
    if (stepNum === 5) {
      if (actionKind === 'TURN_STOPCOCK' || source?.type === 'burette_50') {
        const msg = 'Position the Conical Flask directly beneath the burette tip first (place flask under burette with [F] or press [A]).';
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }
    }

    // Steps 6-8: Titration via Burette Stopcock
    if (stepNum >= 6 && stepNum <= 8) {
      if (actionKind !== 'TURN_STOPCOCK' && isNaohSource && source?.type !== 'burette_50' && target?.type === 'conical_flask_250') {
        const msg = 'Dispense NaOH titrant through the Burette stopcock ([T] / [G]), not directly from the supply beaker!';
        this.state.setFeedback(msg, 'warning');
        return { allowed: false, reason: msg };
      }

      if (actionKind === 'TURN_STOPCOCK') {
        if (!this._isFlaskAlignedWithBurette(target, source)) {
          const msg = 'The Conical Flask is not beneath the burette tip! Align it ([A] or place it under the burette) before opening the stopcock.';
          this.state.setFeedback(msg, 'warning');
          return { allowed: false, reason: msg };
        }

        if (stepNum === 7 && !this.state.flaskSwirled) {
          const dispensedSoFar = Math.max(0, this.state.buretteInitialVolume - (source?.liquid?.volume || 0));
          if (dispensedSoFar >= 20) {
            const msg = 'Swirl the Conical Flask ([S]) to mix and observe transient pink color flashes before adding more NaOH.';
            this.state.setFeedback(msg, 'warning');
            return { allowed: false, reason: msg };
          }
        }

        if (stepNum === 8 && this.state.endpointDetected) {
          const msg = 'Endpoint already reached (persistent faint pink, pH ≥ 8.2)! Stop adding NaOH and proceed to record your burette reading.';
          this.state.setFeedback(msg, 'warning');
          return { allowed: false, reason: msg };
        }
      }
    }

    // Step 9: Recording Reading
    if (stepNum === 9) {
      const msg = 'Titration complete! Measure the burette ([M] or [E]) and enter the volume of NaOH dispensed in Step 9.';
      this.state.setFeedback(msg, 'warning');
      return { allowed: false, reason: msg };
    }

    return { allowed: true };
  }

  /**
   * Checks if all 5 required equipment pieces have been physically verified by the student.
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
      this.state.setFeedback('All 5 pieces of titration equipment verified on your bench! Step 1 Complete.', 'success');
      return true;
    }
    return false;
  }

  /**
   * Optional Demo / Accessibility Assist handler (kept strictly separate from normal student workflow).
   */
  executeCurrentStepAction(apparatusList = [], activeWorkstationId = null) {
    const currentStep = this.state.getCurrentStep();
    if (!currentStep) {
      return { success: false, message: 'No active titration step.', updatedApparatusList: apparatusList };
    }

    const stationItems = this._getStationItems(apparatusList, activeWorkstationId);
    const flask = stationItems.find((a) => a.type === 'conical_flask_250');
    const burette = stationItems.find((a) => a.type === 'burette_50');

    let updatedList = apparatusList;

    switch (currentStep.stepNumber) {
      case 1: {
        REQUIRED_TITRATION_EQUIPMENT.forEach((eq) => {
          const match = stationItems.find((a) => eq.matchTypes.includes(a.type));
          if (match) {
            this.state.verifiedEquipmentKeys.add(eq.key);
          }
        });
        this.state.syncWithApparatus(apparatusList, activeWorkstationId);
        const allCollected = REQUIRED_TITRATION_EQUIPMENT.every(
          (eq) => this.state.requiredEquipmentStatus[eq.key]?.collected
        );

        if (allCollected) {
          this.state.completeStep(1);
          return {
            success: true,
            message: 'Demo Assist: Verified all 5 titration apparatus items on the workstation.',
            updatedApparatusList: updatedList,
          };
        }
        const missing = REQUIRED_TITRATION_EQUIPMENT.filter(
          (eq) => !this.state.requiredEquipmentStatus[eq.key]?.collected
        )
          .map((eq) => eq.name)
          .join(', ');
        const msg = `Missing equipment: ${missing}. Locate them on your lab bench.`;
        this.state.setFeedback(msg, 'warning');
        return { success: false, message: msg, updatedApparatusList: updatedList };
      }

      case 2: {
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
            message: 'Demo Assist: Transferred 25.0 mL of 0.1 M HCl into the conical flask.',
            updatedApparatusList: updatedList,
          };
        }
        this.state.setFeedback(actionResult.message, 'error');
        return { success: false, message: actionResult.message, updatedApparatusList: updatedList };
      }

      case 3: {
        if (!flask) {
          const msg = 'Conical flask not found on workstation.';
          this.state.setFeedback(msg, 'error');
          return { success: false, message: msg, updatedApparatusList: updatedList };
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
            message: 'Demo Assist: Added 3 drops of phenolphthalein indicator to conical flask.',
            updatedApparatusList: updatedList,
          };
        }
        this.state.setFeedback(actionResult.message, 'error');
        return { success: false, message: actionResult.message, updatedApparatusList: updatedList };
      }

      case 4: {
        if (!burette) {
          const msg = 'Burette not found on workstation.';
          this.state.setFeedback(msg, 'error');
          return { success: false, message: msg, updatedApparatusList: updatedList };
        }
        const currentVol = burette.liquid?.volume || 0;
        const needed = Math.max(0, this.state.definition.config.titrant.initialBuretteVolume - currentVol);
        const actionResult =
          needed > 0
            ? executeChemistryAction(
                CHEMISTRY_ACTION_TYPES.ADD_REAGENT,
                {
                  targetId: burette.id,
                  chemicalId: 'sodium-hydroxide',
                  amount: needed,
                  concentration: this.state.definition.config.titrant.concentration,
                },
                apparatusList
              )
            : { success: true, updatedApparatusList: apparatusList };

        if (actionResult.success) {
          updatedList = actionResult.updatedApparatusList;
          this.state.buretteInitialVolume = this.state.definition.config.titrant.initialBuretteVolume;
          this.state.syncWithApparatus(updatedList, activeWorkstationId);
          this.state.completeStep(4);
          return {
            success: true,
            message: 'Demo Assist: Filled burette to 50.0 mL with standardized 0.1 M NaOH.',
            updatedApparatusList: updatedList,
          };
        }
        this.state.setFeedback(actionResult.message, 'error');
        return { success: false, message: actionResult.message, updatedApparatusList: updatedList };
      }

      case 5: {
        if (!flask || !burette) {
          const msg = 'Both conical flask and burette must be in place.';
          this.state.setFeedback(msg, 'error');
          return { success: false, message: msg, updatedApparatusList: updatedList };
        }
        const burettePos = burette.position || [0, 0.92, 0];
        const alignedFlaskPos = [burettePos[0], 0.92, burettePos[2] + 0.12];
        updatedList = apparatusList.map((item) =>
          item.id === flask.id
            ? { ...item, position: alignedFlaskPos, currentSurface: 'Titration Retort Stand Plate' }
            : item
        );
        this.state.burettePositioned = true;
        this.state.completeStep(5);
        return {
          success: true,
          message: 'Demo Assist: Positioned conical flask directly beneath the burette tip.',
          updatedApparatusList: updatedList,
        };
      }

      case 6: {
        if (!burette || !flask) {
          const msg = 'Burette and conical flask must be present.';
          this.state.setFeedback(msg, 'error');
          return { success: false, message: msg, updatedApparatusList: updatedList };
        }
        const actionResult = executeChemistryAction(
          CHEMISTRY_ACTION_TYPES.POUR,
          { sourceId: burette.id, destId: flask.id, amount: 10.0 },
          apparatusList
        );
        if (actionResult.success) {
          updatedList = actionResult.updatedApparatusList;
          this.state.syncWithApparatus(updatedList, activeWorkstationId);
          this.state.completeStep(6);
          return {
            success: true,
            message: 'Demo Assist: Dispensed 10.0 mL of 0.1 M NaOH into conical flask.',
            updatedApparatusList: updatedList,
          };
        }
        this.state.setFeedback(actionResult.message, 'error');
        return { success: false, message: actionResult.message, updatedApparatusList: updatedList };
      }

      case 7: {
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
        this.state.flaskSwirled = true;
        this.state.observedSwirl = true;
        this.state.completeStep(7);
        return {
          success: true,
          message: `Demo Assist: Swirled flask (${measureResult.result?.solutionName || 'mixture'}, pH ${measureResult.result?.ph}).`,
          updatedApparatusList: updatedList,
        };
      }

      case 8: {
        if (!burette || !flask) {
          const msg = 'Burette and conical flask must be present.';
          this.state.setFeedback(msg, 'error');
          return { success: false, message: msg, updatedApparatusList: updatedList };
        }
        const alreadyDispensed = Math.max(0, this.state.buretteInitialVolume - (burette.liquid?.volume || 0));
        const toEndpoint = Math.max(0.1, Math.round((25.1 - alreadyDispensed) * 10) / 10);
        const actionResult = executeChemistryAction(
          CHEMISTRY_ACTION_TYPES.POUR,
          { sourceId: burette.id, destId: flask.id, amount: toEndpoint },
          apparatusList
        );
        if (actionResult.success) {
          updatedList = actionResult.updatedApparatusList;
          this.state.syncWithApparatus(updatedList, activeWorkstationId);
          this.state.completeStep(8);
          return {
            success: true,
            message: 'Demo Assist: Endpoint reached! Solution turned persistent faint pink (pH ≥ 8.2).',
            updatedApparatusList: updatedList,
          };
        }
        this.state.setFeedback(actionResult.message, 'error');
        return { success: false, message: actionResult.message, updatedApparatusList: updatedList };
      }

      case 9: {
        const msg = 'Measure the burette ([M] or [E]) and enter your reading in the input box.';
        this.state.setFeedback(msg, 'info');
        return { success: false, message: msg, updatedApparatusList: updatedList };
      }

      default:
        return { success: false, message: 'Unknown step.', updatedApparatusList: updatedList };
    }
  }

  /**
   * Validates the student's final Step 9 burette volume reading against the actual volume dispensed.
   */
  validateAndSubmitReading(reading, apparatusList = [], activeWorkstationId = null) {
    this.state.setStudentReading(reading);
    this.state.syncWithApparatus(apparatusList, activeWorkstationId);

    const currentStep = this.state.getCurrentStep();
    if (this.state.status !== EXPERIMENT_STATUS.IN_PROGRESS || currentStep?.stepNumber !== 9) {
      return { success: false, message: 'Complete all previous titration steps before recording the final reading.' };
    }

    const readingVal = parseFloat(reading);
    if (isNaN(readingVal) || readingVal <= 0) {
      const msg = 'Enter a valid positive burette volume reading in mL (e.g. 25.1).';
      this.state.setFeedback(msg, 'warning');
      return { success: false, message: msg };
    }

    const stationItems = this._getStationItems(apparatusList, activeWorkstationId);
    const burette = stationItems.find((a) => a.type === 'burette_50');
    const currentBuretteVol = burette?.liquid?.volume ?? this.state.naohVolume;
    const actualDispensed = Math.max(
      0,
      Math.round((this.state.buretteInitialVolume - currentBuretteVol) * 100) / 100
    );

    if (Math.abs(readingVal - actualDispensed) > 0.5) {
      const msg = `Reading ${readingVal.toFixed(1)} mL does not match the burette scale! Measure or inspect the burette ([M] or [E]): Initial (${this.state.buretteInitialVolume.toFixed(1)} mL) − Remaining (${currentBuretteVol.toFixed(1)} mL).`;
      this.state.setFeedback(msg, 'warning');
      return { success: false, message: msg };
    }

    this.state.completeStep(9);
    const successMsg = `Verified burette reading: ${readingVal.toFixed(1)} mL (actual dispensed: ${actualDispensed.toFixed(1)} mL). Titration practical completed!`;
    this.state.setFeedback(successMsg, 'success');
    return { success: true, message: successMsg };
  }

  /**
   * Teacher validation hook invoked after every physical student action in the 3D lab.
   */
  handlePlayerAction(actionType, params, actionResult, apparatusList, activeWorkstationId) {
    if (this.state.status !== EXPERIMENT_STATUS.IN_PROGRESS) return;

    this.state.syncWithApparatus(apparatusList, activeWorkstationId);
    const currentStep = this.state.getCurrentStep();
    if (!currentStep) return;

    const stationItems = this._getStationItems(apparatusList, activeWorkstationId);
    const flask = stationItems.find((a) => a.type === 'conical_flask_250');
    const burette = stationItems.find((a) => a.type === 'burette_50');

    // Track student-verified apparatus in Step 1 (on PICK_UP, PLACE, or INSPECT)
    if (
      currentStep.stepNumber === 1 &&
      (actionType === 'PICK_UP' || actionType === 'PLACE' || actionType === 'INSPECT')
    ) {
      const touchedItem = apparatusList.find((a) => a.id === params?.targetId);
      if (touchedItem) {
        const matchedReq = REQUIRED_TITRATION_EQUIPMENT.find((eq) =>
          eq.matchTypes.includes(touchedItem.type)
        );
        if (matchedReq) {
          this.state.verifiedEquipmentKeys.add(matchedReq.key);
          this.state.syncWithApparatus(apparatusList, activeWorkstationId);
          const verifiedCount = REQUIRED_TITRATION_EQUIPMENT.filter(
            (eq) => this.state.requiredEquipmentStatus[eq.key]?.collected
          ).length;

          if (verifiedCount === REQUIRED_TITRATION_EQUIPMENT.length) {
            this.state.completeStep(1);
            this.state.setFeedback(
              'All 5 pieces of titration equipment collected and verified! Step 1 Complete.',
              'success'
            );
          } else {
            this.state.setFeedback(
              `Verified ${matchedReq.name} (${verifiedCount}/${REQUIRED_TITRATION_EQUIPMENT.length}). Inspect [E] or pick up [F] the remaining bench items.`,
              'info'
            );
          }
        }
      }
      return;
    }

    // STEP 2: Aspirate 25 mL HCl with Pipette & Dispense into Conical Flask
    if (currentStep.stepNumber === 2) {
      if (actionType === 'ASPIRATE') {
        const pipette = apparatusList.find((a) => a.id === params?.destId);
        if (pipette && this._hasChemical(pipette, 'hydrochloric-acid')) {
          const vol = pipette.liquid?.volume || 0;
          this.state.setFeedback(
            `Aspirated ${vol.toFixed(1)} mL of 0.1 M HCl into the pipette. Walk to the Conical Flask and press [P] to dispense.`,
            'info'
          );
        }
        return;
      }

      if (actionType === CHEMISTRY_ACTION_TYPES.POUR && params?.destId === flask?.id) {
        const flaskVol = flask?.liquid?.volume || 0;
        const hasHcl = this._hasChemical(flask, 'hydrochloric-acid');
        if (hasHcl && flaskVol >= 24.5 && flaskVol <= 25.5) {
          this.state.completeStep(2);
          this.state.setFeedback(
            'Dispensed 25.0 mL of 0.1 M HCl from pipette into the conical flask. Step 2 Complete!',
            'success'
          );
        } else if (hasHcl && flaskVol < 24.5) {
          this.state.setFeedback(
            `Conical flask currently holds ${flaskVol.toFixed(1)} mL HCl. Transfer a full 25.0 mL aliquot using the pipette.`,
            'warning'
          );
        }
      }
      return;
    }

    // STEP 3: Add Phenolphthalein Indicator from Indicator Bottle
    if (currentStep.stepNumber === 3) {
      if (
        actionType === CHEMISTRY_ACTION_TYPES.POUR &&
        params?.destId === flask?.id &&
        (flask?.liquid?.hasIndicator || flask?.solution?.hasIndicator)
      ) {
        this.state.completeStep(3);
        this.state.setFeedback(
          'Added phenolphthalein indicator to the conical flask. Solution remains clear in acid. Step 3 Complete!',
          'success'
        );
      }
      return;
    }

    // STEP 4: Fill Burette with 0.1 M NaOH to 50.0 mL mark
    if (currentStep.stepNumber === 4) {
      if (actionType === CHEMISTRY_ACTION_TYPES.POUR && params?.destId === burette?.id) {
        const buretteVol = burette?.liquid?.volume || 0;
        const hasNaoh = this._hasChemical(burette, 'sodium-hydroxide');
        if (hasNaoh && buretteVol >= 48) {
          this.state.buretteInitialVolume = buretteVol;
          this.state.syncWithApparatus(apparatusList, activeWorkstationId);
          this.state.completeStep(4);
          this.state.setFeedback(
            `Filled burette to ${buretteVol.toFixed(1)} mL with 0.1 M NaOH titrant. Step 4 Complete!`,
            'success'
          );
        } else if (hasNaoh) {
          this.state.setFeedback(
            `Burette filled to ${buretteVol.toFixed(1)} / 50.0 mL. Pour again ([P]) to reach the 50.0 mL mark.`,
            'info'
          );
        }
      }
      return;
    }

    // STEP 5: Position Conical Flask Beneath Burette
    if (currentStep.stepNumber === 5) {
      if (
        (actionType === 'ALIGN' || actionType === 'PLACE') &&
        this._isFlaskAlignedWithBurette(flask, burette)
      ) {
        this.state.burettePositioned = true;
        this.state.completeStep(5);
        this.state.setFeedback(
          'Conical flask positioned directly beneath the burette delivery tip. Step 5 Complete!',
          'success'
        );
      }
      return;
    }

    // STEP 6: Begin Dispensing NaOH via Burette Stopcock
    if (currentStep.stepNumber === 6) {
      if (actionType === 'TURN_STOPCOCK') {
        const dispensed = Math.max(0, this.state.buretteInitialVolume - (burette?.liquid?.volume || 0));
        if (dispensed >= 1.0) {
          this.state.titrationStarted = true;
          this.state.completeStep(6);
          this.state.setFeedback(
            `Dispensed ${dispensed.toFixed(1)} mL of 0.1 M NaOH from the burette into the conical flask. Step 6 Complete!`,
            'success'
          );
        }
      }
      return;
    }

    // STEP 7: Physically Swirl Conical Flask ([S]) to Mix & Observe
    if (currentStep.stepNumber === 7) {
      if (actionType === 'SWIRL') {
        this.state.flaskSwirled = true;
        this.state.observedSwirl = true;
        this.state.completeStep(7);
        this.state.setFeedback(
          'Swirled conical flask and observed mixing. Continue adding NaOH gradually until persistent pink endpoint! Step 7 Complete!',
          'success'
        );
      }
      return;
    }

    // STEP 8: Add NaOH Gradually & Dropwise Until Persistent Faint Pink Endpoint (pH >= 8.2)
    if (currentStep.stepNumber === 8) {
      if (actionType === 'TURN_STOPCOCK' || actionType === 'SWIRL') {
        const dispensed = Math.max(0, this.state.buretteInitialVolume - (burette?.liquid?.volume || 0));
        const ph = flask?.liquid?.ph ?? 7.0;

        if (this.state.endpointDetected) {
          if (dispensed <= 26.5) {
            this.state.completeStep(8);
            this.state.setFeedback(
              `Endpoint reached at ${dispensed.toFixed(1)} mL NaOH! Persistent faint pink color observed (pH ${ph.toFixed(2)}). Step 8 Complete!`,
              'success'
            );
          } else {
            this.state.setFeedback(
              `Overshot the endpoint! Dispensed ${dispensed.toFixed(1)} mL NaOH (expected ~25.0–25.2 mL), pH ${ph.toFixed(2)}. Use Reset to repeat carefully with 0.1 mL drops ([G]) near 25 mL.`,
              'warning'
            );
          }
        } else if (actionType === 'TURN_STOPCOCK') {
          const approachHint =
            dispensed >= 20
              ? 'Approaching equivalence — switch to 0.1 mL drops ([G]) and swirl ([S])!'
              : 'Continue adding NaOH gradually ([T] / [G]) and swirling ([S]).';
          this.state.setFeedback(
            `Dispensed ${dispensed.toFixed(1)} mL NaOH total (Flask pH ${ph.toFixed(2)}, clear). ${approachHint}`,
            'info'
          );
        }
      }
    }
  }

  /**
   * Positions the conical flask directly on the retort stand base plate under the burette tip.
   */
  positionFlaskUnderBurette(apparatusList = [], activeWorkstationId = null) {
    const stationItems = this._getStationItems(apparatusList, activeWorkstationId);
    const flask = stationItems.find((a) => a.type === 'conical_flask_250');
    const burette = stationItems.find((a) => a.type === 'burette_50');
    if (!flask || !burette) {
      return {
        success: false,
        message: 'Conical flask or burette not found on workstation.',
        updatedApparatusList: apparatusList,
      };
    }

    const targetPos = [burette.position[0], 0.92, burette.position[2] + 0.12];
    const updated = apparatusList.map((a) => (a.id === flask.id ? { ...a, position: targetPos } : a));
    this.state.burettePositioned = true;
    this.handlePlayerAction(
      'ALIGN',
      { flaskId: flask.id, buretteId: burette.id },
      { success: true },
      updated,
      activeWorkstationId
    );
    return {
      success: true,
      message: 'Positioned conical flask directly beneath burette tip.',
      updatedApparatusList: updated,
    };
  }
}
