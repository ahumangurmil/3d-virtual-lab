import { PlayerController } from './PlayerController';
import { PlayerAvatar } from './PlayerAvatar';

/**
 * High-Level Player Component.
 * Encapsulates the local player system, connecting the controller logic
 * and presentation avatar.
 *
 * For remote multiplayer players in future phases, the visual <PlayerAvatar />
 * can be mounted directly with network synchronized state.
 */
export function Player({
  playerName = 'Arjun Sharma',
  role = 'student',
  color = '#0284c7',
  isActive = true,
  teleportTarget = null,
  heldApparatus = null,
  onStateUpdate,
}) {
  return (
    <PlayerController
      playerName={playerName}
      role={role}
      color={color}
      isActive={isActive}
      teleportTarget={teleportTarget}
      heldApparatus={heldApparatus}
      onStateUpdate={onStateUpdate}
    />
  );
}

export { PlayerController, PlayerAvatar };
