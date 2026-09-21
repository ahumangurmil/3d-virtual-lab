/**
 * Dedicated Titration Experiment State.
 * Pure JavaScript domain state decoupled from React components.
 */

import { EXPERIMENT_STATUS, REQUIRED_TITRATION_EQUIPMENT } from './experimentTypes';
import { ACID_BASE_TITRATION_DEFINITION } from './titrationDefinition';

export class TitrationExperimentState {
  constructor(definition = ACID_BASE_TITRATION_DEFINITION) {
    this.definition = definition;
    this.listeners = new Set();
    this.reset();
  }

  reset() {
    this.status = EXPERIMENT_STATUS.IDLE;
    this.currentStepIndex = 0;
    this.completedSteps = [];

    // Equipment tracking
    this.requiredEquipmentStatus = {};
    REQUIRED_TITRATION_EQUIPMENT.forEach((eq) => {
      this.requiredEquipmentStatus[eq.key] = {
        key: eq.key,
        name: eq.name,
        collected: false,
        apparatusId: null,
      };
    });

    // Experiment chemical measurements
    this.hclVolume = 0;
    this.hclConcentration = this.definition.config.analyte.concentration;
    this.naohVolume = 0;
    this.naohConcentration = this.definition.config.titrant.concentration;
    this.indicatorAdded = false;
    this.endpointDetected = false;
    this.studentReading = '';
    this.burettePositioned = false;
    this.observedSwirl = false;

    // Feedback and mistake alerts
    this.lastFeedback = {
      message: 'Acid–Base Titration ready to start. Click "Start Experiment" to begin.',
      type: 'info',
      timestamp: Date.now(),
    };

    this.notify();
  }

  start() {
    this.status = EXPERIMENT_STATUS.IN_PROGRESS;
    this.lastFeedback = {
      message: 'Titration experiment started. Step 1: Collect the required laboratory equipment.',
      type: 'info',
      timestamp: Date.now(),
    };
    this.notify();
  }

  pause() {
    if (this.status === EXPERIMENT_STATUS.IN_PROGRESS) {
      this.status = EXPERIMENT_STATUS.PAUSED;
      this.notify();
    }
  }

  resume() {
    if (this.status === EXPERIMENT_STATUS.PAUSED) {
      this.status = EXPERIMENT_STATUS.IN_PROGRESS;
      this.notify();
    }
  }

  setFeedback(message, type = 'info') {
    this.lastFeedback = {
      message,
      type,
      timestamp: Date.now(),
    };
    this.notify();
  }

  setStudentReading(reading) {
    this.studentReading = reading;
    this.notify();
  }

  completeStep(stepNumber) {
    if (!this.completedSteps.includes(stepNumber)) {
      this.completedSteps.push(stepNumber);
      this.completedSteps.sort((a, b) => a - b);
    }

    if (this.currentStepIndex < this.definition.steps.length - 1) {
      this.currentStepIndex += 1;
      const nextStep = this.definition.steps[this.currentStepIndex];
      this.setFeedback(`Step ${stepNumber} completed! Next: Step ${nextStep.stepNumber}: ${nextStep.title}`, 'success');
    } else {
      this.status = EXPERIMENT_STATUS.COMPLETED;
      this.setFeedback('Titration Experiment Complete! All 9 steps verified successfully.', 'success');
    }

    this.notify();
  }

  /**
   * Evaluates active apparatus on the student workstation and updates state fields.
   */
  syncWithApparatus(apparatusList = [], workstationId = null) {
    if (!apparatusList || apparatusList.length === 0) return;

    // Filter relevant station apparatus if specified
    const stationItems = workstationId
      ? apparatusList.filter((a) => a.workstationId === workstationId || !a.workstationId)
      : apparatusList;

    // 1. Sync required equipment recognition
    REQUIRED_TITRATION_EQUIPMENT.forEach((eq) => {
      const match = stationItems.find((a) => eq.matchTypes.includes(a.type));
      if (match) {
        this.requiredEquipmentStatus[eq.key] = {
          key: eq.key,
          name: eq.name,
          collected: true,
          apparatusId: match.id,
        };
      }
    });

    // 2. Sync Conical Flask contents
    const flask = stationItems.find((a) => a.type === 'conical_flask_250');
    if (flask && flask.liquid) {
      const components = flask.solution?.components || [];
      const hasHcl = components.some((c) => c.chemicalId === 'hydrochloric-acid' || c.isAcid);
      const hasInd = flask.liquid.hasIndicator || components.some((c) => c.isIndicator);

      if (hasHcl) {
        this.hclVolume = flask.liquid.volume || 0;
        this.hclConcentration = flask.concentration || this.hclConcentration;
      }

      this.indicatorAdded = Boolean(hasInd);

      // Endpoint detection based on indicator transition (pH >= 8.2 or color pink)
      if (this.indicatorAdded && (flask.liquid.ph >= 8.0 || flask.liquid.color === 'pink' || flask.liquid.hexColor === '#ec4899')) {
        this.endpointDetected = true;
      }
    }

    // 3. Sync Burette contents
    const burette = stationItems.find((a) => a.type === 'burette_50');
    if (burette && burette.liquid) {
      const components = burette.solution?.components || [];
      const hasNaoh = components.some((c) => c.chemicalId === 'sodium-hydroxide' || c.isBase);
      if (hasNaoh) {
        this.naohVolume = burette.liquid.volume || 0;
        this.naohConcentration = burette.concentration || this.naohConcentration;
      }
    }

    this.notify();
  }

  getCurrentStep() {
    return this.definition.steps[this.currentStepIndex] || null;
  }

  getSnapshot() {
    return {
      experimentId: this.definition.id,
      title: this.definition.name,
      subtitle: this.definition.subtitle,
      status: this.status,
      currentStepIndex: this.currentStepIndex,
      currentStep: this.getCurrentStep(),
      totalSteps: this.definition.steps.length,
      completedSteps: [...this.completedSteps],
      requiredEquipmentStatus: { ...this.requiredEquipmentStatus },
      hclVolume: this.hclVolume,
      hclConcentration: this.hclConcentration,
      naohVolume: this.naohVolume,
      naohConcentration: this.naohConcentration,
      indicatorAdded: this.indicatorAdded,
      endpointDetected: this.endpointDetected,
      studentReading: this.studentReading,
      burettePositioned: this.burettePositioned,
      observedSwirl: this.observedSwirl,
      lastFeedback: { ...this.lastFeedback },
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('Error in TitrationExperimentState listener:', err);
      }
    });
  }
}
