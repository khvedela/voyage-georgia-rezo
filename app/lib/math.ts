export function interpolate(
  val: number,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number
) {
  return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
}

// Deterministic pseudo-random number generator
export function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
