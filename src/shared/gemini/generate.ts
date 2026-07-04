import "server-only";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/** Thrown when GEMINI_API_KEY is absent — Route Handlers map this to a 503 degrade. */
export class GeminiUnavailableError extends Error {
  constructor() {
    super("Gemini API is not configured");
  }
}

/**
 * Minimal server-side Gemini text call over REST (no SDK dependency).
 * Real Gemini only — if the key is missing we throw GeminiUnavailableError
 * and the caller degrades gracefully (plan: "실패 시 graceful degrade",
 * never fake/rule-base the output). AI is part of the event's identity.
 */
export async function generateText(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiUnavailableError();
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 256 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }
  return text;
}
