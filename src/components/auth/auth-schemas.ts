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

/**
 * The one source of the new-password rules (sign-up and password reset): 8 to 128 characters, confirmation equal.
 * The field names are parameters, so each form keeps its own `name` attributes.
 */
export const createNewPasswordSchema = <const Password extends string, const Confirm extends string>(
  messages: ValidationMessages,
  names: { password: Password; confirm: Confirm },
) =>
  z
    .object({
      [names.password]: z
        .string()
        .min(PASSWORD_MIN_LENGTH, { error: messages.passwordTooShort })
        .max(PASSWORD_MAX_LENGTH, { error: messages.passwordTooLong }),
      [names.confirm]: z.string().min(1, { error: messages.confirmRequired }),
    } as Record<Password | Confirm, z.ZodString>)
    .refine(
      (values) => {
        const fields = values as Record<Password | Confirm, string>; // TypeScript cannot index Zod's output by a generic key
        return fields[names.password] === fields[names.confirm];
      },
      { error: messages.passwordsMismatch, path: [names.confirm] },
    );

export const createSignupSchema = (messages: ValidationMessages) =>
  z
    .object({ signupEmail: emailField(messages) })
    .and(createNewPasswordSchema(messages, { password: "signupPassword", confirm: "signupPasswordConfirm" }));

export const createResetPasswordSchema = (messages: ValidationMessages) =>
  createNewPasswordSchema(messages, { password: "newPassword", confirm: "newPasswordConfirm" });

export type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>;
export type SignupValues = z.infer<ReturnType<typeof createSignupSchema>>;
export type ResetPasswordValues = z.infer<ReturnType<typeof createResetPasswordSchema>>;
