/**
 * Chemistry Action System.
 * Standardized action dispatcher and handlers for chemistry lab operations:
 * - inspect
 * - pickUp
 * - place
 * - pour
 * - measure
 * - mix
 * - addReagent
 * - heat
 * 
 * Cleanly separates player intent from domain engine calculations.
 */

import {
  transferLiquid,
  addReagentToContainer,
  measureContainer,
} from './chemistryEngine';

export const CHEMISTRY_ACTION_TYPES = {
  INSPECT: 'inspect',
  PICK_UP: 'pickUp',
  PLACE: 'place',
  POUR: 'pour',
  MEASURE: 'measure',
  MIX: 'mix',
  ADD_REAGENT: 'addReagent',
  HEAT: 'heat',
};

/**
 * Dispatches a chemistry action and returns the resulting state changes.
 * Pure logic function that operates on apparatusList and returns updated list + audit result.
 * 
 * @param {string} actionType - One of CHEMISTRY_ACTION_TYPES
 * @param {Object} params - Action-specific parameters
 * @param {Array} apparatusList - Current list of all apparatus in lab
 * @returns {Object} { success, message, updatedApparatusList, result, error }
 */
export function executeChemistryAction(actionType, params = {}, apparatusList = []) {
  switch (actionType) {
    case CHEMISTRY_ACTION_TYPES.POUR: {
      const { sourceId, destId, amount = 25 } = params;
      const source = apparatusList.find((a) => a.id === sourceId);
      const dest = apparatusList.find((a) => a.id === destId);

      if (!source) {
        return {
          success: false,
          message: 'Pour action failed: Source apparatus not found.',
          updatedApparatusList: apparatusList,
        };
      }

      if (!dest) {
        return {
          success: false,
          message: 'Pour action failed: Destination container not found.',
          updatedApparatusList: apparatusList,
        };
      }

      if (source.id === dest.id) {
        return {
          success: false,
          message: 'Cannot pour a container into itself.',
          updatedApparatusList: apparatusList,
        };
      }

      const outcome = transferLiquid(source, dest, amount);
      if (!outcome.success) {
        return {
          success: false,
          message: outcome.reason,
          updatedApparatusList: apparatusList,
        };
      }

      const updatedList = apparatusList.map((item) => {
        if (item.id === source.id) return outcome.updatedSource;
        if (item.id === dest.id) return outcome.updatedDest;
        return item;
      });

      return {
        success: true,
        message: outcome.message,
        updatedApparatusList: updatedList,
        result: {
          transferredVolume: outcome.transferredVolume,
          source: outcome.updatedSource,
          dest: outcome.updatedDest,
        },
      };
    }

    case CHEMISTRY_ACTION_TYPES.MIX: {
      // Mix is the symmetric combination of two containers or pouring amount from A into B
      const { containerAId, containerBId, amount = 25 } = params;
      return executeChemistryAction(CHEMISTRY_ACTION_TYPES.POUR, {
        sourceId: containerAId,
        destId: containerBId,
        amount,
      }, apparatusList);
    }

    case CHEMISTRY_ACTION_TYPES.ADD_REAGENT: {
      const { targetId, chemicalId, amount = 25, concentration = null } = params;
      const target = apparatusList.find((a) => a.id === targetId);

      if (!target) {
        return {
          success: false,
          message: 'Add reagent failed: Target apparatus not found.',
          updatedApparatusList: apparatusList,
        };
      }

      const outcome = addReagentToContainer(target, chemicalId, amount, concentration);
      if (!outcome.success) {
        return {
          success: false,
          message: outcome.reason,
          updatedApparatusList: apparatusList,
        };
      }

      const updatedList = apparatusList.map((item) =>
        item.id === target.id ? outcome.updatedApparatus : item
      );

      return {
        success: true,
        message: outcome.message,
        updatedApparatusList: updatedList,
        result: {
          addedVolume: outcome.addedVolume,
          target: outcome.updatedApparatus,
        },
      };
    }

    case CHEMISTRY_ACTION_TYPES.MEASURE: {
      const { targetId } = params;
      const target = apparatusList.find((a) => a.id === targetId);

      if (!target) {
        return {
          success: false,
          message: 'Measure action failed: Target apparatus not found.',
          updatedApparatusList: apparatusList,
        };
      }

      const measurement = measureContainer(target);
      return {
        success: true,
        message: `Measured ${measurement.apparatusName}: ${measurement.volume} mL (${measurement.fillPercentage}% full), ${measurement.solutionName}, pH ${measurement.ph}, ${measurement.temperature} °C.`,
        updatedApparatusList: apparatusList,
        result: measurement,
      };
    }

    case CHEMISTRY_ACTION_TYPES.HEAT: {
      const { targetId, deltaTemp = 5 } = params;
      const target = apparatusList.find((a) => a.id === targetId);

      if (!target) {
        return {
          success: false,
          message: 'Heat action failed: Target apparatus not found.',
          updatedApparatusList: apparatusList,
        };
      }

      const currentTemp = target.temperature || target.liquid?.temperature || 24;
      const newTemp = Math.min(100, Math.round((currentTemp + deltaTemp) * 10) / 10);

      const updatedTarget = {
        ...target,
        temperature: newTemp,
        liquid: target.liquid ? { ...target.liquid, temperature: newTemp } : target.liquid,
        solution: target.solution ? { ...target.solution, temperature: newTemp } : target.solution,
      };

      const updatedList = apparatusList.map((item) =>
        item.id === target.id ? updatedTarget : item
      );

      return {
        success: true,
        message: `Heated ${target.name} to ${newTemp} °C.`,
        updatedApparatusList: updatedList,
        result: { temperature: newTemp },
      };
    }

    default:
      return {
        success: false,
        message: `Unsupported action type: ${actionType}`,
        updatedApparatusList: apparatusList,
      };
  }
}
