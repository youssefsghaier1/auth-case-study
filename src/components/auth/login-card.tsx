"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useIntlayer, useLocale } from "next-intlayer";
import { useState } from "react";
import { AuthTabs } from "./auth-tabs";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { pendingSignInStore, usePendingSignIn } from "./two-factor/pending-sign-in";
import { TwoFactorScreen } from "./two-factor/two-factor-screen";

type Tab = "login" | "signup";

// Content of the glass card on /login: sign-in and sign-up tabs, switched without reloading the page,
// then the two-factor screen in place of the form when the account needs it.
export const LoginCard = () => {
  const content = useIntlayer("login-card");
  const router = useRouter();
  const { locale } = useLocale();
  const [tab, setTab] = useState<Tab>("login");
  // Kept in sessionStorage: the 2FA screen and its countdown survive a reload (empty in a new tab: the form shows).
  const pendingSignIn = usePendingSignIn();
  const [lastEmail, setLastEmail] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (isRedirecting) {
    return (
      <p role="status" className="flex items-center justify-center gap-s py-2xl text-s">
        <Loader2 aria-hidden className="size-5 motion-safe:animate-spin" />
        {content.redirecting}
      </p>
    );
  }

  if (pendingSignIn) {
    return (
      <TwoFactorScreen
        pending={pendingSignIn}
        onVerified={() => {
          setIsRedirecting(true); // shown while the account page loads, instead of the form coming back
          pendingSignInStore.clear();
          router.replace(`/${locale}/account`);
        }}
        onExit={() => {
          setLastEmail(pendingSignIn.email); // the sign-in form comes back with the email filled in
          pendingSignInStore.clear();
        }}
      />
    );
  }

  const heading = tab === "login" ? content.login : content.signup;

  return (
    // The design uses normal letter spacing (globals.css sets -0.02em for the whole app): measured widths match with it.
    <div className="mx-auto flex w-full max-w-[480px] flex-col tracking-normal">
      <header className="flex flex-col items-center gap-[5px] text-center">
        <h1 className="text-lm leading-[1.2] font-semibold">{heading.title}</h1>
        <p className="text-s text-white/80">{heading.subtitle}</p>
      </header>

      <div className="mt-[43px] flex flex-col gap-xl">
        <AuthTabs
          label={content.tabs.label.value}
          selected={tab}
          onSelect={setTab}
          tabs={[
            {
              id: "login",
              label: content.tabs.login,
              panel: (
                <LoginForm
                  defaultEmail={lastEmail}
                  onTwoFactorRequired={(methods, email) => pendingSignInStore.start(email, methods)}
                />
              ),
            },
            { id: "signup", label: content.tabs.signup, panel: <SignupForm /> },
          ]}
        />
      </div>

      {/* Plain text for now: there are no terms or privacy pages to link to yet. */}
      <p className="mt-[34px] flex justify-center gap-sm text-xs-plus">
        <span>{content.footer.terms}</span>
        <span aria-hidden className="text-white/40">
          |
        </span>
        <span>{content.footer.privacy}</span>
      </p>
    </div>
  );
};
