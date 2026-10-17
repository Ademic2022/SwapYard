"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Provider, useQuery } from "urql";

import type { MeFieldsFragment } from "@/gql/graphql";
import { MeQuery } from "@/lib/documents";
import { makeClient } from "@/lib/urql";
import { useIsClient } from "@/lib/use-is-client";

type MeContextValue = {
  me: MeFieldsFragment | null;
  /** True until the first `me` response arrives in the browser. */
  loading: boolean;
  refresh: () => void;
};

const MeContext = createContext<MeContextValue>({ me: null, loading: true, refresh: () => {} });

function MeProvider({ children }: { children: ReactNode }) {
  const isClient = useIsClient();
  const [{ data, fetching }, reexecute] = useQuery({ query: MeQuery, pause: !isClient });
  const refresh = useCallback(() => reexecute({ requestPolicy: "network-only" }), [reexecute]);
  const value = useMemo(
    () => ({ me: data?.me ?? null, loading: !isClient || (fetching && !data), refresh }),
    [data, fetching, isClient, refresh],
  );
  return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
}

export function useMe() {
  return useContext(MeContext);
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(makeClient);
  return (
    <Provider value={client}>
      <MeProvider>{children}</MeProvider>
    </Provider>
  );
}
