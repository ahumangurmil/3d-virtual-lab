/**
 * Chemistry Reactions and Physical-Chemical Property Calculation Rules.
 * Pure calculations decoupled from Three.js and React.
 * Handles:
 * - Indicator color transitions (Phenolphthalein colorless in acid/neutral, pink in alkaline)
 * - Acid-base neutralization equilibrium
 * - Color mixing and dilution
 * - Thermal equilibration and neutralization heat
 */

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
 * Calculates resultant pH, color, and temperature from combined chemical components.
 * 
 * @param {Array} components - Array of { chemicalId, formula, volume, concentration, moles, isAcid, isBase, isIndicator }
 * @param {number} totalVolume - Total volume in mL
 * @param {number} avgTemp - Baseline blended temperature in °C
 * @returns {Object} { ph, color, hexColor, temperature, name, description }
 */
export function evaluateSolutionProperties(components, totalVolume, avgTemp = 24.0) {
  if (!components || components.length === 0 || totalVolume <= 0) {
    return {
      ph: 7.0,
      color: 'clear',
      hexColor: '#f1f5f9',
      temperature: 24.0,
      name: 'Empty Container',
      description: 'Clean vessel with no contents.',
    };
  }

  // 1. Calculate acid/base moles
  let acidMoles = 0;
  let baseMoles = 0;
  let hasIndicator = false;
  let primarySolute = null;
  let maxSoluteMoles = -1;

  for (const comp of components) {
    if (comp.isAcid) {
      acidMoles += comp.moles || 0;
    } else if (comp.isBase) {
      baseMoles += comp.moles || 0;
    }

    if (comp.isIndicator || comp.chemicalId === 'phenolphthalein') {
      hasIndicator = true;
    }

    // Determine primary named solute (ignore water if other chemicals present)
    if (comp.chemicalId !== 'water' && (comp.moles || 0) > maxSoluteMoles) {
      maxSoluteMoles = comp.moles || 0;
      primarySolute = comp;
    }
  }

  if (!primarySolute) {
    primarySolute = components[0];
  }

  // 2. Compute pH after neutralization
  // Strong monoprotic acid (HCl) + strong base (NaOH) reaction:
  // H+ + OH- -> H2O
  const netAcidMoles = acidMoles - baseMoles;
  const volumeInLiters = totalVolume / 1000;
  let calculatedPh;
  let heatOfNeutralization = 0;

  if (Math.abs(netAcidMoles) < 1e-7) {
    // Neutralized (or neutral salts only)
    calculatedPh = 7.0;
    if (acidMoles > 0 && baseMoles > 0) {
      // Exothermic neutralization occurred
      const reactedMoles = Math.min(acidMoles, baseMoles);
      heatOfNeutralization = Math.min(6.0, (reactedMoles * 57.3 * 1000) / (totalVolume * 4.184)); // Q = mcΔT
    }
  } else if (netAcidMoles > 0) {
    // Acid in excess
    const excessHConc = netAcidMoles / volumeInLiters;
    calculatedPh = Math.max(0.5, Math.min(6.9, -Math.log10(excessHConc)));
    if (baseMoles > 0) {
      const reactedMoles = baseMoles;
      heatOfNeutralization = Math.min(6.0, (reactedMoles * 57.3 * 1000) / (totalVolume * 4.184));
    }
  } else {
    // Base in excess
    const excessOHConc = Math.abs(netAcidMoles) / volumeInLiters;
    const pOH = Math.max(0.5, Math.min(6.9, -Math.log10(excessOHConc)));
    calculatedPh = Math.min(13.8, Math.max(7.1, 14.0 - pOH));
    if (acidMoles > 0) {
      const reactedMoles = acidMoles;
      heatOfNeutralization = Math.min(6.0, (reactedMoles * 57.3 * 1000) / (totalVolume * 4.184));
    }
  }

  // Round pH to 2 decimal places
  calculatedPh = Math.round(calculatedPh * 100) / 100;
  const finalTemp = Math.round((avgTemp + heatOfNeutralization) * 10) / 10;

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
  let solutionName;
  if (components.length === 1) {
    solutionName = components[0].name;
  } else if (hasIndicator && components.some((c) => c.isAcid || c.isBase)) {
    if (calculatedPh >= 8.2) {
      solutionName = 'Alkaline Solution + Phenolphthalein (Pink)';
    } else {
      solutionName = 'Acidic Solution + Phenolphthalein';
    }
  } else if (acidMoles > 0 && baseMoles > 0) {
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
    name: solutionName,
    hasIndicator,
    isNeutralized: acidMoles > 0 && baseMoles > 0 && Math.abs(netAcidMoles) < 1e-4,
  };
}
