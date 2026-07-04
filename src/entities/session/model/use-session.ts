"use client";

import { useAtomValue } from "jotai";
import { isAuthReadyAtom, uidAtom } from "./atoms";

export interface UseSessionResult {
  uid: string | null;
  isReady: boolean;
}

/** Read-only consumer hook for the current anonymous session. */
export function useSession(): UseSessionResult {
  const uid = useAtomValue(uidAtom);
  const isReady = useAtomValue(isAuthReadyAtom);
  return { uid, isReady };
}
