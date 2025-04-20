import { describe, it, expect } from 'vitest';
import { sumTotals, computeTotalsFromItemFallback, clamp } from '../lib/scoring';

describe('scoring utilities', () => {
  it('clamp works for basic cases', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(20, 0, 10)).toBe(10);
  });

  it('sumTotals handles all zeros', () => {
    const res = sumTotals([{ max: 3, score: 0 }, { max: 3, score: 0 }, { max: 3, score: 0 }]);
    expect(res.totalMax).toBe(9);
    expect(res.totalAchieved).toBe(0);
    expect(res.pct).toBe(0);
  });

  it('sumTotals handles partial zeros', () => {
    const res = sumTotals([{ max: 3, score: 0 }, { max: 3, score: 2 }, { max: 3, score: 1 }]);
    expect(res.totalMax).toBe(9);
    expect(res.totalAchieved).toBe(3);
    expect(res.pct).toBe(Math.round((3 / 9) * 100));
  });

  it('sumTotals clamps overflows', () => {
    const res = sumTotals([{ max: 3, score: 5 }, { max: 3, score: -1 }]);
    expect(res.totalMax).toBe(6);
    expect(res.totalAchieved).toBe(3);
    expect(res.pct).toBe(50);
  });

  it('fallback uses item value/outOf', () => {
    const res = computeTotalsFromItemFallback(8, 11);
    expect(res.totalMax).toBe(11);
    expect(res.totalAchieved).toBe(8);
    expect(res.pct).toBe(Math.round((8 / 11) * 100));
  });

  it('fallback clamps negatives and overflows', () => {
    expect(computeTotalsFromItemFallback(-2, 10).totalAchieved).toBe(0);
    expect(computeTotalsFromItemFallback(20, 10).totalAchieved).toBe(10);
  });
});
