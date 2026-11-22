"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type UseMutationResult, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useIntlayer, useLocale } from "next-intlayer";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { authClient } from "@/lib/auth-client";
import { AuthRequestError, runAuthRequest } from "@/lib/auth-errors";
import { sentAtFromRetryAfter, useCooldownSecondsLeft } from "@/lib/resend-cooldown";
import { createLoginSchema } from "../auth-schemas";
import { useAuthMessages } from "../use-auth-messages";
import { resetRequestStore, useResetRequest } from "./reset-request";

type SendLinkMutation = UseMutationResult<unknown, Error, string>;

const isRateLimited = (error: unknown) => error instanceof AuthRequestError && error.kind === "rate-limited";

/**
 * Forgot password (design/07), then the confirmation (design/08) in the same card.
 * The confirmation never says whether the account exists: the server answers the same, and so does this screen.
 */
export const ForgotPasswordCard = () => {
  const { locale } = useLocale();
  const request = useResetRequest();

  const sendLink = useMutation({
    mutationFn: (email: string) =>
      runAuthRequest((fetchOptions) =>
        authClient.requestPasswordReset({ email, redirectTo: `/${locale}/reset-password`, fetchOptions }),
      ),
    onSuccess: () => resetRequestStore.update({ sentAt: Date.now() }),
    onError: (error) => {
      if (error instanceof AuthRequestError && error.kind === "rate-limited") {
        // A link went out less than 30 s ago (from this tab or another one): same confirmation, countdown from the server.
        if (error.retryAfterSeconds) resetRequestStore.update({ sentAt: sentAtFromRetryAfter(error.retryAfterSeconds) });
        return;
      }
      // Nothing reached the server on the first request: back to the form, which shows the error.
      if (resetRequestStore.read()?.sentAt === undefined) resetRequestStore.clear();
    },
  });

  // While the first request runs, the form stays (busy button). A request left by a reload shows the confirmation.
  // `request` is null on the server and during hydration, so the confirmation only ever renders in the browser.
  if (request && !(sendLink.isPending && request.sentAt === undefined)) {
    return <ResetLinkSent email={request.email} sentAt={request.sentAt} sendLink={sendLink} />;
  }

  return <ForgotPasswordForm sendLink={sendLink} />;
};

const ForgotPasswordForm = ({ sendLink }: { sendLink: SendLinkMutation }) => {
  const content = useIntlayer("forgot-password");
  const { fields, validationMessages } = useAuthMessages();
  const { locale } = useLocale();

  // The same email rule as sign-in (one Zod source), only this field.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ loginEmail: string }>({
    resolver: zodResolver(createLoginSchema(validationMessages).pick({ loginEmail: true })),
    defaultValues: { loginEmail: "" },
  });

  return (
    <form
      // method="post": a form sent before React has loaded must not put the fields in the URL.
      method="post"
      noValidate
      onSubmit={handleSubmit(({ loginEmail }) => {
        resetRequestStore.start(loginEmail); // before the request, so a reload during it keeps the confirmation
        sendLink.mutate(loginEmail);
      })}
      className="flex flex-col items-center text-center tracking-normal"
    >
      <h1 className="text-lm leading-[1.2] font-semibold">{content.form.title}</h1>
      <p className="mt-[12px] text-s leading-[1.2] font-light text-white/80">{content.form.description}</p>

      <TextField
        id="forgot-email"
        type="email"
        autoComplete="email"
        label={fields.email.value}
        errorMessage={errors.loginEmail?.message}
        className="mt-[40px] text-left"
        {...register("loginEmail")}
      />

      {sendLink.isError && !isRateLimited(sendLink.error) && (
        <p role="alert" className="mt-xl text-sx text-danger">
          {content.unknownError}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        alignment="center"
        textSize="base"
        isLoading={sendLink.isPending}
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

type ResetLinkSentProps = { email: string; sentAt: number | undefined; sendLink: SendLinkMutation };

// Rendered in the browser only (see above): the countdown reads the clock, which a prerender may not do.
const ResetLinkSent = ({ email, sentAt, sendLink }: ResetLinkSentProps) => {
  const content = useIntlayer("forgot-password");
  const { locale } = useLocale();
  const cooldownLeft = useCooldownSecondsLeft(sentAt);
  // Only the countdown and a request in flight block the link: a `requestedAt` left by a reload never does.
  const canResend = cooldownLeft === 0 && !sendLink.isPending;

  return (
    <div className="flex flex-col items-center text-center tracking-normal">
      <h1 className="text-lm leading-[1.2] font-semibold">{content.sent.title}</h1>
      <p className="mt-[12px] text-s leading-[1.2] font-light text-white/80">{content.sent.description}</p>

      {sendLink.isError && !isRateLimited(sendLink.error) && (
        <p role="alert" className="mt-xl text-sx text-danger">
          {content.unknownError}
        </p>
      )}
      {/* Always present, so screen readers announce each new text (sending, sent). */}
      <p role="status" className="sr-only">
        {sendLink.isPending ? content.sent.sending : sendLink.isSuccess ? content.sent.resent : ""}
      </p>

      <div className="mt-[41px] flex flex-col items-center gap-[14px]">
        <Button
          type="button"
          variant="ghostDark"
          disabled={!canResend}
          onClick={() => sendLink.mutate(email)}
          // Greyed like the 2FA resend link (measured on design/05): link colour at 50 %, countdown in white at 75 %.
          className="disabled:text-primary-200/50 disabled:opacity-100"
        >
          {content.sent.resend}
          {cooldownLeft > 0 && <span className="ml-xs font-normal text-white/75">({cooldownLeft}s)</span>}
        </Button>
        <Button asChild variant="ghostDark">
          <Link href={`/${locale}/login`}>{content.backToSignIn}</Link>
        </Button>
      </div>
    </div>
  );
};
