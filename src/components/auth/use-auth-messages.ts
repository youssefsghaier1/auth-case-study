import { useIntlayer } from "next-intlayer";
import type { ReactNode } from "react";
import { AuthRequestError } from "@/lib/auth-errors";
import type { ValidationMessages } from "./auth-schemas";

/** Translated texts shared by the login and sign-up forms. */
export const useAuthMessages = () => {
  const { fields, validation, errors } = useIntlayer("login-card");

  const validationMessages: ValidationMessages = {
    emailRequired: validation.emailRequired.value,
    emailInvalid: validation.emailInvalid.value,
    passwordRequired: validation.passwordRequired.value,
    passwordTooShort: validation.passwordTooShort.value,
    passwordTooLong: validation.passwordTooLong.value,
    confirmRequired: validation.confirmRequired.value,
    passwordsMismatch: validation.passwordsMismatch.value,
  };

  const visibilityLabels = { show: fields.showPassword.value, hide: fields.hidePassword.value };

  /** The message to show for a failed sign-in or sign-up. */
  const serverErrorMessage = (error: unknown): ReactNode => {
    if (!(error instanceof AuthRequestError)) return errors.unknown;
    switch (error.kind) {
      case "invalid-credentials":
        return errors.invalidCredentials;
      case "email-taken":
        return errors.emailTaken;
      case "rate-limited":
        return error.retryAfterSeconds
          ? errors.rateLimited({ seconds: String(error.retryAfterSeconds) })
          : errors.rateLimitedNoDelay;
      case "unknown":
        return errors.unknown;
    }
  };

  return { fields, validationMessages, visibilityLabels, serverErrorMessage };
};
