/**
 * Laboratory Placement Surfaces & Spatial Validation
 * Ensures laboratory equipment can only be placed on realistic, designated benchtops.
 */

import { WORKSTATIONS } from '../context/labConstants';

// Static laboratory work surfaces with physical bounds and surface heights
export const LAB_SURFACES = [
  // 1. Teacher Demonstration Table (Front)
  {
    id: 'surface-teacher',
    stationId: 'station-teacher',
    name: 'Teacher Demonstration Bench',
    type: 'teacher_bench',
    height: 0.92,
    xMin: -1.65,
    xMax: 1.65,
    zMin: -8.6,
    zMax: -7.4,
  },
  // 2. Student Workstations 1–6
  ...WORKSTATIONS.filter((ws) => ws.type === 'student').map((ws) => {
    const [wx, , wz] = ws.position;
    const halfW = ws.width / 2; // 2.8 / 2 = 1.4
    const halfD = ws.depth / 2; // 1.3 / 2 = 0.65
    return {
      id: `surface-${ws.id}`,
      stationId: ws.id,
      name: ws.name,
      type: 'student_bench',
      height: 0.92,
      // Margins to keep equipment safely inside table edges
      xMin: wx - halfW + 0.1,
      xMax: wx + halfW - 0.1,
      zMin: wz - halfD + 0.1,
      zMax: wz + halfD - 0.1,
    };
  }),
  // 3. Side Chemical Preparation Counter (West Wall)
  {
    id: 'surface-prep-table',
    stationId: 'side-prep',
    name: 'Chemical Preparation Counter',
    type: 'side_bench',
    height: 0.95,
    xMin: -10.3,
    xMax: -9.3,
    zMin: 5.6,
    zMax: 9.4,
  },
  // 4. Precision Analytical Balance Counter (East Wall)
  {
    id: 'surface-balance-table',
    stationId: 'side-balance',
    name: 'Analytical Balance Bench',
    type: 'side_bench',
    height: 0.95,
    xMin: 9.3,
    xMax: 10.3,
    zMin: 5.6,
    zMax: 9.4,
  },
];

/**
 * Validates whether a proposed world coordinate is valid for apparatus placement.
 * Checks surface boundaries, benchtop height, and clearance from other equipment.
 *
 * @param {[number, number, number]} targetPoint - Proposed [x, y, z] in world space
 * @param {object} heldItem - The apparatus being placed
 * @param {Array} apparatusList - All apparatus currently in the scene
 * @param {number} minClearance - Minimum radius between apparatus centers (default 0.16m)
 * @returns {{
 *   isValid: boolean,
 *   surfaceName: string,
 *   surfaceId: string,
 *   snappedPosition: [number, number, number],
 *   reason: string | null
 * }}
 */
export function validateApparatusPlacement(targetPoint, heldItem, apparatusList = [], minClearance = 0.16) {
  const [tx, , tz] = targetPoint;

  // 1. Check if the point rests on any valid laboratory bench surface
  const matchedSurface = LAB_SURFACES.find((surface) => {
    return tx >= surface.xMin && tx <= surface.xMax && tz >= surface.zMin && tz <= surface.zMax;
  });

  if (!matchedSurface) {
    return {
      isValid: false,
      surfaceName: 'Invalid Surface (Floor/Air)',
      surfaceId: null,
      snappedPosition: [tx, 0.92, tz],
      reason: 'Must be placed on a laboratory benchtop, not on the floor or in empty space.',
    };
  }

  const snappedPos = [
    Math.round(tx * 100) / 100,
    matchedSurface.height,
    Math.round(tz * 100) / 100,
  ];

  // 2. Check collision/clearance against other placed apparatus
  for (const other of apparatusList) {
    if (other.id === heldItem?.id || other.isHeld) continue;

    const [ox, , oz] = other.position;
    const distSq = (ox - snappedPos[0]) ** 2 + (oz - snappedPos[2]) ** 2;

    if (distSq < minClearance ** 2) {
      return {
        isValid: false,
        surfaceName: matchedSurface.name,
        surfaceId: matchedSurface.stationId,
        snappedPosition: snappedPos,
        reason: `Spot occupied: Too close to ${other.name || 'another apparatus'}.`,
      };
    }
  }

  // Valid placement on a clean bench surface
  return {
    isValid: true,
    surfaceName: matchedSurface.name,
    surfaceId: matchedSurface.stationId,
    snappedPosition: snappedPos,
    reason: null,
  };
}
