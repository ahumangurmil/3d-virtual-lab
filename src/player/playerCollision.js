/**
 * Laboratory Collision Detection System.
 * Prevents player avatar from walking through walls, laboratory benches,
 * and major fixed equipment while enabling smooth sliding along surfaces.
 */

export const PLAYER_RADIUS = 0.35;

export const ROOM_BOUNDS = {
  minX: -10.65,
  maxX: 10.65,
  minZ: -11.65,
  maxZ: 11.65,
};

// Fixed obstacles in the 22m x 24m Chemistry Classroom
export const LAB_OBSTACLES = [
  // 1. Teacher Demonstration Workstation
  {
    id: 'teacher-bench',
    name: 'Teacher Demonstration Bench',
    minX: -1.75,
    maxX: 1.75,
    minZ: -8.7,
    maxZ: -7.3,
  },

  // 2. Student Workstations (Row 1)
  {
    id: 'station-1',
    name: 'Student Station 1',
    minX: -5.95,
    maxX: -3.05,
    minZ: -3.9,
    maxZ: -2.5,
  },
  {
    id: 'station-2',
    name: 'Student Station 2',
    minX: 3.05,
    maxX: 5.95,
    minZ: -3.9,
    maxZ: -2.5,
  },

  // 3. Student Workstations (Row 2)
  {
    id: 'station-3',
    name: 'Student Station 3',
    minX: -5.95,
    maxX: -3.05,
    minZ: 0.7,
    maxZ: 2.1,
  },
  {
    id: 'station-4',
    name: 'Student Station 4',
    minX: 3.05,
    maxX: 5.95,
    minZ: 0.7,
    maxZ: 2.1,
  },

  // 4. Student Workstations (Row 3)
  {
    id: 'station-5',
    name: 'Student Station 5',
    minX: -5.95,
    maxX: -3.05,
    minZ: 5.3,
    maxZ: 6.7,
  },
  {
    id: 'station-6',
    name: 'Student Station 6',
    minX: 3.05,
    maxX: 5.95,
    minZ: 5.3,
    maxZ: 6.7,
  },

  // 5. Left Wall Equipment & Storage
  {
    id: 'glassware-cabinet',
    name: 'Glassware Storage Cabinet',
    minX: -11.0,
    maxX: -9.9,
    minZ: -2.2,
    maxZ: 2.2,
  },
  {
    id: 'safety-station',
    name: 'Emergency Shower & Eyewash',
    minX: -11.0,
    maxX: -9.8,
    minZ: -8.2,
    maxZ: -6.8,
  },
  {
    id: 'reagent-dispensary',
    name: 'Chemical Reagent Dispensary',
    minX: -11.0,
    maxX: -9.9,
    minZ: 4.1,
    maxZ: 6.9,
  },

  // 6. Right Wall Equipment & Storage
  {
    id: 'fume-hood',
    name: 'Laboratory Fume Hood',
    minX: 9.7,
    maxX: 11.0,
    minZ: -8.8,
    maxZ: -6.2,
  },
  {
    id: 'weighing-bench',
    name: 'Analytical Balance Bench',
    minX: 9.8,
    maxX: 11.0,
    minZ: -2.0,
    maxZ: 2.0,
  },
  {
    id: 'waste-disposal',
    name: 'Hazardous Waste & Disposal',
    minX: 7.6,
    maxX: 9.4,
    minZ: 9.8,
    maxZ: 11.2,
  },

  // 7. Rear Wall Facilities
  {
    id: 'student-cubbies',
    name: 'Student Bag Cubbies',
    minX: -6.75,
    maxX: -3.25,
    minZ: 11.2,
    maxZ: 12.0,
  },
  {
    id: 'lab-coat-racks',
    name: 'Lab Coat Racks',
    minX: 3.3,
    maxX: 6.7,
    minZ: 11.35,
    maxZ: 12.0,
  },
];

/**
 * Checks if a circle at (x, z) with radius r intersects an AABB.
 */
function checkCircleAABB(x, z, r, box) {
  const closestX = Math.max(box.minX, Math.min(x, box.maxX));
  const closestZ = Math.max(box.minZ, Math.min(z, box.maxZ));

  const distX = x - closestX;
  const distZ = z - closestZ;

  return distX * distX + distZ * distZ < r * r;
}

/**
 * Validates if position (x, z) is free of obstacle collisions and within boundaries.
 */
export function isPositionValid(x, z, r = PLAYER_RADIUS) {
  // Check boundaries
  if (
    x < ROOM_BOUNDS.minX ||
    x > ROOM_BOUNDS.maxX ||
    z < ROOM_BOUNDS.minZ ||
    z > ROOM_BOUNDS.maxZ
  ) {
    return false;
  }

  // Check obstacle collisions
  for (let i = 0; i < LAB_OBSTACLES.length; i++) {
    if (checkCircleAABB(x, z, r, LAB_OBSTACLES[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Resolves movement from current (startX, startZ) to desired (targetX, targetZ).
 * Applies axis-separated sliding collision resolution.
 */
export function resolvePlayerCollision(startX, startZ, targetX, targetZ, r = PLAYER_RADIUS) {
  let resolvedX = startX;
  let resolvedZ = startZ;
  let collided = false;

  // 1. Try moving along X
  const clampedX = Math.max(ROOM_BOUNDS.minX, Math.min(targetX, ROOM_BOUNDS.maxX));
  if (isPositionValid(clampedX, startZ, r)) {
    resolvedX = clampedX;
  } else {
    collided = true;
  }

  // 2. Try moving along Z
  const clampedZ = Math.max(ROOM_BOUNDS.minZ, Math.min(targetZ, ROOM_BOUNDS.maxZ));
  if (isPositionValid(resolvedX, clampedZ, r)) {
    resolvedZ = clampedZ;
  } else {
    collided = true;
  }

  // Fallback: if already inside an obstacle, clamp within bounds
  if (!isPositionValid(resolvedX, resolvedZ, r)) {
    resolvedX = Math.max(ROOM_BOUNDS.minX, Math.min(startX, ROOM_BOUNDS.maxX));
    resolvedZ = Math.max(ROOM_BOUNDS.minZ, Math.min(startZ, ROOM_BOUNDS.maxZ));
    collided = true;
  }

  return {
    x: resolvedX,
    z: resolvedZ,
    collided,
  };
}
