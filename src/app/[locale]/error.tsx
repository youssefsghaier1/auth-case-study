"use client";

import { useIntlayer } from "next-intlayer";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

// Error boundary of every page under /fr and /en: same frame as the other screens, a short message and a retry.
// A server error reaches the browser without its details (Next.js only sends a digest), so none are shown.
export default function LocaleError({ retry }: { error: unknown; retry: () => void }) {
  const content = useIntlayer("error-page");

  return (
    <AuthShell>
      <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-xl text-center tracking-normal">
        <h1 className="text-lm leading-[1.2] font-semibold">{content.title}</h1>
        <p role="alert" className="text-s text-white/80">
          {content.description}
        </p>
        <Button
          type="button"
          variant="primary"
          alignment="center"
          textSize="base"
          onClick={() => retry()}
          className="h-[51px] w-full"
        >
          {content.retry}
        </Button>
      </div>
    </AuthShell>
  );
}
