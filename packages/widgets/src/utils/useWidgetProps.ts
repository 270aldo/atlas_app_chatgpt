import { useEffect, useState } from 'react';

type AnyObj = Record<string, unknown>;

declare global {
  interface Window {
    oai?: { widget?: { getProps?: () => AnyObj } };
    openai?: { widget?: { getProps?: () => AnyObj } };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useWidgetProps<T extends Record<string, any>>(defaults: T): T {
  const [props, setProps] = useState<T>(defaults);

  useEffect(() => {
    try {
      const fromHost = (window.oai?.widget?.getProps?.() || window.openai?.widget?.getProps?.()) as
        | Partial<T>
        | undefined;
      if (fromHost && Object.keys(fromHost).length > 0) {
        setProps({ ...defaults, ...fromHost } as T);
      }
    } catch (_e) {
      // ignore – fallback to defaults
    }
  }, []);

  return props;
}
