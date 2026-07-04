"use client";

import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { auth } from "@/shared/firebase";
import { ensureSession } from "../api/ensure-session";
import { isAuthReadyAtom, uidAtom } from "./atoms";

/**
 * Runs once at the app root (see entities/session/ui/SessionBootstrap):
 * silent anonymous sign-in -> uid -> sessions/{uid} write (KPI evidence).
 * Plan: "익명 부트스트랩과 SSR" — client-only, hydration flicker covered by
 * a skeleton in consumers via isAuthReadyAtom.
 */
export function useBootstrapSession(): void {
  const [, setUid] = useAtom(uidAtom);
  const [, setIsAuthReady] = useAtom(isAuthReadyAtom);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).catch(() => {
          // Graceful degrade: leave uid null. Consumers gate participation
          // features on uid presence and can retry via a reload.
          setIsAuthReady(true);
        });
        return;
      }

      setUid(user.uid);
      setIsAuthReady(true);
      void ensureSession(user.uid);
    });

    return unsubscribe;
  }, [setUid, setIsAuthReady]);
}
