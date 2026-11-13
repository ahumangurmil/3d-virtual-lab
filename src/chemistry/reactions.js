/**
 * Chemistry Reactions and Physical-Chemical Property Calculation Rules.
 * Pure calculations decoupled from Three.js and React.
 * Handles:
 * - Indicator color transitions (Phenolphthalein colorless in acid/neutral, pink in alkaline)
 * - Acid-base neutralization equilibrium
 * - Color mixing and dilution
 * - Thermal equilibration and neutralization heat
 */

import { getChemicalDefinition } from './chemicals';

const MOLE_EPSILON = 1e-12;
const WATER_MOLAR_MASS = 18.015; // g/mol

/**
 * Helper to convert hex to RGB
 */
function hexToRgb(hex) {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Helper to convert RGB to hex
 */
function rgbToHex(r, g, b) {
  const clamp = (v) => Math.min(255, Math.max(0, Math.round(v)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * Applies 1:1 stoichiometric neutralization for the strong acid–strong base reaction:
 *   HCl + NaOH -> NaCl + H2O
 *
 * Only reacts 'hydrochloric-acid' and 'sodium-hydroxide'; other species are left untouched.
 * Consumed reactants reach 0 (and are omitted from the returned list) so subsequent
 * pours only see unreacted excess moles and never re-react already neutralized moles.
 *
 * @param {Array} components - Merged solution components
 * @returns {{ components: Array, reactedMoles: number }}
 */
export function applyStrongAcidBaseNeutralization(components = []) {
  const compMap = new Map();

  for (const comp of components) {
    if (!comp || !comp.chemicalId) continue;
    const moles = Math.max(0, Number(comp.moles) || 0);
    const volume = Math.max(0, Number(comp.volume) || 0);
    if (compMap.has(comp.chemicalId)) {
      const existing = compMap.get(comp.chemicalId);
      existing.moles += moles;
      existing.volume += volume;
    } else {
      compMap.set(comp.chemicalId, {
        ...comp,
        moles,
        volume,
      });
    }
  }

  const hclComp = compMap.get('hydrochloric-acid');
  const naohComp = compMap.get('sodium-hydroxide');
  const hclMoles = hclComp ? hclComp.moles : 0;
  const naohMoles = naohComp ? naohComp.moles : 0;
  const reactedMoles = Math.min(hclMoles, naohMoles);

  if (reactedMoles <= MOLE_EPSILON) {
    return {
      components: Array.from(compMap.values()),
      reactedMoles: 0,
    };
  }

  let remHclMoles = Math.max(0, hclMoles - reactedMoles);
  let remNaohMoles = Math.max(0, naohMoles - reactedMoles);
  if (remHclMoles < MOLE_EPSILON) remHclMoles = 0;
  if (remNaohMoles < MOLE_EPSILON) remNaohMoles = 0;

  const hclConsumedFrac = hclMoles > 0 ? (hclMoles - remHclMoles) / hclMoles : 0;
  const naohConsumedFrac = naohMoles > 0 ? (naohMoles - remNaohMoles) / naohMoles : 0;

  const hclReleasedVol = (hclComp.volume || 0) * hclConsumedFrac;
  const naohReleasedVol = (naohComp.volume || 0) * naohConsumedFrac;

  if (remHclMoles > 0) {
    hclComp.moles = remHclMoles;
    hclComp.volume = Math.max(0, hclComp.volume - hclReleasedVol);
  } else {
    compMap.delete('hydrochloric-acid');
  }

  if (remNaohMoles > 0) {
    naohComp.moles = remNaohMoles;
    naohComp.volume = Math.max(0, naohComp.volume - naohReleasedVol);
  } else {
    compMap.delete('sodium-hydroxide');
  }

  // Produce 1:1 NaCl and H2O while preserving carrier solution volume
  const totalReleasedVol = hclReleasedVol + naohReleasedVol;
  const formedWaterVol = Math.min(totalReleasedVol, reactedMoles * WATER_MOLAR_MASS);
  const naclCarrierVol = Math.max(0, totalReleasedVol - formedWaterVol);

  const naclDef = getChemicalDefinition('sodium-chloride');
  if (compMap.has('sodium-chloride')) {
    const existingNacl = compMap.get('sodium-chloride');
    existingNacl.moles += reactedMoles;
    existingNacl.volume += naclCarrierVol;
  } else {
    compMap.set('sodium-chloride', {
      chemicalId: naclDef.id,
      name: naclDef.name,
      formula: naclDef.formula,
      volume: naclCarrierVol,
      concentration: 0,
      moles: reactedMoles,
      color: naclDef.color,
      hexColor: naclDef.hexColor,
      isAcid: naclDef.isAcid,
      isBase: naclDef.isBase,
      isIndicator: naclDef.isIndicator,
    });
  }

  const waterDef = getChemicalDefinition('water');
  if (compMap.has('water')) {
    const existingWater = compMap.get('water');
    existingWater.moles += reactedMoles;
    existingWater.volume += formedWaterVol;
  } else {
    compMap.set('water', {
      chemicalId: waterDef.id,
      name: waterDef.name,
      formula: waterDef.formula,
      volume: formedWaterVol,
      concentration: 0,
      moles: reactedMoles,
      color: waterDef.color,
      hexColor: waterDef.hexColor,
      isAcid: waterDef.isAcid,
      isBase: waterDef.isBase,
      isIndicator: waterDef.isIndicator,
    });
  }

  return {
    components: Array.from(compMap.values()),
    reactedMoles,
  };
}

/**
 * Calculates resultant pH, color, and temperature from combined chemical components.
 *
 * @param {Array} components - Array of { chemicalId, formula, volume, concentration, moles, isAcid, isBase, isIndicator }
 * @param {number} totalVolume - Total volume in mL
 * @param {number} avgTemp - Baseline blended temperature in °C
 * @param {Object} [options] - Optional step reaction metadata ({ reactedMoles })
 * @returns {Object} { ph, color, hexColor, temperature, exactTemperature, name, hasIndicator, isNeutralized }
 */
export function evaluateSolutionProperties(components, totalVolume, avgTemp = 24.0, options = {}) {
  if (!components || components.length === 0 || totalVolume <= 0) {
    return {
      ph: 7.0,
      color: 'clear',
      hexColor: '#f1f5f9',
      temperature: 24.0,
      exactTemperature: 24.0,
      name: 'Empty Container',
      description: 'Clean vessel with no contents.',
      hasIndicator: false,
      isNeutralized: false,
    };
  }

  // 1. Calculate remaining unreacted acid/base moles
  let acidMoles = 0;
  let baseMoles = 0;
  let hasIndicator = false;
  let hasNaCl = false;
  let hasHCl = false;
  let hasNaOH = false;
  let primarySolute = null;
  let maxSoluteMoles = -1;

  for (const comp of components) {
    const moles = Math.max(0, comp.moles || 0);
    if (comp.isAcid) {
      acidMoles += moles;
    } else if (comp.isBase) {
      baseMoles += moles;
    }

    if (comp.chemicalId === 'sodium-chloride' && moles > MOLE_EPSILON) {
      hasNaCl = true;
    } else if (comp.chemicalId === 'hydrochloric-acid' && moles > MOLE_EPSILON) {
      hasHCl = true;
    } else if (comp.chemicalId === 'sodium-hydroxide' && moles > MOLE_EPSILON) {
      hasNaOH = true;
    }

    if (comp.isIndicator || comp.chemicalId === 'phenolphthalein') {
      hasIndicator = true;
    }

    // Determine primary named solute (ignore water if other chemicals present)
    if (comp.chemicalId !== 'water' && moles > maxSoluteMoles) {
      maxSoluteMoles = moles;
      primarySolute = comp;
    }
  }

  if (!primarySolute) {
    primarySolute = components[0];
  }

  // 2. Compute pH from remaining unreacted strong acid / strong base moles
  const netAcidMoles = acidMoles - baseMoles;
  const volumeInLiters = totalVolume / 1000;
  let calculatedPh;

  if (Math.abs(netAcidMoles) < 1e-7) {
    // Equivalence / neutral solution (pH 7.0 at 25°C for ideal strong acid–strong base)
    calculatedPh = 7.0;
  } else if (netAcidMoles > 0) {
    // Acid in excess
    const excessHConc = netAcidMoles / volumeInLiters;
    calculatedPh = Math.max(0.5, Math.min(6.9, -Math.log10(excessHConc)));
  } else {
    // Base in excess
    const excessOHConc = Math.abs(netAcidMoles) / volumeInLiters;
    const pOH = Math.max(0.5, Math.min(6.9, -Math.log10(excessOHConc)));
    calculatedPh = Math.min(13.8, Math.max(7.1, 14.0 - pOH));
  }

  // Round pH to 2 decimal places
  calculatedPh = Math.round(calculatedPh * 100) / 100;

  // Apply enthalpy of neutralization ONLY for moles newly reacted during this mixing step
  const newlyReactedMoles = Math.max(0, Number(options?.reactedMoles) || 0);
  const heatOfNeutralization =
    newlyReactedMoles > 0
      ? Math.min(6.0, (newlyReactedMoles * 57.3 * 1000) / (totalVolume * 4.184))
      : 0;

  const exactTemperature = avgTemp + heatOfNeutralization;
  const finalTemp = Math.round(exactTemperature * 10) / 10;

  // 3. Solution Color Computation
  let finalColor;
  let finalHex;

  // Rule A: Phenolphthalein Indicator Transition
  // Turns pink/magenta when pH >= 8.2 (endpoint of acid-base titration!)
  if (hasIndicator) {
    if (calculatedPh >= 8.2) {
      finalColor = 'pink';
      finalHex = '#ec4899'; // Vivid titration endpoint pink
    } else {
      finalColor = 'clear';
      finalHex = '#fdf2f8'; // Faint indicator clear
    }
  } else {
    // Rule B: Weighted Optical Color Blending for colored salt solutions (CuSO4, NiSO4, FeCl3, KMnO4)
    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let totalWeight = 0;
    let hasColoredSolute = false;

    for (const comp of components) {
      if (comp.hexColor && comp.chemicalId !== 'water' && comp.color !== 'clear') {
        hasColoredSolute = true;
        const rgb = hexToRgb(comp.hexColor);
        const weight = comp.volume || 1;
        totalR += rgb.r * weight;
        totalG += rgb.g * weight;
        totalB += rgb.b * weight;
        totalWeight += weight;
      }
    }

    if (hasColoredSolute && totalWeight > 0) {
      const blendedR = totalR / totalWeight;
      const blendedG = totalG / totalWeight;
      const blendedB = totalB / totalWeight;

      // Dilution factor based on water content
      const dilutionRatio = Math.min(1, totalWeight / totalVolume);
      // Interpolate with clear water (#f0f9ff)
      const waterRgb = hexToRgb('#f0f9ff');
      const finalR = blendedR * dilutionRatio + waterRgb.r * (1 - dilutionRatio);
      const finalG = blendedG * dilutionRatio + waterRgb.g * (1 - dilutionRatio);
      const finalB = blendedB * dilutionRatio + waterRgb.b * (1 - dilutionRatio);

      finalHex = rgbToHex(finalR, finalG, finalB);
      finalColor = primarySolute ? primarySolute.color : 'colored';
    } else {
      finalHex = '#f1f5f9';
      finalColor = 'clear';
    }
  }

  // 4. Determine clean display name for mixture
  const isEquivalenceNeutralized = hasNaCl && !hasHCl && !hasNaOH && Math.abs(netAcidMoles) < 1e-4;
  let solutionName;
  if (components.length === 1) {
    solutionName = components[0].name;
  } else if (hasIndicator && (components.some((c) => c.isAcid || c.isBase) || hasNaCl)) {
    if (calculatedPh >= 8.2) {
      solutionName = 'Alkaline Solution + Phenolphthalein (Pink)';
    } else if (isEquivalenceNeutralized) {
      solutionName = 'Neutralized Sodium Chloride Solution (NaCl) + Phenolphthalein';
    } else {
      solutionName = 'Acidic Solution + Phenolphthalein';
    }
  } else if (hasNaCl || (hasHCl && hasNaOH)) {
    if (Math.abs(netAcidMoles) < 1e-4) {
      solutionName = 'Neutralized Sodium Chloride Solution (NaCl)';
    } else if (netAcidMoles > 0) {
      solutionName = 'Partially Neutralized Acid Solution (HCl + NaCl)';
    } else {
      solutionName = 'Partially Neutralized Base Solution (NaOH + NaCl)';
    }
  } else {
    solutionName = `${primarySolute.name} Solution`;
  }

  return {
    ph: calculatedPh,
    color: finalColor,
    hexColor: finalHex,
    temperature: finalTemp,
    exactTemperature,
    name: solutionName,
    hasIndicator,
    isNeutralized: isEquivalenceNeutralized || (acidMoles > 0 && baseMoles > 0 && Math.abs(netAcidMoles) < 1e-4),
  };
}
