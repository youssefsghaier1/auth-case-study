import { useIntlayer } from "next-intlayer";
import { AuthRequestError } from "@/lib/auth-errors";

/** Why this sign-in attempt can no longer succeed: the screen then only offers "back to sign in". */
export type StopReason = "attempt-expired" | "attempt-cancelled" | "account-locked";

/**
 * Measured on the server:
 * - app and recovery codes: the 6th wrong code answers TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE and deletes the 2FA cookie,
 *   so the attempt is cancelled;
 * - email code only: the same answer keeps the cookie, a new code can be requested (`canRequestNewEmailCode`);
 * - 10 failed checks in a row, any factor, lock the account (about 15 minutes).
 */
export const getStopReason = (
  error: unknown,
  { canRequestNewEmailCode = false }: { canRequestNewEmailCode?: boolean } = {},
): StopReason | null => {
  if (!(error instanceof AuthRequestError)) return null;
  switch (error.kind) {
    case "attempt-expired":
      return "attempt-expired";
    case "too-many-attempts":
      return canRequestNewEmailCode ? null : "attempt-cancelled";
    case "account-locked":
      return "account-locked";
    default:
      return null;
  }
};

/** Text of an error after which the user can simply try again (a string: it also feeds field props). */
export const useTwoFactorErrorMessage = () => {
  const { errors } = useIntlayer("two-factor");

  return (error: unknown): string => {
    if (!(error instanceof AuthRequestError)) return errors.unknown.value;
    switch (error.kind) {
      case "invalid-code":
        return errors.invalidCode.value;
      case "invalid-backup-code":
        return errors.invalidBackupCode.value;
      case "code-expired":
        return errors.codeExpired.value;
      case "too-many-attempts": // only reached for an email code (otherwise it stops the attempt)
        return errors.tooManyForEmailCode.value;
      case "rate-limited":
        return error.retryAfterSeconds
          ? errors.rateLimited({ seconds: String(error.retryAfterSeconds) }).value
          : errors.rateLimitedNoDelay.value;
      default:
        return errors.unknown.value;
    }
  };
};
