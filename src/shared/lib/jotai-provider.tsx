"use client";

import { Provider } from "jotai";
import type { ReactNode } from "react";

interface JotaiProviderProps {
  children: ReactNode;
}

/**
 * Root Jotai provider. Mounted once in the root layout (src/app/layout.tsx).
 * Jotai atoms are client-only (see plan: SSR boundary) — never import this
 * or any atom from a Server Component.
 */
export function JotaiProvider({ children }: JotaiProviderProps) {
  return <Provider>{children}</Provider>;
}
