import { Suspense } from "react";
import { LoginCard } from "@/components/auth/login-card";
import { ResetSuccessNotice } from "@/components/auth/password-reset/reset-success-notice";
import { redirectIfSignedIn } from "@/lib/session";

// Sign-in and sign-up in one card (the AuthShell frame comes from the (auth) layout).
// What reads the request (cookies, searchParams) sits inside <Suspense>: the card stays in the prerendered shell.
export default function LoginPage({ searchParams }: PageProps<"/[locale]/login">) {
  return (
    <>
      <Suspense fallback={null}>
        <SignedInRedirect />
      </Suspense>
      <Suspense fallback={null}>
        <ResetSuccessNotice searchParams={searchParams} />
      </Suspense>
      <LoginCard />
    </>
  );
}

// Renders nothing: it only sends a signed-in user to the account page (checked on the server, at request time).
async function SignedInRedirect() {
  await redirectIfSignedIn();
  return null;
}
