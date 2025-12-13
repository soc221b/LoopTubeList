import React, { useEffect, useState, type ReactNode } from 'react';

export default function CacheOrSWRProvider({ children }: { children: ReactNode }) {
  const [swrMod, setSwrMod] = useState<any | null>(null);

  useEffect(() => {
    // dynamic import via eval to avoid bundler static analysis when `swr` isn't installed
    // eslint-disable-next-line no-eval
    eval('import("swr")')
      .then((m: any) => setSwrMod(m))
      .catch(() => setSwrMod(null));
  }, []);

  if (swrMod && swrMod.SWRConfig) {
    // create element from imported SWRConfig to avoid static import
    return React.createElement(swrMod.SWRConfig, { value: { provider: () => new Map() } }, children);
  }

  // fallback: just render children (App will use local dedupe instance)
  return <>{children}</>;
}
