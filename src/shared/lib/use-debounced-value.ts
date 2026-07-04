"use client";

import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates after `delayMs` of
 * quiet time. Used by the big-screen views (task #5) to keep the projector
 * render from churning on every Firestore snapshot (plan: "스크린 렌더는
 * debounce"). The last value is retained across the delay, so a brief
 * network hiccup never blanks the screen.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
