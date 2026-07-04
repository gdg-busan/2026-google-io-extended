/**
 * Event constants. Single-event site (YAGNI) — hardcoded, no multi-tenant config system.
 */
export const EVENT_NAME = "GDG Busan — Google I/O Extended 2026";
export const EVENT_SHORT_NAME = "IO2026 Busan";

/** Global hard cap on Gemini calls for the whole event (cost ceiling). */
export const GEMINI_GLOBAL_CALL_CAP = 500;
/** Per-uid cap on AI intro (badge) regenerations. */
export const GEMINI_INTRO_PER_UID_CAP = 3;
/** Per-uid cap on Builder Match generations. */
export const GEMINI_MATCH_PER_UID_CAP = 2;

/** Card recovery: attempts allowed per rolling time window (not lifetime — avoids self-DoS). */
export const CARD_RECOVERY_MAX_ATTEMPTS_PER_WINDOW = 5;
export const CARD_RECOVERY_WINDOW_MS = 60 * 60 * 1000; // 1 hour
export const CARD_RECOVERY_CODE_LENGTH = 8;
