import { Beaker } from './Beaker';
import { ConicalFlask } from './ConicalFlask';
import { Burette } from './Burette';
import { TestTube } from './TestTube';
import { TestTubeRack } from './TestTubeRack';
import { BunsenBurner } from './BunsenBurner';

/**
 * Pure 3D Visual Apparatus Presentation Component.
 * Decoupled from interaction, raycasting, and placement logic.
 */
export function ApparatusModel({ apparatus, isSelected = false, isHovered = false }) {
  if (!apparatus) return null;

  const { type, liquid, tubes, isIgnited } = apparatus;

  switch (type) {
    case 'beaker_250':
    case 'beaker_500':
      return (
        <Beaker
          type={type}
          liquid={liquid}
          isSelected={isSelected}
          isHovered={isHovered}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
        />
      );

    case 'conical_flask_250':
      return (
        <ConicalFlask
          liquid={liquid}
          isSelected={isSelected}
          isHovered={isHovered}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
        />
      );

    case 'burette_50':
      return (
        <Burette
          liquid={liquid}
          isSelected={isSelected}
          isHovered={isHovered}
        />
      );

    case 'test_tube':
      return (
        <TestTube
          liquid={liquid}
          isSelected={isSelected}
          isHovered={isHovered}
        />
      );

    case 'test_tube_rack':
      return (
        <TestTubeRack
          tubes={tubes}
          isSelected={isSelected}
          isHovered={isHovered}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
        />
      );

    case 'bunsen_burner':
      return (
        <BunsenBurner
          isIgnited={isIgnited}
          isSelected={isSelected}
          isHovered={isHovered}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
        />
      );

    default:
      return null;
  }
}
