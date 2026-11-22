import { Suspense } from "react";
import { LoginCard } from "@/components/auth/login-card";
import { ResetSuccessNotice } from "@/components/auth/password-reset/reset-success-notice";

// Sign-in and sign-up in one card (the AuthShell frame comes from the (auth) layout).
// Only the notice reads searchParams (request data), inside <Suspense>: the card stays in the prerendered shell.
export default function LoginPage({ searchParams }: PageProps<"/[locale]/login">) {
  return (
    <>
      <Suspense fallback={null}>
        <ResetSuccessNotice searchParams={searchParams} />
      </Suspense>
      <LoginCard />
    </>
  );
}
