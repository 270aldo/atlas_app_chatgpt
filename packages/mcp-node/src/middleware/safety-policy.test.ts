import { describe, it, expect } from 'vitest';
import { applySafetyPolicy } from './safety-policy.js';

type HasStructuredContent = { structuredContent?: Record<string, unknown> };

describe('applySafetyPolicy', () => {
  it('blocks unknown tools on high risk with triggers', async () => {
    const res = await applySafetyPolicy(
      'unknown_tool',
      { pain: 9, energy: 2, rpe: 9, notes: 'dolor de pecho' },
      async () => ({ content: [{ type: 'text', text: 'should not run' }] })
    );
    expect((res as HasStructuredContent).structuredContent?.blockedTool).toBe('unknown_tool');
  });

  it('requires check-in data before running certain tools', async () => {
    let called = false;
    const res = await applySafetyPolicy('atlas_adaptive_plan', {}, async () => {
      called = true;
      return { content: [{ type: 'text', text: 'should not run' }] };
    });
    expect(called).toBe(false);
    expect((res as HasStructuredContent).structuredContent?.requiresCheckin).toBe(true);
  });
});
