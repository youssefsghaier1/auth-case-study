"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIntlayer, useLocale } from "next-intlayer";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth-client";
import { AuthRequestError, runAuthRequest } from "@/lib/auth-errors";
import { createResetPasswordSchema, type ResetPasswordValues } from "../auth-schemas";
import { useAuthMessages } from "../use-auth-messages";
import { type InvalidLinkReason, InvalidResetLink } from "./invalid-reset-link";
import { resetRequestStore } from "./reset-request";

type ResetPasswordScreenProps = {
  /** ?token= of the URL, read on the server (null when absent). */
  initialToken: string | null;
  /** ?error=INVALID_TOKEN: Better-Auth refused the link before redirecting here. */
  linkRefused: boolean;
};

/** The page reached from the reset link: the new-password form (design/10), or the invalid-link screen. */
export const ResetPasswordScreen = ({ initialToken, linkRefused }: ResetPasswordScreenProps) => {
  // Kept in state from the first render: removing ?token= from the URL below, or a later server render
  // of this page without it, cannot take the token away from the form. It is never logged nor stored.
  const [token] = useState(initialToken);
  const [invalidReason, setInvalidReason] = useState<InvalidLinkReason | null>(
    linkRefused ? "invalid" : token ? null : "missing",
  );

  // The token leaves the address bar (history, bookmarks, screen sharing). Next.js supports replaceState.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("token")) return;
    url.searchParams.delete("token");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  if (invalidReason || !token) return <InvalidResetLink reason={invalidReason ?? "missing"} />;
  return <NewPasswordForm token={token} onInvalidLink={() => setInvalidReason("invalid")} />;
};

const NewPasswordForm = ({ token, onInvalidLink }: { token: string; onInvalidLink: () => void }) => {
  const content = useIntlayer("reset-password");
  const { validationMessages, visibilityLabels } = useAuthMessages();
  const { locale } = useLocale();
  const router = useRouter();

  // The same Zod rules as sign-up (createNewPasswordSchema), with this form's field names.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(createResetPasswordSchema(validationMessages)),
    defaultValues: { newPassword: "", newPasswordConfirm: "" },
  });

  const resetPassword = useMutation({
    mutationFn: ({ newPassword }: ResetPasswordValues) =>
      runAuthRequest((fetchOptions) => authClient.resetPassword({ newPassword, token, fetchOptions })),
    onSuccess: () => {
      resetRequestStore.clear();
      router.replace(`/${locale}/login?reset=success`); // a new sign-in is required
    },
    onError: (error) => {
      // Invalid, expired, already used or replaced: the form is replaced by the invalid-link screen.
      if (error instanceof AuthRequestError && error.kind === "invalid-token") onInvalidLink();
    },
  });

  const showError =
    resetPassword.isError &&
    !(resetPassword.error instanceof AuthRequestError && resetPassword.error.kind === "invalid-token");

  return (
    <form
      // method="post": a form sent before React has loaded must not put the fields in the URL.
      method="post"
      noValidate
      onSubmit={handleSubmit((values) => resetPassword.mutate(values))}
      className="flex flex-col items-center text-center tracking-normal"
    >
      <h1 className="text-lm leading-[1.2] font-semibold">{content.form.title}</h1>
      <p className="mt-[12px] text-s leading-[1.2] font-light text-white/80">{content.form.description}</p>

      <div className="mt-[40px] flex w-full flex-col gap-[17px] text-left">
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          label={content.form.newPassword.value}
          visibilityLabels={visibilityLabels}
          errorMessage={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <PasswordInput
          id="new-password-confirm"
          autoComplete="new-password"
          label={content.form.confirmPassword.value}
          visibilityLabels={visibilityLabels}
          errorMessage={errors.newPasswordConfirm?.message}
          {...register("newPasswordConfirm")}
        />
      </div>

      {showError && (
        <p role="alert" className="mt-xl text-sx text-danger">
          {content.unknownError}
        </p>
      )}
      <p role="status" className="sr-only">
        {resetPassword.isPending ? content.form.saving : ""}
      </p>

      <Button
        type="submit"
        variant="primary"
        alignment="center"
        textSize="base"
        isLoading={resetPassword.isPending || resetPassword.isSuccess}
        className="mt-2xl h-[51px] w-full"
      >
        {content.form.submit}
      </Button>

      <Button asChild variant="ghostDark" className="mt-[40px]">
        <Link href={`/${locale}/login`}>{content.backToSignIn}</Link>
      </Button>
    </form>
  );
};
