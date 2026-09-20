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
    {
      id: `${prefix}-beaker-1`,
      workstationId: station.id,
      stationName: station.name,
      type: isTeacher ? 'beaker_500' : 'beaker_250',
      name: isTeacher ? 'Demo 500 mL Beaker' : `${station.name} Beaker`,
      position: [wx - 0.55, 0.92, wz + 0.15],
      rotation: [0, 0.2, 0],
      capacity: isTeacher ? '500 mL' : '250 mL',
      isPickable: true,
      isHeld: false,
      heldBy: null,
      liquid: {
        volume: isTeacher ? 300 : 120,
        maxVolume: isTeacher ? 500 : 250,
        color: '#0284c7', // Aqueous copper sulfate solution
        name: 'Copper(II) Sulfate Solution',
        ph: 4.5,
        temperature: 24,
      },
      description: 'Used to hold, mix, and roughly measure liquids. Features pouring spout and graduation lines.',
      safetyNotes: 'Check for cracks before use. Use heat-resistant tongs or gloves when warm.',
    },
    {
      id: `${prefix}-flask-1`,
      workstationId: station.id,
      stationName: station.name,
      type: 'conical_flask_250',
      name: isTeacher ? 'Demo Conical Flask (Erlenmeyer)' : `${station.name} Conical Flask`,
      position: [wx - 0.15, 0.92, wz + 0.2],
      rotation: [0, 0.1, 0],
      capacity: '250 mL',
      isPickable: true,
      isHeld: false,
      heldBy: null,
      liquid: {
        volume: 100,
        maxVolume: 250,
        color: '#ec4899', // Pink phenolphthalein indicator endpoint
        name: 'Neutralized Solution (Phenolphthalein)',
        ph: 8.3,
        temperature: 24,
      },
      description: 'Conical shape allows liquids to be swirled thoroughly during titrations without risk of spilling.',
      safetyNotes: 'Ensure neck stays clear. Do not seal tightly with stopper if heating.',
    },
    {
      id: `${prefix}-burette-1`,
      workstationId: station.id,
      stationName: station.name,
      type: 'burette_50',
      name: isTeacher ? 'Demo 50 mL Titration Burette' : `${station.name} Titration Burette`,
      position: [wx - 0.95, 0.92, wz - 0.05],
      rotation: [0, 0, 0],
      capacity: '50 mL (0.1 mL graduations)',
      isPickable: true,
      isHeld: false,
      heldBy: null,
      liquid: {
        volume: 38,
        maxVolume: 50,
        color: '#38bdf8',
        name: '0.1 M Standard NaOH Solution',
        ph: 13.0,
        temperature: 24,
      },
      description: 'High-precision volumetric glassware mounted on retort stand for titrations. Delivers liquid drop by drop with PTFE stopcock valve.',
      safetyNotes: 'Ensure stopcock is firmly seated. Rinse with titrant before filling to prevent dilution errors.',
    },
    {
      id: `${prefix}-test-tube-1`,
      workstationId: station.id,
      stationName: station.name,
      type: 'test_tube',
      name: isTeacher ? 'Demo Practical Test Tube' : `${station.name} Test Tube`,
      position: [wx + 0.25, 0.92, wz + 0.22],
      rotation: [0, 0, 0],
      capacity: '25 mL (16 x 150 mm)',
      isPickable: true,
      isHeld: false,
      heldBy: null,
      liquid: {
        volume: 15,
        maxVolume: 25,
        color: '#16a34a', // Nickel sulfate green
        name: 'Nickel(II) Sulfate Solution',
        ph: 6.2,
        temperature: 24,
      },
      description: 'Borosilicate glass tube with flared rim, rounded bottom, and support stand. Ideal for qualitative salt analysis and color tests.',
      safetyNotes: 'Never heat a test tube while pointed at anyone. Use test tube holder when heating over flame.',
    },
    {
      id: `${prefix}-rack-1`,
      workstationId: station.id,
      stationName: station.name,
      type: 'test_tube_rack',
      name: isTeacher ? 'Demo Test Tube Rack' : `${station.name} Test Tube Rack`,
      position: [wx + 0.78, 0.92, wz - 0.05],
      rotation: [0, -0.15, 0],
      capacity: 'Holds 6 test tubes',
      isPickable: true,
      isHeld: false,
      heldBy: null,
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
      isPickable: false,
      isHeld: false,
      heldBy: null,
      liquid: null,
      isIgnited: false,
      description: 'Provides clean, adjustable flame for boiling solutions, sterilizing wire loops, and flame tests.',
      safetyNotes: 'Tie back hair and wear safety goggles. Keep flammable solvents away from open flame.',
    },
  ];

  if (isTeacher) {
    items.push({
      id: `${prefix}-beaker-2`,
      workstationId: station.id,
      stationName: station.name,
      type: 'beaker_500',
      name: 'Teacher 500 mL Reagent Beaker',
      position: [wx - 1.15, 0.92, wz - 0.1],
      rotation: [0, -0.4, 0],
      capacity: '500 mL',
      liquid: {
        volume: 320,
        maxVolume: 500,
        color: '#f59e0b',
        name: 'Iron(III) Solution (Dilute)',
        ph: 3.2,
        temperature: 23,
      },
      description: 'Used for teacher preparation and holding larger solution volumes. Wide base provides stability.',
      safetyNotes: 'Always keep away from bench edges and carry with two hands when filled.',
    });
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
