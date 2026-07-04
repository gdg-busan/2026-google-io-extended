import type { ReactNode } from "react";
import styles from "./screen.module.css";

/**
 * Big-screen projector shell (task #5): full-viewport dark canvas for the
 * word cloud / map / feed views. Meant for a laptop → projector in
 * fullscreen; the participant chrome (nav etc.) is intentionally absent.
 */
export default function ScreenLayout({ children }: { children: ReactNode }) {
  return <div className={styles.shell}>{children}</div>;
}
