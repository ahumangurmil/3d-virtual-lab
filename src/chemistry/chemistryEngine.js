/**
 * Chemistry Engine Core.
 * Pure JavaScript domain logic decoupled from Three.js, React, and rendering.
 * Provides the calculation engine for solutions, mixing, pouring, measuring, and reagents.
 */

import { getChemicalDefinition, createChemicalComponent } from './chemicals';
import { evaluateSolutionProperties } from './reactions';

/**
 * Creates an empty solution state.
 */
export function createEmptySolution() {
  return {
    volume: 0,
    contents: 'empty',
    name: 'Empty Container',
    formula: '',
    concentration: 0,
    color: 'clear',
    hexColor: '#f1f5f9',
    ph: 7.0,
    temperature: 24.0,
    components: [],
    hasIndicator: false,
  };
}

/**
 * Creates a solution state initialized with a single chemical.
 */
export function createInitialSolution({
  chemicalId = 'water',
  volume = 100,
  concentration = null,
  temperature = 24.0,
}) {
  const def = getChemicalDefinition(chemicalId);
  const comp = createChemicalComponent(chemicalId, volume, concentration);
  const evalProps = evaluateSolutionProperties([comp], volume, temperature);

  return {
    volume: volume,
    contents: def.id,
    name: def.name,
    formula: def.formula || '',
    concentration: comp.concentration,
    color: evalProps.color,
    hexColor: evalProps.hexColor,
    ph: evalProps.ph,
    temperature: evalProps.temperature,
    components: [comp],
    hasIndicator: comp.isIndicator,
  };
}

/**
 * Mixes two solutions and calculates resulting state.
 * 
 * @param {Object} solA - First solution
 * @param {Object} solB - Second solution
 * @param {number} volA - Volume of solA to mix (defaults to solA.volume)
 * @param {number} volB - Volume of solB to mix (defaults to solB.volume)
 * @returns {Object} New combined solution state
 */
export function combineSolutions(solA, solB, volA = null, volB = null) {
  const takeA = volA !== null ? Math.min(Math.max(0, volA), solA?.volume || 0) : solA?.volume || 0;
  const takeB = volB !== null ? Math.min(Math.max(0, volB), solB?.volume || 0) : solB?.volume || 0;
  const totalVol = Math.round((takeA + takeB) * 100) / 100;

  if (totalVol <= 0) {
    return createEmptySolution();
  }

  // If one solution is empty, return scaled version of the other
  if (takeA <= 0 && solB && takeB > 0) {
    const ratioB = takeB / (solB.volume || takeB);
    const scaledCompsB = (solB.components || []).map((c) => ({
      ...c,
      volume: Math.round(c.volume * ratioB * 100) / 100,
      moles: c.moles * ratioB,
    }));
    const evalProps = evaluateSolutionProperties(scaledCompsB, totalVol, solB.temperature || 24);
    return {
      volume: totalVol,
      contents: solB.contents || 'solution',
      name: solB.name || 'Chemical Solution',
      formula: solB.formula || '',
      concentration: solB.concentration || 0,
      color: evalProps.color,
      hexColor: evalProps.hexColor,
      ph: evalProps.ph,
      temperature: evalProps.temperature,
      components: scaledCompsB,
      hasIndicator: evalProps.hasIndicator,
    };
  }

  if (takeB <= 0 && solA && takeA > 0) {
    const ratioA = takeA / (solA.volume || takeA);
    const scaledCompsA = (solA.components || []).map((c) => ({
      ...c,
      volume: Math.round(c.volume * ratioA * 100) / 100,
      moles: c.moles * ratioA,
    }));
    const evalProps = evaluateSolutionProperties(scaledCompsA, totalVol, solA.temperature || 24);
    return {
      volume: totalVol,
      contents: solA.contents || 'solution',
      name: solA.name || 'Chemical Solution',
      formula: solA.formula || '',
      concentration: solA.concentration || 0,
      color: evalProps.color,
      hexColor: evalProps.hexColor,
      ph: evalProps.ph,
      temperature: evalProps.temperature,
      components: scaledCompsA,
      hasIndicator: evalProps.hasIndicator,
    };
  }

  // Combine components from both solutions
  const mergedComponents = [];
  const compMap = new Map();

  // Helper to add scaled components to map
  const addComps = (components, ratio) => {
    for (const comp of components || []) {
      const scaledVol = comp.volume * ratio;
      const scaledMoles = comp.moles * ratio;
      if (compMap.has(comp.chemicalId)) {
        const existing = compMap.get(comp.chemicalId);
        existing.volume += scaledVol;
        existing.moles += scaledMoles;
      } else {
        compMap.set(comp.chemicalId, {
          ...comp,
          volume: scaledVol,
          moles: scaledMoles,
        });
      }
    }
  };

  const ratioA = solA && solA.volume > 0 ? takeA / solA.volume : 1;
  const ratioB = solB && solB.volume > 0 ? takeB / solB.volume : 1;

  if (solA && solA.components) addComps(solA.components, ratioA);
  if (solB && solB.components) addComps(solB.components, ratioB);

  // Recalculate component concentrations relative to new total volume
  for (const comp of compMap.values()) {
    const newConc = totalVol > 0 ? (comp.moles * 1000) / totalVol : 0;
    comp.concentration = Math.round(newConc * 1000) / 1000;
    comp.volume = Math.round(comp.volume * 100) / 100;
    mergedComponents.push(comp);
  }

  // Weighted thermal mix
  const tempA = solA?.temperature || 24;
  const tempB = solB?.temperature || 24;
  const avgTemp = (tempA * takeA + tempB * takeB) / totalVol;

  const evalProps = evaluateSolutionProperties(mergedComponents, totalVol, avgTemp);

  // Determine dominant chemical name / formula / concentration
  let mainComp = mergedComponents[0] || null;
  for (const c of mergedComponents) {
    if (c.chemicalId !== 'water' && (!mainComp || c.moles > (mainComp.moles || 0))) {
      mainComp = c;
    }
  }

  return {
    volume: totalVol,
    contents: mainComp ? mainComp.chemicalId : 'water',
    name: evalProps.name,
    formula: mainComp ? mainComp.formula : '',
    concentration: mainComp ? mainComp.concentration : 0,
    color: evalProps.color,
    hexColor: evalProps.hexColor,
    ph: evalProps.ph,
    temperature: evalProps.temperature,
    components: mergedComponents,
    hasIndicator: evalProps.hasIndicator,
  };
}

/**
 * Synchronizes an apparatus's standard top-level and liquid state fields.
 * Ensures strict backward compatibility with 3D components and forward compatibility with chemistry.
 * 
 * @param {Object} apparatus 
 * @param {Object} solution 
 * @returns {Object} Updated apparatus
 */
export function applySolutionToApparatus(apparatus, solution) {
  const capacityNum = Number(apparatus.capacity) || (apparatus.liquid?.maxVolume) || 250;
  const vol = Math.min(Math.max(0, solution?.volume || 0), capacityNum);

  return {
    ...apparatus,
    capacity: capacityNum,
    volume: vol,
    contents: solution?.contents || 'empty',
    concentration: solution?.concentration !== undefined ? solution.concentration : 0,
    color: solution?.color || 'clear',
    temperature: solution?.temperature !== undefined ? solution.temperature : 24,
    ph: solution?.ph !== undefined ? solution.ph : 7.0,
    solution: solution,
    liquid: {
      volume: vol,
      maxVolume: capacityNum,
      color: solution?.hexColor || '#f1f5f9',
      name: solution?.name || 'Empty',
      ph: solution?.ph !== undefined ? solution.ph : 7.0,
      temperature: solution?.temperature !== undefined ? solution.temperature : 24,
      contents: solution?.contents || 'empty',
      formula: solution?.formula || '',
      concentration: solution?.concentration || 0,
    },
  };
}

/**
 * Transfers liquid from a source container to a destination container (Pour action).
 * 
 * Rules enforced:
 * - Checks source has liquid (> 0)
 * - Checks destination has remaining capacity
 * - Clamps transfer volume: min(requestedAmount, sourceVolume, destRemainingCapacity)
 * - Decreases source volume proportionally (keeping solution composition identical)
 * - Mixes transferred fraction into destination container
 * - Updates visible liquid level and solution colors
 * 
 * @param {Object} sourceApparatus 
 * @param {Object} destApparatus 
 * @param {number} requestedAmount - Amount to transfer in mL
 * @returns {Object} { success, reason, transferredVolume, updatedSource, updatedDest }
 */
export function transferLiquid(sourceApparatus, destApparatus, requestedAmount = 25) {
  const srcVol = sourceApparatus.volume !== undefined ? sourceApparatus.volume : (sourceApparatus.liquid?.volume || 0);
  if (srcVol <= 0) {
    return {
      success: false,
      reason: `Cannot pour from ${sourceApparatus.name}: container is empty.`,
      transferredVolume: 0,
      updatedSource: sourceApparatus,
      updatedDest: destApparatus,
    };
  }

  const destCap = Number(destApparatus.capacity) || (destApparatus.liquid?.maxVolume) || 250;
  const destVol = destApparatus.volume !== undefined ? destApparatus.volume : (destApparatus.liquid?.volume || 0);
  const remainingCap = Math.max(0, destCap - destVol);

  if (remainingCap <= 0) {
    return {
      success: false,
      reason: `Cannot pour into ${destApparatus.name}: container is already at full capacity (${destCap} mL).`,
      transferredVolume: 0,
      updatedSource: sourceApparatus,
      updatedDest: destApparatus,
    };
  }

  const transferAmount = Math.min(requestedAmount, srcVol, remainingCap);
  if (transferAmount <= 0) {
    return {
      success: false,
      reason: 'No liquid transferred.',
      transferredVolume: 0,
      updatedSource: sourceApparatus,
      updatedDest: destApparatus,
    };
  }

  // Calculate new source state
  const newSrcVol = Math.round((srcVol - transferAmount) * 100) / 100;
  let newSrcSolution;

  if (newSrcVol <= 0) {
    newSrcSolution = createEmptySolution();
  } else {
    // Retain exact composition, scaled to remaining volume
    const srcSol = sourceApparatus.solution || createInitialSolution({
      chemicalId: sourceApparatus.contents || 'water',
      volume: srcVol,
      concentration: sourceApparatus.concentration,
      temperature: sourceApparatus.temperature,
    });
    const scale = newSrcVol / srcVol;
    newSrcSolution = {
      ...srcSol,
      volume: newSrcVol,
      components: (srcSol.components || []).map((c) => ({
        ...c,
        volume: Math.round(c.volume * scale * 100) / 100,
        moles: c.moles * scale,
      })),
    };
  }

  // Calculate new destination state by combining existing dest with transferred portion of source
  const srcSol = sourceApparatus.solution || createInitialSolution({
    chemicalId: sourceApparatus.contents || 'water',
    volume: srcVol,
    concentration: sourceApparatus.concentration,
    temperature: sourceApparatus.temperature,
  });

  const destSol = destVol > 0
    ? (destApparatus.solution || createInitialSolution({
        chemicalId: destApparatus.contents || 'water',
        volume: destVol,
        concentration: destApparatus.concentration,
        temperature: destApparatus.temperature,
      }))
    : createEmptySolution();

  const newDestSolution = combineSolutions(destSol, srcSol, destVol, transferAmount);

  const updatedSource = applySolutionToApparatus(sourceApparatus, newSrcSolution);
  const updatedDest = applySolutionToApparatus(destApparatus, newDestSolution);

  return {
    success: true,
    transferredVolume: transferAmount,
    updatedSource,
    updatedDest,
    message: `Poured ${transferAmount} mL from ${sourceApparatus.name} into ${destApparatus.name}.`,
  };
}

/**
 * Adds a specific chemical reagent to an apparatus container (AddReagent action).
 * 
 * @param {Object} apparatus 
 * @param {string} chemicalId 
 * @param {number} amount - Volume in mL
 * @param {number|null} customConcentration 
 * @returns {Object} { success, reason, addedVolume, updatedApparatus }
 */
export function addReagentToContainer(apparatus, chemicalId, amount = 25, customConcentration = null) {
  const cap = Number(apparatus.capacity) || (apparatus.liquid?.maxVolume) || 250;
  const currentVol = apparatus.volume !== undefined ? apparatus.volume : (apparatus.liquid?.volume || 0);
  const spaceLeft = Math.max(0, cap - currentVol);

  if (spaceLeft <= 0) {
    return {
      success: false,
      reason: `Cannot add reagent: ${apparatus.name} is full (${cap} mL).`,
      addedVolume: 0,
      updatedApparatus: apparatus,
    };
  }

  const addAmount = Math.min(amount, spaceLeft);
  const reagentSolution = createInitialSolution({
    chemicalId,
    volume: addAmount,
    concentration: customConcentration,
    temperature: 24,
  });

  const currentSol = currentVol > 0
    ? (apparatus.solution || createInitialSolution({
        chemicalId: apparatus.contents || 'water',
        volume: currentVol,
        concentration: apparatus.concentration,
        temperature: apparatus.temperature,
      }))
    : createEmptySolution();

  const combinedSolution = combineSolutions(currentSol, reagentSolution, currentVol, addAmount);
  const updated = applySolutionToApparatus(apparatus, combinedSolution);

  return {
    success: true,
    addedVolume: addAmount,
    updatedApparatus: updated,
    message: `Added ${addAmount} mL of ${reagentSolution.name} to ${apparatus.name}.`,
  };
}

/**
 * Measures the physical and chemical state of an apparatus (Measure action).
 * 
 * @param {Object} apparatus 
 * @returns {Object} Structured measurement data
 */
export function measureContainer(apparatus) {
  const capacity = Number(apparatus.capacity) || (apparatus.liquid?.maxVolume) || 250;
  const volume = apparatus.volume !== undefined ? apparatus.volume : (apparatus.liquid?.volume || 0);
  const fillPercentage = capacity > 0 ? Math.round((volume / capacity) * 100) : 0;
  const solution = apparatus.solution || (apparatus.liquid ? {
    name: apparatus.liquid.name,
    formula: apparatus.liquid.formula || '',
    concentration: apparatus.liquid.concentration || 0,
    color: apparatus.color || 'clear',
    hexColor: apparatus.liquid.color || '#f1f5f9',
    ph: apparatus.liquid.ph || 7.0,
    temperature: apparatus.liquid.temperature || 24,
  } : null);

  return {
    apparatusId: apparatus.id,
    apparatusName: apparatus.name,
    type: apparatus.type,
    capacity: capacity,
    volume: volume,
    fillPercentage: fillPercentage,
    isEmpty: volume <= 0,
    isFull: volume >= capacity,
    contents: apparatus.contents || 'empty',
    solutionName: solution?.name || 'Empty',
    formula: solution?.formula || '',
    concentration: solution?.concentration !== undefined ? solution.concentration : 0,
    concentrationUnit: 'M',
    color: apparatus.color || solution?.color || 'clear',
    hexColor: solution?.hexColor || '#f1f5f9',
    ph: solution?.ph !== undefined ? solution.ph : 7.0,
    temperature: solution?.temperature !== undefined ? solution.temperature : 24,
    componentsCount: solution?.components?.length || 0,
    timestamp: Date.now(),
  };
}
