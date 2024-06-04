export function clamp(min: number, max: number, v: number) {
  return Math.max(min, Math.min(max, v));
}
