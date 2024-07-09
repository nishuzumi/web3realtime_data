// app/providers.tsx
'use client'

import {NextUIProvider} from '@nextui-org/react'
import React from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const queryClient = new QueryClient();

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NextUIProvider className="min-h-screen">
        {children}
      </NextUIProvider>
    </QueryClientProvider>
  )
}