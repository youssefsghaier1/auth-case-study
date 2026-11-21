"use client";

import { useIntlayer } from "next-intlayer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthTabs } from "./auth-tabs";
import { LoginForm, type TwoFactorMethod } from "./login-form";
import { SignupForm } from "./signup-form";

type Tab = "login" | "signup";

// Content of the glass card on /login: sign-in and sign-up tabs, switched without reloading the page.
export const LoginCard = () => {
  const content = useIntlayer("login-card");
  const [tab, setTab] = useState<Tab>("login");
  // Kept in memory only for now; the 2FA step will persist it and replace the placeholder below.
  const [twoFactorMethods, setTwoFactorMethods] = useState<TwoFactorMethod[] | null>(null);

  if (twoFactorMethods) {
    return <TwoFactorPlaceholder methods={twoFactorMethods} onBack={() => setTwoFactorMethods(null)} />;
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
            { id: "login", label: content.tabs.login, panel: <LoginForm onTwoFactorRequired={setTwoFactorMethods} /> },
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

// Temporary screen, clearly marked: the real 2FA screen comes in the next step.
const TwoFactorPlaceholder = ({ methods, onBack }: { methods: TwoFactorMethod[]; onBack: () => void }) => {
  const { twoFactorPlaceholder: text } = useIntlayer("login-card");

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-xl text-center">
      <h1 className="text-lm leading-[1.2] font-semibold">{text.title}</h1>
      <p className="rounded-s border border-dashed border-warning/60 px-m py-sm text-sx text-warning">{text.notice}</p>
      <div className="text-s">
        <p>{text.methodsLabel}</p>
        <ul className="mt-xs">
          {methods.map((method) => (
            <li key={method}>{text[method]}</li>
          ))}
        </ul>
      </div>
      <Button type="button" variant="ghostDark" onClick={onBack}>
        {text.back}
      </Button>
    </div>
  );
};
