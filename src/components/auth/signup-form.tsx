"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useIntlayer, useLocale } from "next-intlayer";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { TextField } from "@/components/ui/text-field";
import { authClient } from "@/lib/auth-client";
import { runAuthRequest } from "@/lib/auth-errors";
import { deriveNameFromEmail } from "@/lib/derive-name";
import { createSignupSchema, type SignupValues } from "./auth-schemas";
import { useAuthMessages } from "./use-auth-messages";

export const SignupForm = () => {
  const { signup } = useIntlayer("login-card");
  const { fields, validationMessages, visibilityLabels, serverErrorMessage } = useAuthMessages();
  const { locale } = useLocale();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(createSignupSchema(validationMessages)),
    defaultValues: { signupEmail: "", signupPassword: "", signupPasswordConfirm: "" },
  });

  const signUp = useMutation({
    mutationFn: ({ signupEmail, signupPassword }: SignupValues) =>
      runAuthRequest((fetchOptions) =>
        authClient.signUp.email({
          name: deriveNameFromEmail(signupEmail),
          email: signupEmail,
          password: signupPassword,
          fetchOptions,
        }),
      ),
    // The server signs the new user in (Better-Auth autoSignIn, on by default): go straight to the account page.
    onSuccess: () => router.replace(`/${locale}/account`),
  });

  return (
    // method="post": a form sent before React has loaded must not put the fields (password) in the URL.
    <form method="post" noValidate onSubmit={handleSubmit((values) => signUp.mutate(values))} className="flex flex-col">
      <div className="flex flex-col gap-[17px]">
        <TextField
          id="signup-email"
          type="email"
          autoComplete="username"
          label={fields.email.value}
          errorMessage={errors.signupEmail?.message}
          {...register("signupEmail")}
        />
        <PasswordInput
          id="signup-password"
          autoComplete="new-password"
          label={fields.password.value}
          visibilityLabels={visibilityLabels}
          errorMessage={errors.signupPassword?.message}
          {...register("signupPassword")}
        />
        <PasswordInput
          id="signup-password-confirm"
          autoComplete="new-password"
          label={fields.confirmPassword.value}
          visibilityLabels={visibilityLabels}
          errorMessage={errors.signupPasswordConfirm?.message}
          {...register("signupPasswordConfirm")}
        />
      </div>

      {signUp.isError && (
        <p role="alert" className="mt-xl text-sx text-danger">
          {serverErrorMessage(signUp.error)}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        alignment="center"
        textSize="base"
        isLoading={signUp.isPending || signUp.isSuccess}
        className="mt-2xl h-[51px] w-full"
      >
        {signup.submit}
      </Button>
    </form>
  );
};
