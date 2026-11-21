"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  // Created once, on the provider's first render, and kept in React state for the whole browser session.
  // Not at module level: on the server a module-level client would be shared by every visitor's request.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // By default TanStack Query pauses mutations while the browser is offline, leaving a spinner forever.
        // Auth forms must fail at once and show the network error instead.
        defaultOptions: { mutations: { networkMode: "always" } },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
