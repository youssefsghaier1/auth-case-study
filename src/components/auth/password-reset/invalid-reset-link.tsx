"use client";

import Link from "next/link";
import { useIntlayer, useLocale } from "next-intlayer";
import { Button } from "@/components/ui/button";
import { resetRequestStore } from "./reset-request";

/** Why the link cannot be used: no token at all, or a token the server refuses (invalid, expired, used, replaced). */
export type InvalidLinkReason = "missing" | "invalid";

// The same screen for every unusable reset link, with the way out: request a new link.
export const InvalidResetLink = ({ reason }: { reason: InvalidLinkReason }) => {
  const content = useIntlayer("reset-password");
  const { locale } = useLocale();

  return (
    <div className="flex flex-col items-center text-center tracking-normal">
      <h1 className="text-lm leading-[1.2] font-semibold">{content.invalidLink.title}</h1>
      <p role="alert" className="mt-[12px] text-s leading-[1.2] font-light text-white/80">
        {reason === "missing" ? content.invalidLink.missing : content.invalidLink.invalid}
      </p>
      <Button asChild variant="primary" alignment="center" textSize="base" className="mt-2xl h-[51px] w-full">
        {/* Starts on the form, not on the confirmation of an earlier request in this tab. */}
        <Link href={`/${locale}/forgot-password`} onClick={() => resetRequestStore.clear()}>
          {content.invalidLink.requestNewLink}
        </Link>
      </Button>
      <Button asChild variant="ghostDark" className="mt-[40px]">
        <Link href={`/${locale}/login`}>{content.backToSignIn}</Link>
      </Button>
    </div>
  );
};
