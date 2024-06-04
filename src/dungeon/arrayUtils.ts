export function getRandom<T>(arr: readonly T[]) {
  return arr[~~(Math.random() * arr.length)];
}
