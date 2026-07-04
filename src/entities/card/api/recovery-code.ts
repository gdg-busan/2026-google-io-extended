import "server-only";
import { randomInt, createHash, timingSafeEqual } from "node:crypto";
import { CARD_RECOVERY_CODE_LENGTH } from "@/shared/config";

// Excludes visually ambiguous characters (0/O, 1/I/l).
const RECOVERY_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/** Generates an 8-char alphanumeric recovery code shown to the card owner once. */
export function generateRecoveryCode(): string {
  let code = "";
  for (let i = 0; i < CARD_RECOVERY_CODE_LENGTH; i += 1) {
    code += RECOVERY_CODE_ALPHABET[randomInt(RECOVERY_CODE_ALPHABET.length)];
  }
  return code;
}

/** One-way hash stored in cardRecovery/{cardId} — the raw code is never persisted. */
export function hashRecoveryCode(code: string): string {
  return createHash("sha256").update(code.toUpperCase()).digest("hex");
}

/** Constant-time comparison to avoid timing side-channels on recovery attempts. */
export function verifyRecoveryCode(code: string, storedHash: string): boolean {
  const candidateHash = hashRecoveryCode(code);
  const candidateBuf = Buffer.from(candidateHash, "hex");
  const storedBuf = Buffer.from(storedHash, "hex");
  if (candidateBuf.length !== storedBuf.length) {
    return false;
  }
  return timingSafeEqual(candidateBuf, storedBuf);
}
