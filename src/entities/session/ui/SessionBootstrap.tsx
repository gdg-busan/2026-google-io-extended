"use client";

import { useBootstrapSession } from "../model/use-bootstrap-session";

/** Mounted once near the app root (src/app/layout.tsx). Renders nothing. */
export function SessionBootstrap() {
  useBootstrapSession();
  return null;
}
