import type { CameraFraming, Expression, ShotCharacter, ShotDefinition, StagePosition } from '@/types';

/** Compact shot authoring: S(id, location, camera, characters, brief). */
export const S = (
  id: string,
  background: string,
  camera: CameraFraming,
  characters: ShotCharacter[],
  description: string,
): ShotDefinition => ({ id, background, camera, characters, description });

/** One character in a shot. */
export const P = (
  id: string,
  expression: Expression,
  opts: { pose?: string; position?: StagePosition; facing?: ShotCharacter['facing'] } = {},
): ShotCharacter => ({ id, expression, position: 'center', facing: 'camera', ...opts });
