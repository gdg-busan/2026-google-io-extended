import { Suspense } from "react";
import { ScreenRotator } from "@/widgets/screen-rotator";

/** Auto-cycling projector view. `/screen?rotate=30` (default 30s), `?rotate=0` pins the first view. */
export default function ScreenPage() {
  return (
    <Suspense fallback={null}>
      <ScreenRotator />
    </Suspense>
  );
}
