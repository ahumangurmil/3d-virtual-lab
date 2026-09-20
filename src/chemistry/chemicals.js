/**
 * Chemistry Chemical Definitions Registry.
 * Pure data model decoupled from Three.js, React, and rendering pipelines.
 * Suitable for client-side calculation and future multiplayer state synchronization.
 */

export const CHEMICAL_STATES = {
  LIQUID: 'liquid',
  SOLID: 'solid',
  GAS: 'gas',
  AQUEOUS: 'aqueous',
};

/**
 * Standard Reagents Database for Class 11-12 & Introductory Chemistry Labs.
 */
export const CHEMICAL_DEFINITIONS = {
  'hydrochloric-acid': {
    id: 'hydrochloric-acid',
    name: 'Hydrochloric Acid',
    formula: 'HCl',
    defaultConcentration: 0.1, // 0.1 M
    unit: 'M',
    state: CHEMICAL_STATES.AQUEOUS,
    color: 'clear',
    hexColor: '#f1f5f9', // Translucent clear in 3D
    ph: 1.0,
    density: 1.01, // g/mL
    molarMass: 36.46, // g/mol
    isAcid: true,
    isBase: false,
    isIndicator: false,
    description: 'Strong monoprotic mineral acid, fully dissociated in aqueous solution.',
    safetyHazard: 'Corrosive. Causes eye and skin irritation. Handle with care.',
  },

  'sodium-hydroxide': {
    id: 'sodium-hydroxide',
    name: 'Sodium Hydroxide',
    formula: 'NaOH',
    defaultConcentration: 0.1, // 0.1 M
    unit: 'M',
    state: CHEMICAL_STATES.AQUEOUS,
    color: 'clear',
    hexColor: '#f1f5f9', // Translucent clear in 3D
    ph: 13.0,
    density: 1.02, // g/mL
    molarMass: 40.0, // g/mol
    isAcid: false,
    isBase: true,
    isIndicator: false,
    description: 'Strong alkaline base, standard volumetric titrant in neutralization experiments.',
    safetyHazard: 'Caustic. Eye protection mandatory.',
  },

  'phenolphthalein': {
    id: 'phenolphthalein',
    name: 'Phenolphthalein Indicator',
    formula: 'C₂₀H₁₄O₄',
    defaultConcentration: 0.01, // 0.01 M indicator solution
    unit: 'M',
    state: CHEMICAL_STATES.AQUEOUS,
    color: 'clear',
    hexColor: '#fdf2f8', // Clear in acidic/neutral, vivid magenta/pink in alkaline (pH >= 8.2)
    ph: 7.0,
    density: 0.95,
    molarMass: 318.32,
    isAcid: false,
    isBase: false,
    isIndicator: true,
    indicatorRange: { minPh: 8.2, maxPh: 10.0, acidColor: '#fdf2f8', baseColor: '#ec4899' },
    description: 'Acid-base indicator that remains colorless in acidic/neutral pH and turns bright magenta-pink above pH 8.2.',
    safetyHazard: 'Flammable solvent base. Keep away from flames.',
  },

  'water': {
    id: 'water',
    name: 'Distilled Water',
    formula: 'H₂O',
    defaultConcentration: 55.5, // 55.5 M
    unit: 'M',
    state: CHEMICAL_STATES.LIQUID,
    color: 'clear',
    hexColor: '#f0f9ff',
    ph: 7.0,
    density: 1.0,
    molarMass: 18.015,
    isAcid: false,
    isBase: false,
    isIndicator: false,
    description: 'High-purity deionized solvent used for standard dilutions and washing glassware.',
    safetyHazard: 'None. Safe solvent.',
  },

  'copper-sulfate': {
    id: 'copper-sulfate',
    name: 'Copper(II) Sulfate',
    formula: 'CuSO₄',
    defaultConcentration: 0.5,
    unit: 'M',
    state: CHEMICAL_STATES.AQUEOUS,
    color: 'blue',
    hexColor: '#0284c7',
    ph: 4.5,
    density: 1.05,
    molarMass: 159.61,
    isAcid: false,
    isBase: false,
    isIndicator: false,
    description: 'Characteristic azure-blue salt solution of copper ions.',
    safetyHazard: 'Harmful if swallowed. Toxic to aquatic organisms.',
  },

  'nickel-sulfate': {
    id: 'nickel-sulfate',
    name: 'Nickel(II) Sulfate',
    formula: 'NiSO₄',
    defaultConcentration: 0.5,
    unit: 'M',
    state: CHEMICAL_STATES.AQUEOUS,
    color: 'green',
    hexColor: '#16a34a',
    ph: 6.2,
    density: 1.04,
    molarMass: 154.75,
    isAcid: false,
    isBase: false,
    isIndicator: false,
    description: 'Emerald green transition metal solution.',
    safetyHazard: 'Skin sensitizer. Avoid contact.',
  },

  'iron-chloride': {
    id: 'iron-chloride',
    name: 'Iron(III) Chloride',
    formula: 'FeCl₃',
    defaultConcentration: 0.2,
    unit: 'M',
    state: CHEMICAL_STATES.AQUEOUS,
    color: 'amber',
    hexColor: '#ea580c',
    ph: 2.2,
    density: 1.03,
    molarMass: 162.2,
    isAcid: true,
    isBase: false,
    isIndicator: false,
    description: 'Amber yellow-orange ferric solution.',
    safetyHazard: 'Stains skin and glassware. Corrosive.',
  },

  'potassium-permanganate': {
    id: 'potassium-permanganate',
    name: 'Potassium Permanganate',
    formula: 'KMnO₄',
    defaultConcentration: 0.05,
    unit: 'M',
    state: CHEMICAL_STATES.AQUEOUS,
    color: 'purple',
    hexColor: '#9333ea',
    ph: 7.0,
    density: 1.02,
    molarMass: 158.03,
    isAcid: false,
    isBase: false,
    isIndicator: false,
    description: 'Deep purple oxidizing reagent for redox titration.',
    safetyHazard: 'Strong oxidizer. Can stain surfaces dark brown.',
  },
};

/**
 * Get definition by chemical ID.
 * Falls back to water if not found.
 */
export function getChemicalDefinition(chemicalId) {
  return CHEMICAL_DEFINITIONS[chemicalId] || CHEMICAL_DEFINITIONS['water'];
}

/**
 * Creates an initial chemical component state.
 */
export function createChemicalComponent(chemicalId, volume, customConcentration = null) {
  const def = getChemicalDefinition(chemicalId);
  const concentration = customConcentration !== null ? Number(customConcentration) : def.defaultConcentration;
  const vol = Math.max(0, Number(volume) || 0);
  const moles = (concentration * vol) / 1000; // moles = M * L

  return {
    chemicalId: def.id,
    name: def.name,
    formula: def.formula,
    volume: vol,
    concentration: concentration,
    moles: moles,
    color: def.color,
    hexColor: def.hexColor,
    isAcid: def.isAcid,
    isBase: def.isBase,
    isIndicator: def.isIndicator,
  };
}
