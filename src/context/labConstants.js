import {
  createInitialSolution,
  createEmptySolution,
  applySolutionToApparatus,
} from '../chemistry/chemistryEngine';

export const WORKSTATIONS = [
  {
    id: 'station-teacher',
    stationNumber: 'DEMO',
    name: 'Teacher Demonstration Workstation',
    type: 'teacher',
    position: [0, 0, -8.0],
    rotation: [0, 0, 0],
    width: 3.4,
    depth: 1.3,
    height: 0.9,
    description: 'Central demonstration bench with direct line of sight to all student workstations, blackboard, and periodic chart.',
    cameraFocus: {
      position: [0, 2.2, -6.0],
      target: [0, 1.0, -8.0],
    },
  },
  // Row 1 (Front Student Row)
  {
    id: 'station-1',
    stationNumber: 1,
    name: 'Student Workstation 1',
    type: 'student',
    position: [-4.5, 0, -3.2],
    rotation: [0, 0, 0],
    width: 2.8,
    depth: 1.3,
    height: 0.9,
    description: 'Front-left student team workstation with dedicated sink, gas taps, and Class 11–12 practical apparatus.',
    cameraFocus: {
      position: [-4.5, 2.1, -1.4],
      target: [-4.5, 1.0, -3.2],
    },
  },
  {
    id: 'station-2',
    stationNumber: 2,
    name: 'Student Workstation 2',
    type: 'student',
    position: [4.5, 0, -3.2],
    rotation: [0, 0, 0],
    width: 2.8,
    depth: 1.3,
    height: 0.9,
    description: 'Front-right student team workstation with direct view of whiteboard and teacher demonstration table.',
    cameraFocus: {
      position: [4.5, 2.1, -1.4],
      target: [4.5, 1.0, -3.2],
    },
  },
  // Row 2 (Middle Student Row)
  {
    id: 'station-3',
    stationNumber: 3,
    name: 'Student Workstation 3',
    type: 'student',
    position: [-4.5, 0, 1.4],
    rotation: [0, 0, 0],
    width: 2.8,
    depth: 1.3,
    height: 0.9,
    description: 'Middle-left student team workstation with quick access to the glassware and reagent cabinets.',
    cameraFocus: {
      position: [-4.5, 2.1, 3.2],
      target: [-4.5, 1.0, 1.4],
    },
  },
  {
    id: 'station-4',
    stationNumber: 4,
    name: 'Student Workstation 4',
    type: 'student',
    position: [4.5, 0, 1.4],
    rotation: [0, 0, 0],
    width: 2.8,
    depth: 1.3,
    height: 0.9,
    description: 'Middle-right student team workstation beside analytical balance weighing benches and daylight windows.',
    cameraFocus: {
      position: [4.5, 2.1, 3.2],
      target: [4.5, 1.0, 1.4],
    },
  },
  // Row 3 (Back Student Row)
  {
    id: 'station-5',
    stationNumber: 5,
    name: 'Student Workstation 5',
    type: 'student',
    position: [-4.5, 0, 6.0],
    rotation: [0, 0, 0],
    width: 2.8,
    depth: 1.3,
    height: 0.9,
    description: 'Back-left student team workstation with adjacent walking path to emergency shower and reagent storage.',
    cameraFocus: {
      position: [-4.5, 2.1, 7.8],
      target: [-4.5, 1.0, 6.0],
    },
  },
  {
    id: 'station-6',
    stationNumber: 6,
    name: 'Student Workstation 6',
    type: 'student',
    position: [4.5, 0, 6.0],
    rotation: [0, 0, 0],
    width: 2.8,
    depth: 1.3,
    height: 0.9,
    description: 'Back-right student team workstation with generous clearance to chemical waste and broken glass disposal.',
    cameraFocus: {
      position: [4.5, 2.1, 7.8],
      target: [4.5, 1.0, 6.0],
    },
  },
];

/**
 * Standard Modular Apparatus Set for Workstations.
 * Apparatus positions are stored as world positions for raycasting and camera targeting,
 * with workstationId tags for grouping.
 */
function createStationApparatus(station) {
  const [wx, , wz] = station.position;
  const isTeacher = station.type === 'teacher';
  const prefix = station.id;

  const items = [
    applySolutionToApparatus(
      {
        id: `${prefix}-beaker-1`,
        workstationId: station.id,
        stationName: station.name,
        type: isTeacher ? 'beaker_500' : 'beaker_250',
        name: isTeacher ? 'Demo 500 mL Beaker' : `${station.name} HCl Beaker (0.1 M)`,
        position: [wx - 0.55, 0.92, wz + 0.15],
        rotation: [0, 0.2, 0],
        capacity: isTeacher ? 500 : 250,
        interactable: true,
        isPickable: true,
        isHeld: false,
        heldBy: null,
        currentSurface: station.name,
        description: 'Flat-bottomed cylindrical borosilicate glass vessel containing 0.100 M Hydrochloric Acid (HCl) analyte solution.',
        safetyNotes: 'Corrosive acid. Wear safety goggles and gloves when handling.',
      },
      createInitialSolution({
        chemicalId: isTeacher ? 'copper-sulfate' : 'hydrochloric-acid',
        volume: isTeacher ? 300 : 100,
        concentration: isTeacher ? 0.5 : 0.1,
        temperature: 24,
      })
    ),
    applySolutionToApparatus(
      {
        id: `${prefix}-beaker-naoh`,
        workstationId: station.id,
        stationName: station.name,
        type: 'beaker_250',
        name: isTeacher ? 'Demo NaOH Supply' : `${station.name} NaOH Supply (0.1 M)`,
        position: [wx - 0.75, 0.92, wz + 0.15],
        rotation: [0, -0.15, 0],
        capacity: 250,
        interactable: true,
        isPickable: true,
        isHeld: false,
        heldBy: null,
        currentSurface: station.name,
        description: 'Borosilicate vessel containing standardized 0.100 M Sodium Hydroxide (NaOH) secondary standard titrant solution for filling the burette.',
        safetyNotes: 'Caustic alkali base. Causes chemical burns. Rinse immediately if contact occurs.',
      },
      createInitialSolution({
        chemicalId: 'sodium-hydroxide',
        volume: 150,
        concentration: 0.1,
        temperature: 24,
      })
    ),
    applySolutionToApparatus(
      {
        id: `${prefix}-flask-1`,
        workstationId: station.id,
        stationName: station.name,
        type: 'conical_flask_250',
        name: isTeacher ? 'Demo Conical Flask (Erlenmeyer)' : `${station.name} Conical Flask`,
        position: [wx - 0.15, 0.92, wz + 0.2],
        rotation: [0, 0.1, 0],
        capacity: 250,
        interactable: true,
        isPickable: true,
        isHeld: false,
        heldBy: null,
        currentSurface: station.name,
        description: 'Cone-shaped flask with a flat base and narrow neck. Specially designed for acid-base titrations; the tapered neck allows vigorous swirling without spilling.',
        safetyNotes: 'Ensure neck stays clear. Do not seal tightly with stopper if heating.',
      },
      isTeacher
        ? createInitialSolution({
            chemicalId: 'water',
            volume: 120,
            concentration: 55.5,
            temperature: 24,
          })
        : createEmptySolution()
    ),
    applySolutionToApparatus(
      {
        id: `${prefix}-pipette-1`,
        workstationId: station.id,
        stationName: station.name,
        type: 'pipette_25',
        name: isTeacher ? 'Demo 25 mL Pipette' : `${station.name} 25 mL Pipette`,
        position: [wx - 0.35, 0.92, wz - 0.15],
        rotation: [0, 0, 0],
        capacity: 25,
        interactable: true,
        isPickable: true,
        isHeld: false,
        heldBy: null,
        currentSurface: station.name,
        description: 'Class A volumetric transfer pipette calibrated to deliver 25.0 mL of liquid at 20 °C.',
        safetyNotes: 'Never pipette by mouth. Always use a pipette filler bulb.',
      },
      createEmptySolution()
    ),
    applySolutionToApparatus(
      {
        id: `${prefix}-indicator-1`,
        workstationId: station.id,
        stationName: station.name,
        type: 'indicator_bottle',
        name: isTeacher ? 'Demo Phenolphthalein Bottle' : `${station.name} Phenolphthalein Indicator`,
        position: [wx + 0.12, 0.92, wz - 0.18],
        rotation: [0, 0.3, 0],
        capacity: 50,
        interactable: true,
        isPickable: true,
        isHeld: false,
        heldBy: null,
        currentSurface: station.name,
        description: 'Amber glass reagent bottle fitted with dropper pipette containing phenolphthalein indicator solution.',
        safetyNotes: 'Flammable ethanol solvent base. Keep cap secured when not in use.',
      },
      createInitialSolution({
        chemicalId: 'phenolphthalein',
        volume: 40,
        concentration: 0.01,
        temperature: 24,
      })
    ),
    applySolutionToApparatus(
      {
        id: `${prefix}-burette-1`,
        workstationId: station.id,
        stationName: station.name,
        type: 'burette_50',
        name: isTeacher ? 'Demo 50 mL Titration Burette' : `${station.name} Titration Burette`,
        position: [wx - 0.95, 0.92, wz - 0.05],
        rotation: [0, 0, 0],
        capacity: 50,
        interactable: true,
        isPickable: true,
        isHeld: false,
        heldBy: null,
        currentSurface: station.name,
        description: 'High-precision volumetric glassware mounted on a retort stand for quantitative volumetric titrations. Delivers titrant drop by drop through a PTFE stopcock valve.',
        safetyNotes: 'Ensure stopcock is firmly seated. Rinse with titrant before filling to prevent dilution errors.',
      },
      isTeacher
        ? createInitialSolution({
            chemicalId: 'sodium-hydroxide',
            volume: 38,
            concentration: 0.1,
            temperature: 24,
          })
        : createEmptySolution()
    ),
    applySolutionToApparatus(
      {
        id: `${prefix}-test-tube-1`,
        workstationId: station.id,
        stationName: station.name,
        type: 'test_tube',
        name: isTeacher ? 'Demo Practical Test Tube' : `${station.name} Test Tube`,
        position: [wx + 0.25, 0.92, wz + 0.22],
        rotation: [0, 0, 0],
        capacity: 25,
        interactable: true,
        isPickable: true,
        isHeld: false,
        heldBy: null,
        currentSurface: station.name,
        description: 'Slender borosilicate glass cylinder with rounded base and flared lip, held in a stable bench stand.',
        safetyNotes: 'Never heat a test tube while pointed at anyone. Use test tube holder when heating over flame.',
      },
      createInitialSolution({
        chemicalId: 'nickel-sulfate',
        volume: 15,
        concentration: 0.5,
        temperature: 24,
      })
    ),
    {
      id: `${prefix}-rack-1`,
      workstationId: station.id,
      stationName: station.name,
      type: 'test_tube_rack',
      name: isTeacher ? 'Demo Test Tube Rack' : `${station.name} Test Tube Rack`,
      position: [wx + 0.78, 0.92, wz - 0.05],
      rotation: [0, -0.15, 0],
      capacity: 'Holds 6 test tubes',
      interactable: true,
      isPickable: true,
      isHeld: false,
      heldBy: null,
      currentSurface: station.name,
      liquid: null,
      tubes: [
        { id: `${prefix}-tt-1`, label: 'T1', color: '#0284c7', volumeRatio: 0.6, name: 'CuSO₄ (Blue)' },
        { id: `${prefix}-tt-2`, label: 'T2', color: '#9333ea', volumeRatio: 0.45, name: 'KMnO₄ (Purple)' },
        { id: `${prefix}-tt-3`, label: 'T3', color: '#16a34a', volumeRatio: 0.7, name: 'NiSO₄ (Green)' },
        { id: `${prefix}-tt-4`, label: 'T4', color: '#eab308', volumeRatio: 0.5, name: 'K₂CrO₄ (Yellow)' },
        { id: `${prefix}-tt-5`, label: 'T5', color: '#ea580c', volumeRatio: 0.6, name: 'Fe³⁺ (Orange)' },
        { id: `${prefix}-tt-6`, label: 'T6', color: '#bae6fd', volumeRatio: 0.35, name: 'Water (Clear)' },
      ],
      description: 'Holds test tubes safely upright for observing color changes, precipitates, and chemical reactions.',
      safetyNotes: 'Never point a test tube mouth at yourself or a partner during an experiment.',
    },
    {
      id: `${prefix}-burner-1`,
      workstationId: station.id,
      stationName: station.name,
      type: 'bunsen_burner',
      name: isTeacher ? 'Demo Bunsen Burner' : `${station.name} Bunsen Burner`,
      position: [wx - 0.05, 0.92, wz - 0.35],
      rotation: [0, 0.5, 0],
      capacity: 'Adjustable gas flame source',
      interactable: true,
      isPickable: false,
      isHeld: false,
      heldBy: null,
      currentSurface: station.name,
      liquid: null,
      isIgnited: false,
      description: 'Provides clean, adjustable flame for boiling solutions, sterilizing wire loops, and flame tests.',
      safetyNotes: 'Tie back hair and wear safety goggles. Keep flammable solvents away from open flame.',
    },
  ];

  if (isTeacher) {
    items.push(
      applySolutionToApparatus(
        {
          id: `${prefix}-beaker-2`,
          workstationId: station.id,
          stationName: station.name,
          type: 'beaker_500',
          name: 'Teacher 500 mL Reagent Beaker',
          position: [wx - 1.15, 0.92, wz - 0.1],
          rotation: [0, -0.4, 0],
          capacity: 500,
          interactable: true,
          isPickable: true,
          isHeld: false,
          heldBy: null,
          currentSurface: station.name,
          description: 'Used for teacher preparation and holding larger solution volumes. Wide base provides stability.',
          safetyNotes: 'Always keep away from bench edges and carry with two hands when filled.',
        },
        createInitialSolution({
          chemicalId: 'iron-chloride',
          volume: 320,
          concentration: 0.2,
          temperature: 23,
        })
      )
    );
  }

  return items;
}

// Generate apparatus for all workstations in the classroom
export const INITIAL_APPARATUS = WORKSTATIONS.flatMap((ws) => createStationApparatus(ws));

export const CAMERA_PRESETS = {
  classroom: {
    name: 'Classroom Overview',
    position: [0, 10.5, 14.5],
    target: [0, 1.2, -1.0],
  },
  teacher: {
    name: 'Teacher Demo',
    position: [0, 2.2, -5.8],
    target: [0, 1.0, -8.0],
  },
  workbench: {
    name: 'Student Station 1',
    position: [-4.5, 2.1, -1.4],
    target: [-4.5, 1.0, -3.2],
  },
  overview: {
    name: 'Classroom Wing',
    position: [8.5, 5.5, 8.5],
    target: [0, 1.1, -1.0],
  },
  closeup: {
    name: 'Equipment Focus',
    position: [-0.1, 1.35, 0.75],
    target: [-0.1, 1.0, 0],
  },
};
