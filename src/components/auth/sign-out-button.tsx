"use client";

import { useMutation } from "@tanstack/react-query";
import { useIntlayer, useLocale } from "next-intlayer";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { runAuthRequest } from "@/lib/auth-errors";

export const SignOutButton = () => {
  const { signOut: label, signOutError } = useIntlayer("account-page");
  const { locale } = useLocale();

  const signOut = useMutation({
    mutationFn: () => runAuthRequest((fetchOptions) => authClient.signOut({ fetchOptions })),
    // A full page load, not a client navigation: it empties Next's in-memory router cache, and
    // `replace` swaps this history entry for the login page, so Back cannot show the account page again.
    onSuccess: () => window.location.replace(`/${locale}/login`),
  });

  return (
    <div className="flex w-full flex-col gap-m">
      {signOut.isError && (
        <p role="alert" className="text-center text-sx text-danger">
          {signOutError}
        </p>
      )}
      <Button
        type="button"
        variant="primary"
        alignment="center"
        textSize="base"
        isLoading={signOut.isPending || signOut.isSuccess}
        onClick={() => signOut.mutate()}
        className="h-[51px] w-full"
      >
        {label}
      </Button>
    </div>
  );
};
