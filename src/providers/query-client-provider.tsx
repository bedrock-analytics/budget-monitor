"use client";

import { type ReactNode, useState } from "react";

import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";

export function QueryClientProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <TanstackQueryClientProvider client={client}>{children}</TanstackQueryClientProvider>;
}
