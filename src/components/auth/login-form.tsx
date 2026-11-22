"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIntlayer, useLocale } from "next-intlayer";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { TextField } from "@/components/ui/text-field";
import { authClient } from "@/lib/auth-client";
import { runAuthRequest } from "@/lib/auth-errors";
import { createLoginSchema, type LoginValues } from "./auth-schemas";
import { resetRequestStore } from "./password-reset/reset-request";
import { useAuthMessages } from "./use-auth-messages";

export type TwoFactorMethod = "totp" | "otp";

// signIn.email answers { twoFactorRedirect: true, twoFactorMethods } for 2FA accounts, but its type does not say so.
const getTwoFactorMethods = (data: unknown): TwoFactorMethod[] | null => {
  if (typeof data !== "object" || data === null || !("twoFactorRedirect" in data) || data.twoFactorRedirect !== true) {
    return null;
  }
  const methods = "twoFactorMethods" in data && Array.isArray(data.twoFactorMethods) ? data.twoFactorMethods : [];
  return methods.filter((method): method is TwoFactorMethod => method === "totp" || method === "otp");
};

type LoginFormProps = {
  /** Pre-filled email, e.g. when coming back from an expired 2FA attempt. */
  defaultEmail?: string;
  onTwoFactorRequired: (methods: TwoFactorMethod[], email: string) => void;
};

export const LoginForm = ({ defaultEmail = "", onTwoFactorRequired }: LoginFormProps) => {
  const { login } = useIntlayer("login-card");
  const { fields, validationMessages, visibilityLabels, serverErrorMessage } = useAuthMessages();
  const { locale } = useLocale();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(createLoginSchema(validationMessages)),
    defaultValues: { loginEmail: defaultEmail, loginPassword: "" },
  });

  const signIn = useMutation({
    mutationFn: ({ loginEmail, loginPassword }: LoginValues) =>
      runAuthRequest((fetchOptions) =>
        authClient.signIn.email({ email: loginEmail, password: loginPassword, fetchOptions }),
      ),
    onSuccess: (data, { loginEmail }) => {
      const twoFactorMethods = getTwoFactorMethods(data);
      if (twoFactorMethods) onTwoFactorRequired(twoFactorMethods, loginEmail);
      else router.replace(`/${locale}/account`);
    },
  });

  return (
    <form noValidate onSubmit={handleSubmit((values) => signIn.mutate(values))} className="flex flex-col">
      <div className="flex flex-col gap-[17px]">
        <TextField
          id="login-email"
          type="email"
          autoComplete="username"
          label={fields.email.value}
          errorMessage={errors.loginEmail?.message}
          {...register("loginEmail")}
        />
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          label={fields.password.value}
          visibilityLabels={visibilityLabels}
          errorMessage={errors.loginPassword?.message}
          {...register("loginPassword")}
        />
      </div>

      <Button asChild variant="ghostDark" className="mt-[23px]">
        {/* A new forgot-password flow starts on the form, not on the confirmation of an earlier request in this tab. */}
        <Link href={`/${locale}/forgot-password`} onClick={() => resetRequestStore.clear()}>
          {login.forgotPassword}
        </Link>
      </Button>

      {signIn.isError && (
        <p role="alert" className="mt-xl text-sx text-danger">
          {serverErrorMessage(signIn.error)}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        alignment="center"
        textSize="base"
        // Stays busy after success too, while the next page loads.
        isLoading={signIn.isPending || signIn.isSuccess}
        className="mt-2xl h-[51px] w-full"
      >
        {login.submit}
      </Button>
    </form>
  );
};
