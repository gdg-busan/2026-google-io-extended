import type { ReactNode } from "react";
import { Theme } from "@radix-ui/themes";
import styles from "./screen.module.css";

/**
 * Big-screen projector shell (task #5): full-viewport dark canvas for the
 * word cloud / map / feed views. Meant for a laptop → projector in
 * fullscreen; the participant chrome (nav etc.) is intentionally absent.
 *
 * Local dark `<Theme>` nested inside the root light Theme (task #17) — only
 * `/screen` renders dark; participant/admin stay on the light root theme.
 */
export default function ScreenLayout({ children }: { children: ReactNode }) {
  return (
    <Theme appearance="dark" accentColor="blue" radius="large">
      <div className={styles.shell}>{children}</div>
    </Theme>
  );
}
