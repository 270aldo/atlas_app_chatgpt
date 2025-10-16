import { describe, it, expect } from 'vitest';
import { generateAdaptivePlan } from './adaptive-plan.js';

describe('generateAdaptivePlan', () => {
  it('returns 7-day plan for low risk', () => {
    const plan = generateAdaptivePlan(
      { pain: 1, energy: 8, rpe: 3 },
      { risk: 'low', recommendations: [], disclaimer: '', triggers: [] },
      'fuerza'
    );
    expect(plan.length).toBe(7);
    expect(plan[0].day).toBe('Lunes');
  });

  it('downgrades intensity on low energy', () => {
    const plan = generateAdaptivePlan(
      { pain: 1, energy: 3, rpe: 3 },
      { risk: 'low', recommendations: [], disclaimer: '', triggers: [] }
    );
    expect(plan.some((p) => p.intensity === 'moderada')).toBe(false);
  });

  it('high risk produces very low intensity across the week', () => {
    const plan = generateAdaptivePlan(
      { pain: 8, energy: 2, rpe: 9 },
      { risk: 'high', recommendations: [], disclaimer: '', triggers: [] }
    );
    expect(plan.every((p) => p.intensity === 'muy baja')).toBe(true);
  });
});
