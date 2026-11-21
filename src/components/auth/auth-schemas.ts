import { z } from "zod";

/** Translated validation messages, passed in so the schemas speak the page's language. */
export type ValidationMessages = {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordTooShort: string;
  passwordTooLong: string;
  confirmRequired: string;
  passwordsMismatch: string;
};

// Same limits as the server (Better-Auth defaults: 8 to 128 characters).
export const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const emailField = (messages: ValidationMessages) =>
  z.string().trim().min(1, { error: messages.emailRequired }).pipe(z.email({ error: messages.emailInvalid }));

// Field names are unique across both forms (they stay mounted side by side).
export const createLoginSchema = (messages: ValidationMessages) =>
  z.object({
    loginEmail: emailField(messages),
    // Sign-in only checks that a password was typed: older accounts may predate any rule.
    loginPassword: z.string().min(1, { error: messages.passwordRequired }),
  });

export const createSignupSchema = (messages: ValidationMessages) =>
  z
    .object({
      signupEmail: emailField(messages),
      signupPassword: z
        .string()
        .min(PASSWORD_MIN_LENGTH, { error: messages.passwordTooShort })
        .max(PASSWORD_MAX_LENGTH, { error: messages.passwordTooLong }),
      signupPasswordConfirm: z.string().min(1, { error: messages.confirmRequired }),
    })
    .refine((values) => values.signupPassword === values.signupPasswordConfirm, {
      error: messages.passwordsMismatch,
      path: ["signupPasswordConfirm"],
    });

export type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>;
export type SignupValues = z.infer<ReturnType<typeof createSignupSchema>>;
