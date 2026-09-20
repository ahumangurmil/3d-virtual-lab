/**
 * Player State and Data Structures.
 * Structured for future synchronization through Socket.IO.
 */

export const DEFAULT_PLAYER_NAME = 'Arjun Sharma';

export const createInitialPlayerState = (overrides = {}) => ({
  id: overrides.id || 'local-player',
  name: overrides.name || DEFAULT_PLAYER_NAME,
  role: overrides.role || 'student', // 'student' | 'teacher'
  color: overrides.color || '#0284c7', // Avatar highlight/lanyard color
  position: overrides.position ? [...overrides.position] : [0, 0, 8.5], // Spawns in rear aisle facing front
  rotation: overrides.rotation ? [...overrides.rotation] : [0, Math.PI, 0], // Facing -Z (towards teacher bench)
  movement: {
    isMoving: false,
    isRunning: false,
    speed: 0,
    velocity: [0, 0, 0],
    direction: [0, 0, -1],
    animationState: 'idle', // 'idle' | 'walk' | 'run'
  },
  timestamp: Date.now(),
});
