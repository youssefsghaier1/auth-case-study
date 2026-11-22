import { useSecondsLeft } from "./use-seconds-left";

/**
 * Same as RESEND_COOLDOWN_SECONDS in src/lib/auth.ts (not imported: that module is server-only).
 * The server refuses a new email code or a new reset link for 30 s after the previous one (429 + X-Retry-After).
 */
const RESEND_COOLDOWN_MS = 30 * 1000;

/**
 * Seconds before a new code or link may be requested, from when the server accepted the last one (`sentAt`).
 * Never above 30: the clock state can be up to 250 ms older than a `sentAt` stored just now.
 */
export const useCooldownSecondsLeft = (sentAt: number | undefined) =>
  Math.min(useSecondsLeft(sentAt === undefined ? undefined : sentAt + RESEND_COOLDOWN_MS), RESEND_COOLDOWN_MS / 1000);

/** The `sentAt` to store after a 429: the server says its window ends in `retryAfterSeconds`. */
export const sentAtFromRetryAfter = (retryAfterSeconds: number) =>
  Date.now() - RESEND_COOLDOWN_MS + retryAfterSeconds * 1000;
