export const Direction = {
  NORTH: 0,
  SOUTH: Math.PI,
  EAST: Math.PI * -0.5,
  WEST: Math.PI * 0.5,
};

export function asDegrees(dir: number) {
  return (dir / Math.PI) * 180;
}
