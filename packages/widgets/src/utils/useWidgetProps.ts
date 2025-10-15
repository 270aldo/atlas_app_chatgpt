import { useEffect, useState } from 'react';

type AnyObj = Record<string, unknown>;

declare global {
  interface Window {
    oai?: { widget?: { getProps?: () => AnyObj } };
    openai?: { widget?: { getProps?: () => AnyObj } };
  }
}

export function useWidgetProps<T extends AnyObj>(defaults: T): T {
  const [props, setProps] = useState<T>(defaults);

  useEffect(() => {
    try {
      const fromHost = (window.oai?.widget?.getProps?.() || window.openai?.widget?.getProps?.()) as
        | AnyObj
        | undefined;
      if (fromHost && Object.keys(fromHost).length > 0) {
        setProps({ ...(defaults as AnyObj), ...fromHost } as T);
      }
    } catch (_e) {
      // ignore – fallback to defaults
    }
  }, []);

  return props;
}
