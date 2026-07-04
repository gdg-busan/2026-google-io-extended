import { EVENT_NAME } from "@/shared/config";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>{EVENT_NAME}</h1>
      <p>Builder Board — coming soon.</p>
    </main>
  );
}
