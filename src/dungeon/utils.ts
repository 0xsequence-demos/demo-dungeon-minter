// A modulo function that correctly handles negative numbers
export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

const pi = Math.PI;
const tau = pi * 2;
const tauAndAHalf = pi * 3;
export function anglesMatch(a: number, b: number, tolerance = 0.01) {
  const d = a - b;
  const d2 = ((d % tau) + tauAndAHalf) % tau;
  const r = Math.abs(d2 - pi) < tolerance;
  return r;
}
