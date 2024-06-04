export function getRandomIntInRange(first: number, last: number) {
  const min = first > last ? last : first;
  const max = first > last ? first : last;
  const range = max - min + 1;
  return ~~(Math.random() * range) + min;
}
