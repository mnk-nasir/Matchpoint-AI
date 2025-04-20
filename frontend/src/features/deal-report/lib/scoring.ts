export type SubScore = { max?: number; score?: number };

export function clamp(n: number, min = 0, max = Number.POSITIVE_INFINITY) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export function sumTotals(subs: SubScore[]) {
  let totalMax = 0;
  let totalAchieved = 0;
  for (const s of subs) {
    const m = clamp(Number(s.max ?? 0), 0);
    const a = clamp(Number(s.score ?? 0), 0, m);
    totalMax += m;
    totalAchieved += a;
  }
  totalMax = clamp(totalMax, 0);
  totalAchieved = clamp(totalAchieved, 0, totalMax);
  return { totalAchieved, totalMax, pct: totalMax > 0 ? Math.round((totalAchieved / totalMax) * 100) : 0 };
}

export function computeTotalsFromItemFallback(value: number, scoreOutOf: number) {
  const totalMax = clamp(Number(scoreOutOf ?? 0), 0);
  const totalAchieved = clamp(Number(value ?? 0), 0, totalMax);
  return { totalAchieved, totalMax, pct: totalMax > 0 ? Math.round((totalAchieved / totalMax) * 100) : 0 };
}
