import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { useWidgetProps } from './useWidgetProps';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Probe<T extends Record<string, any>>({ defaults }: { defaults: T }) {
  const props = useWidgetProps<T>(defaults);
  return <div data-testid="value">{JSON.stringify(props)}</div>;
}

describe('useWidgetProps', () => {
  beforeEach(() => {
    window.oai = undefined;
    window.openai = undefined;
  });

  afterEach(() => {
    cleanup();
  });

  it('returns defaults when host has no props', async () => {
    render(<Probe defaults={{ foo: 1 }} />);
    const el = await screen.findByTestId('value');
    expect(el.textContent).toContain('"foo":1');
  });

  it('merges host props when available', async () => {
    window.openai = {
      widget: { getProps: () => ({ foo: 9, bar: 'ok' }) as Record<string, unknown> },
    };
    render(<Probe defaults={{ foo: 1 }} />);
    const el = await screen.findByTestId('value');
    expect(el.textContent).toContain('"foo":9');
    expect(el.textContent).toContain('"bar":"ok"');
  });
});
