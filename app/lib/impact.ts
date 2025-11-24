type Impact = { x: number; z: number; start: number; strength: number };

const listeners: ((impact: Impact) => void)[] = [];

export function subscribeToImpacts(cb: (impact: Impact) => void) {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function emitImpact(x: number, z: number, strength = 0.9) {
  const impact = { x, z, start: Date.now(), strength };
  listeners.forEach((l) => l(impact));
}

export default {
  subscribeToImpacts,
  emitImpact,
};
