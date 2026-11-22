"use client";

import { useMutation } from "@tanstack/react-query";
import { useIntlayer } from "next-intlayer";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { authClient } from "@/lib/auth-client";
import { type AuthErrorKind, AuthRequestError, runAuthRequest } from "@/lib/auth-errors";
import { sentAtFromRetryAfter, useCooldownSecondsLeft } from "@/lib/resend-cooldown";
import { useSecondsLeft } from "@/lib/use-seconds-left";
import { ATTEMPT_LIFETIME_MS, type PendingSignIn, pendingSignInStore } from "./pending-sign-in";
import { RecoveryForm } from "./recovery-form";
import { getStopReason, type StopReason, useTwoFactorErrorMessage } from "./two-factor-errors";

type TwoFactorScreenProps = {
  pending: PendingSignIn;
  onVerified: () => void;
  /** Back to the sign-in form (the attempt is over or the user gave up). */
  onExit: () => void;
};

/**
 * Second step of the sign-in, shown in place of the form. One component: the title and the six boxes stay,
 * the text and links follow the account's methods. A recovery code screen can replace it, and back.
 */
export const TwoFactorScreen = ({ pending, onVerified, onExit }: TwoFactorScreenProps) => {
  const [view, setView] = useState<"code" | "recovery">("code");
  const [stopReason, setStopReason] = useState<StopReason | null>(null);
  // The server forgets the attempt after 10 minutes: say so as soon as it happens (also right after a reload).
  const attemptSecondsLeft = useSecondsLeft(pending.startedAt + ATTEMPT_LIFETIME_MS);
  const reason = stopReason ?? (attemptSecondsLeft === 0 ? "attempt-expired" : null);

  if (reason) return <StoppedView reason={reason} onExit={onExit} />;

  if (view === "recovery") {
    return (
      <RecoveryForm onVerified={onVerified} onStop={setStopReason} onUseVerificationCode={() => setView("code")} />
    );
  }

  return (
    <CodeVerification
      pending={pending}
      onVerified={onVerified}
      onStop={setStopReason}
      onUseRecoveryCode={() => setView("recovery")}
    />
  );
};

type Mode = "appOnly" | "appAndEmail" | "emailOnly";

const getMode = (methods: PendingSignIn["methods"]): Mode => {
  if (!methods.includes("otp")) return "appOnly";
  return methods.includes("totp") ? "appAndEmail" : "emailOnly";
};

// Errors after which an email code is worth nothing: the same digits are then tried as an app code.
const TRY_APP_CODE_AFTER: AuthErrorKind[] = ["invalid-code", "code-expired", "too-many-attempts"];

type CodeVerificationProps = {
  pending: PendingSignIn;
  onVerified: () => void;
  onStop: (reason: StopReason) => void;
  onUseRecoveryCode: () => void;
};

// designs 03 (app only), 04 (app + email) and 05 (email only).
const CodeVerification = ({ pending, onVerified, onStop, onUseRecoveryCode }: CodeVerificationProps) => {
  const content = useIntlayer("two-factor");
  const errorMessage = useTwoFactorErrorMessage();
  const errorId = useId();
  const [code, setCode] = useState("");
  const mode = getMode(pending.methods);
  const emailCodeSent = pending.emailCodeSentAt !== undefined;

  const sendEmailCode = useMutation({
    mutationFn: () => runAuthRequest((fetchOptions) => authClient.twoFactor.sendOtp({ fetchOptions })),
    onSuccess: () => pendingSignInStore.update({ emailCodeSentAt: Date.now() }),
    onError: (error) => {
      const stop = getStopReason(error, { canRequestNewEmailCode: true });
      if (stop) return onStop(stop);
      // Refused because a code went out less than 30 s ago (e.g. sent just before a reload): align the countdown.
      if (error instanceof AuthRequestError && error.kind === "rate-limited" && error.retryAfterSeconds) {
        pendingSignInStore.update({ emailCodeSentAt: sentAtFromRetryAfter(error.retryAfterSeconds) });
      }
    },
  });
  const { mutate: sendCode } = sendEmailCode;

  // Email-only accounts: one code is sent automatically, at the first arrival only.
  useEffect(() => {
    if (mode !== "emailOnly") return;
    // Read from storage, not from props: Strict Mode runs this effect twice in a row, and a reload runs it again.
    // The marker is written before the request, so both see it and do nothing.
    const current = pendingSignInStore.read();
    if (!current || current.autoSendStartedAt !== undefined || current.emailCodeSentAt !== undefined) return;
    pendingSignInStore.update({ autoSendStartedAt: Date.now() });
    sendCode();
  }, [mode, sendCode]);

  const verify = useMutation({
    mutationFn: async (value: string) => {
      const withApp = () =>
        runAuthRequest((fetchOptions) => authClient.twoFactor.verifyTotp({ code: value, fetchOptions }));
      const withEmail = () =>
        runAuthRequest((fetchOptions) => authClient.twoFactor.verifyOtp({ code: value, fetchOptions }));

      if (mode === "appOnly" || (mode === "appAndEmail" && !emailCodeSent)) return withApp();
      if (mode === "emailOnly") return withEmail();
      // App + email once an email code was sent (strategy A): the email code first, then the app code.
      // A wrong code is then refused twice: 5 wrong codes reach the 10 failures that lock the account.
      try {
        return await withEmail();
      } catch (error) {
        if (error instanceof AuthRequestError && TRY_APP_CODE_AFTER.includes(error.kind)) return withApp();
        throw error;
      }
    },
    onSuccess: onVerified,
    onError: (error) => {
      const stop = getStopReason(error, { canRequestNewEmailCode: mode === "emailOnly" });
      if (stop) onStop(stop);
      else setCode(""); // the boxes are emptied; CodeInput puts the focus back on the first one
    },
  });

  const cooldownLeft = useCooldownSecondsLeft(pending.emailCodeSentAt);
  // Only the countdown and a request in flight block the link: a stale marker from a reload never does.
  const canSend = cooldownLeft === 0 && !sendEmailCode.isPending;
  const sendRefusedForCooldown =
    sendEmailCode.error instanceof AuthRequestError && sendEmailCode.error.kind === "rate-limited";

  const shownError = verify.isError
    ? errorMessage(verify.error)
    : sendEmailCode.isError && !sendRefusedForCooldown
      ? errorMessage(sendEmailCode.error)
      : null;

  const status = verify.isPending
    ? content.verifying
    : sendEmailCode.isPending
      ? content.sendingCode
      : sendEmailCode.isSuccess
        ? content.codeSent
        : "";

  const description = {
    appOnly: content.description.appOnly,
    appAndEmail: content.description.appAndEmail,
    emailOnly: content.description.emailOnly,
  }[mode];

  return (
    <div className="flex flex-col items-center text-center tracking-normal">
      <h1 className="text-lm leading-[1.2] font-semibold">{content.title}</h1>

      <div className="mt-[41px]">
        <CodeInput
          value={code}
          onChange={(value) => {
            setCode(value);
            if (verify.isError) verify.reset(); // typing again hides the previous error
          }}
          onComplete={(value) => verify.mutate(value)}
          label={content.codeGroupLabel.value}
          boxLabel={(position, total) => `${content.digit.value} ${position} ${content.of.value} ${total}`}
          disabled={verify.isPending || verify.isSuccess}
          invalid={verify.isError}
          errorId={shownError ? errorId : undefined}
        />
      </div>

      {shownError && (
        <p id={errorId} role="alert" className="mt-sm text-sx text-danger">
          {shownError}
        </p>
      )}
      {/* Always present, so screen readers announce each new text (checking, sending, sent). */}
      <p role="status" className="sr-only">
        {status}
      </p>

      <div className="mt-[10px] flex flex-col items-center gap-[3px]">
        {mode !== "appOnly" && (
          <Button
            type="button"
            variant="ghostDark"
            disabled={!canSend}
            onClick={() => sendCode()}
            // Greyed as in design/05 (measured): link colour at 50 % and the countdown in white at 75 %,
            // instead of the kit's default disabled look (whole button at 30 % opacity).
            className="disabled:text-primary-200/50 disabled:opacity-100"
          >
            {mode === "appAndEmail" && !emailCodeSent ? content.sendEmailCode : content.resendCode}
            {cooldownLeft > 0 && <span className="ml-xs font-normal text-white/75">({cooldownLeft}s)</span>}
          </Button>
        )}
        <Button type="button" variant="ghostDark" onClick={onUseRecoveryCode}>
          {content.useRecoveryCode}
        </Button>
      </div>

      <p className="mt-[40px] text-s leading-[1.2] font-light text-white/80">{description}</p>
    </div>
  );
};

// The attempt cannot succeed any more: say why, and offer one way out instead of boxes that cannot work.
const StoppedView = ({ reason, onExit }: { reason: StopReason; onExit: () => void }) => {
  const content = useIntlayer("two-factor");
  const message = {
    "attempt-expired": content.stopped.attemptExpired,
    "attempt-cancelled": content.stopped.attemptCancelled,
    "account-locked": content.stopped.accountLocked,
  }[reason];

  return (
    <div className="flex flex-col items-center gap-xl text-center tracking-normal">
      <h1 className="text-lm leading-[1.2] font-semibold">{content.title}</h1>
      <p role="alert" className="text-s text-danger">
        {message}
      </p>
      <Button
        type="button"
        variant="primary"
        alignment="center"
        textSize="base"
        onClick={onExit}
        className="h-[51px] w-full"
      >
        {content.backToSignIn}
      </Button>
    </div>
  );
};
