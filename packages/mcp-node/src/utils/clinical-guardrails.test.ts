import { describe, it, expect } from 'vitest';
import { triageCheckin } from './clinical-guardrails.js';

describe('clinical-guardrails triageCheckin', () => {
  it('flags high risk by keywords in notes', () => {
    const r = triageCheckin({ pain: 1, energy: 8, rpe: 3, notes: 'dolor de pecho y mareo' });
    expect(r.risk).toBe('high');
    expect(r.recommendations.length).toBeGreaterThan(0);
  });

  it('high risk by numeric thresholds', () => {
    const r = triageCheckin({ pain: 8, energy: 8, rpe: 5 });
    expect(r.risk).toBe('high');
  });

  it('moderate risk thresholds', () => {
    const r = triageCheckin({ pain: 5, energy: 5, rpe: 6 });
    expect(r.risk).toBe('moderate');
  });

  it('low risk when all is fine', () => {
    const r = triageCheckin({ pain: 1, energy: 8, rpe: 3 });
    expect(r.risk).toBe('low');
  });
});
