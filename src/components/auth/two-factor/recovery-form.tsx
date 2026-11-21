"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useIntlayer } from "next-intlayer";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { authClient } from "@/lib/auth-client";
import { runAuthRequest } from "@/lib/auth-errors";
import { getStopReason, type StopReason, useTwoFactorErrorMessage } from "./two-factor-errors";

type RecoveryFormProps = {
  onVerified: () => void;
  onStop: (reason: StopReason) => void;
  onUseVerificationCode: () => void;
};

// Recovery code screen (design/06-recovery.png): one-time codes saved when 2FA was turned on.
export const RecoveryForm = ({ onVerified, onStop, onUseVerificationCode }: RecoveryFormProps) => {
  const content = useIntlayer("two-factor");
  const errorMessage = useTwoFactorErrorMessage();

  const schema = z.object({ recoveryCode: z.string().trim().min(1, { error: content.recovery.required.value }) });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { recoveryCode: "" } });

  const verify = useMutation({
    mutationFn: ({ recoveryCode }: z.infer<typeof schema>) =>
      runAuthRequest((fetchOptions) => authClient.twoFactor.verifyBackupCode({ code: recoveryCode, fetchOptions })),
    onSuccess: onVerified,
    onError: (error) => {
      const reason = getStopReason(error);
      if (reason) onStop(reason);
    },
  });

  const isBusy = verify.isPending || verify.isSuccess;
  // Server errors are shown on the field itself, so they are linked to it (aria-describedby) and announced.
  const fieldError = errors.recoveryCode?.message ?? (verify.isError ? errorMessage(verify.error) : undefined);

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => verify.mutate(values))}
      className="flex flex-col items-center text-center tracking-normal"
    >
      <h1 className="text-lm leading-[1.2] font-semibold">{content.recovery.title}</h1>

      <TextField
        id="recovery-code"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        label={content.recovery.field.value}
        errorMessage={fieldError}
        className="mt-[40px] text-left"
        {...register("recoveryCode")}
      />

      <p role="status" className="sr-only">
        {verify.isPending ? content.verifying : ""}
      </p>

      <Button
        type="submit"
        variant="primary"
        alignment="center"
        textSize="base"
        isLoading={isBusy}
        className="mt-2xl h-[51px] w-full"
      >
        {content.recovery.submit}
      </Button>

      <Button type="button" variant="ghostDark" className="mt-[40px]" onClick={onUseVerificationCode}>
        {content.recovery.useVerificationCode}
      </Button>

      <p className="mt-[40px] text-s leading-[1.2] font-light text-white/80">{content.recovery.description}</p>
    </form>
  );
};
