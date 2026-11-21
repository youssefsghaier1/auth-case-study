/** The only part of better-fetch's error context we need (better-fetch is not a direct dependency). */
type ErrorContext = { response: Response };

/** What went wrong, in terms the UI can translate. */
export type AuthErrorKind = "invalid-credentials" | "email-taken" | "rate-limited" | "unknown";

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

const toKind = (error: { status: number; code?: string }): AuthErrorKind => {
  if (error.status === 429) return "rate-limited"; // the rate limiter sends no `code`, only the status
  if (error.code === "INVALID_EMAIL_OR_PASSWORD") return "invalid-credentials";
  if (error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") return "email-taken";
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
