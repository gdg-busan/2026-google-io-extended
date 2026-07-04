/**
 * Admin console constants (task #6). Kept as a standalone module — not
 * re-exported through shared/config/index.ts — so importers must reference
 * "@/shared/config/admin" directly. This avoids touching the shared config
 * barrel while task #3 (also editing shared/*) is still in flight.
 */

/** Session cookie name for the /admin passcode-gated console. */
export const ADMIN_SESSION_COOKIE_NAME = "io2026_admin_session";

/** Admin session lifetime — long enough to cover one event day. */
export const ADMIN_SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

/** Login throttle: attempts allowed per rolling window, per client IP. */
export const ADMIN_LOGIN_MAX_ATTEMPTS_PER_WINDOW = 5;
export const ADMIN_LOGIN_WINDOW_MS = 60 * 1000;

/**
 * Success-metric targets (plan: "50명 중 접속 80%/명함 60%"). Single-event
 * site — hardcoded, no multi-event config system (YAGNI).
 */
export const EXPECTED_ATTENDEES = 50;
export const SESSION_RATE_TARGET = 0.8;
export const CARD_RATE_TARGET = 0.6;
