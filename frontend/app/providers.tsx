"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { makeQueryClient } from "@/lib/api/query-client";
import { ChatStoreProvider } from "@/providers/chat-store-provider";
import { UIStoreProvider } from "@/providers/ui-store-provider";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <UIStoreProvider>
        <ChatStoreProvider>{children}</ChatStoreProvider>
      </UIStoreProvider>

      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
