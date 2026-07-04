/** bingo/{uid} — I/O Bingo board, private to the owner. */
export interface BingoData {
  /** Flat list of cell labels (length = BINGO_SIZE²). */
  grid: string[];
  /** Checked state per cell, index-aligned with `grid`. */
  checks: boolean[];
}

export type Bingo = BingoData & { id: string };

/** Board is BINGO_SIZE × BINGO_SIZE. */
export const BINGO_SIZE = 5;

/** Keyword pool for the I/O keynote bingo (task #7). */
export const BINGO_KEYWORDS: readonly string[] = [
  "Gemini",
  "Firebase",
  "AI Agent",
  "Android XR",
  "Canvas",
  "MCP",
  "NotebookLM",
  "Flutter",
  "Vertex AI",
  "Imagen",
  "Veo",
  "Astra",
  "Gemma",
  "Project IDX",
  "Genkit",
  "Wear OS",
  "Material 3",
  "Kotlin",
  "Jetpack",
  "TensorFlow",
  "Chrome",
  "Web AI",
  "Cloud Run",
  "Workspace",
  "Maps",
];
