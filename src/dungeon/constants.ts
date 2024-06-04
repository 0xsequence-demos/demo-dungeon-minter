import type { PartyAction } from "./PartyAction";
import { Direction } from "./directionUtils";

export const STARTING_X = 13;
export const STARTING_Y = 8;
export const STARTING_DIRECTION = Direction.NORTH;

export const CAMERA_HEIGHT = 0.3;

export const HEAD_TILT_ANGLE = -0.35;

export const DRAMATIC_LOOT_APPROACH_SPEED = 0.3;

export const PARTY = {
  MOVE_TIME: 300,
  BUMP_TIME: 200,
  ROTATE_TIME: 200,

  LIGHT: {
    COLOR: 0xffeeaa,
    INTENSITY: 0.6,
    RADIUS: 3.5,
    OFFSET: { x: 0.2, y: 0.2, z: 0.1 },
  },
};

export const KEYBINDINGS = new Map<number, PartyAction>();
KEYBINDINGS.set(87, "moveForward");
KEYBINDINGS.set(38, "moveForward");
KEYBINDINGS.set(65, "strafeLeft");
KEYBINDINGS.set(37, "strafeLeft");
KEYBINDINGS.set(83, "moveBackward");
KEYBINDINGS.set(40, "moveBackward");
KEYBINDINGS.set(68, "strafeRight");
KEYBINDINGS.set(39, "strafeRight");

KEYBINDINGS.set(81, "turnLeft");
KEYBINDINGS.set(33, "turnLeft");
KEYBINDINGS.set(69, "turnRight");
KEYBINDINGS.set(34, "turnRight");
