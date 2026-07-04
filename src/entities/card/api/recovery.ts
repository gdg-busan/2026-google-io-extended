import "server-only";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/shared/firebase/admin";
import {
  CARD_RECOVERY_MAX_ATTEMPTS_PER_WINDOW,
  CARD_RECOVERY_WINDOW_MS,
} from "@/shared/config";
import {
  generateRecoveryCode,
  hashRecoveryCode,
  verifyRecoveryCode,
} from "./recovery-code";

export class CardNotFoundError extends Error {}
export class ForbiddenError extends Error {}
export class RecoveryNotFoundError extends Error {}
export class RateLimitedError extends Error {
  constructor(public readonly retryAfterMs: number) {
    super("Too many recovery attempts");
  }
}
export class InvalidCodeError extends Error {}

interface CardRecoveryDoc {
  recoveryCodeHash: string;
  attemptCount: number;
  windowStartAt: Timestamp | null;
}

/**
 * Issues (or re-issues) a recovery code for a card the caller owns. Called
 * right after client-side card creation (see features/register-card).
 * Only the verified owner may call this — cardRecovery itself is
 * unreadable/unwritable by any client per firestore.rules.
 */
export async function issueRecoveryCode(
  cardId: string,
  requesterUid: string,
): Promise<string> {
  const cardRef = adminDb.collection("cards").doc(cardId);
  const cardSnapshot = await cardRef.get();
  if (!cardSnapshot.exists) {
    throw new CardNotFoundError(cardId);
  }
  if (cardSnapshot.data()?.ownerUid !== requesterUid) {
    throw new ForbiddenError("Not the card owner");
  }

  const code = generateRecoveryCode();
  const doc: CardRecoveryDoc = {
    recoveryCodeHash: hashRecoveryCode(code),
    attemptCount: 0,
    windowStartAt: null,
  };
  await adminDb.collection("cardRecovery").doc(cardId).set(doc);
  return code;
}

/**
 * Redeems a recovery code, transferring cards/{cardId}.ownerUid to newUid
 * on success. Rate-limited per rolling time window (not lifetime — a
 * lifetime cap would let a malicious third party permanently lock out the
 * real owner just by guessing wrong repeatedly; see plan line 61).
 */
export async function redeemRecoveryCode(
  cardId: string,
  code: string,
  newUid: string,
): Promise<void> {
  const recoveryRef = adminDb.collection("cardRecovery").doc(cardId);
  const cardRef = adminDb.collection("cards").doc(cardId);

  // NOTE: a transaction's writes only commit if the callback returns
  // normally — throwing inside it discards any transaction.update() calls
  // made so far. So failure outcomes (rate-limited/invalid) are returned as
  // data here and thrown AFTER the transaction commits, otherwise the
  // attempt-count increment on a wrong code would silently never persist.
  const result = await adminDb.runTransaction(async (transaction) => {
    const recoverySnapshot = await transaction.get(recoveryRef);
    if (!recoverySnapshot.exists) {
      return { outcome: "not-found" as const };
    }
    const data = recoverySnapshot.data() as CardRecoveryDoc;

    const now = Timestamp.now();
    let attemptCount: number;
    let windowStartAt: Timestamp;
    let windowExpired: boolean;
    if (
      !data.windowStartAt ||
      now.toMillis() - data.windowStartAt.toMillis() > CARD_RECOVERY_WINDOW_MS
    ) {
      windowExpired = true;
      attemptCount = 0;
      windowStartAt = now;
    } else {
      windowExpired = false;
      attemptCount = data.attemptCount;
      windowStartAt = data.windowStartAt;
    }

    if (attemptCount >= CARD_RECOVERY_MAX_ATTEMPTS_PER_WINDOW) {
      if (windowExpired) {
        transaction.update(recoveryRef, { attemptCount, windowStartAt });
      }
      const retryAfterMs =
        CARD_RECOVERY_WINDOW_MS - (now.toMillis() - windowStartAt.toMillis());
      return {
        outcome: "rate-limited" as const,
        retryAfterMs: Math.max(retryAfterMs, 0),
      };
    }

    const isValid = verifyRecoveryCode(code, data.recoveryCodeHash);

    if (!isValid) {
      transaction.update(recoveryRef, {
        attemptCount: attemptCount + 1,
        windowStartAt,
      });
      return { outcome: "invalid" as const };
    }

    transaction.update(recoveryRef, { attemptCount: 0, windowStartAt: null });
    transaction.update(cardRef, { ownerUid: newUid });
    return { outcome: "success" as const };
  });

  switch (result.outcome) {
    case "not-found":
      throw new RecoveryNotFoundError(cardId);
    case "rate-limited":
      throw new RateLimitedError(result.retryAfterMs);
    case "invalid":
      throw new InvalidCodeError("Recovery code did not match");
    case "success":
      return;
  }
}
