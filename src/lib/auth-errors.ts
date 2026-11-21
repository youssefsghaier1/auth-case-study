/** The only part of better-fetch's error context we need (better-fetch is not a direct dependency). */
type ErrorContext = { response: Response };

/** What went wrong, in terms the UI can translate. */
export type AuthErrorKind =
  | "invalid-credentials"
  | "email-taken"
  | "invalid-code" // wrong app or email code
  | "invalid-backup-code" // wrong or already used recovery code
  | "code-expired" // email code expired (3 min) or never sent
  | "too-many-attempts" // 5 wrong codes in this sign-in attempt
  | "attempt-expired" // the 10-minute sign-in attempt is over (2FA cookie missing or expired)
  | "account-locked" // 10 failed checks in a row: account locked for a while
  | "rate-limited" // 429 from the rate limiter (X-Retry-After)
  | "unknown";

/** Thrown by `runAuthRequest`, so TanStack Query mutations end up in their error state. */
export class AuthRequestError extends Error {
  constructor(
    readonly kind: AuthErrorKind,
    /** Seconds to wait, from the X-Retry-After header of a 429 response (when present). */
    readonly retryAfterSeconds?: number,
  ) {
    super(kind);
    this.name = "AuthRequestError";
  }
}

type AuthClientResult<T> =
  | { data: T; error: null }
  | { data: null; error: { status: number; code?: string; message?: string } };

const KIND_BY_CODE: Record<string, AuthErrorKind> = {
  INVALID_EMAIL_OR_PASSWORD: "invalid-credentials",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "email-taken",
  INVALID_CODE: "invalid-code",
  INVALID_BACKUP_CODE: "invalid-backup-code",
  OTP_HAS_EXPIRED: "code-expired",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "too-many-attempts",
  INVALID_TWO_FACTOR_COOKIE: "attempt-expired",
  ACCOUNT_TEMPORARILY_LOCKED: "account-locked", // a 429 too, so it must be matched before the status check
};

const toKind = (error: { status: number; code?: string }): AuthErrorKind => {
  const byCode = error.code ? KIND_BY_CODE[error.code] : undefined;
  if (byCode) return byCode;
  if (error.status === 429) return "rate-limited"; // the rate limiter sends no `code`, only the status
  return "unknown";
};

/**
 * Runs an authClient call and returns its data, or throws an AuthRequestError.
 * The call receives `fetchOptions` so the X-Retry-After header of a 429 can be read.
 */
export const runAuthRequest = async <T>(
  call: (fetchOptions: { onError: (context: ErrorContext) => void }) => Promise<AuthClientResult<T>>,
): Promise<T> => {
  let retryAfterSeconds: number | undefined;
  const onError = ({ response }: ErrorContext) => {
    const seconds = Number(response.headers.get("X-Retry-After"));
    if (Number.isFinite(seconds) && seconds > 0) retryAfterSeconds = Math.ceil(seconds);
  };

  let result: AuthClientResult<T>;
  try {
    result = await call({ onError });
  } catch {
    // better-fetch does not catch fetch() failures: no network, server down, CORS...
    throw new AuthRequestError("unknown");
  }

  if (result.error) throw new AuthRequestError(toKind(result.error), retryAfterSeconds);
  return result.data;
};
