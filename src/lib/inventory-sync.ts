export function inventoryDelta(previous: Record<number, number>, next: Record<number, number>): Record<string, number> {
  const delta: Record<string, number> = {};
  for (const key of new Set([...Object.keys(previous), ...Object.keys(next)])) {
    const difference = (next[Number(key)] ?? 0) - (previous[Number(key)] ?? 0);
    if (difference) delta[key] = difference;
  }
  return delta;
}