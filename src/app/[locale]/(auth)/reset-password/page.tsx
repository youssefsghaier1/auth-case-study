import { getIntlayer } from "intlayer";
import { Suspense } from "react";
import { ResetPasswordScreen } from "@/components/auth/password-reset/reset-password-screen";
import { getRouteLocale } from "@/lib/locale";

type SearchParams = PageProps<"/[locale]/reset-password">["searchParams"];

/**
 * Target of the reset link: Better-Auth redirects its GET to /{locale}/reset-password?token=… (or ?error=INVALID_TOKEN).
 * searchParams is request data: this page never awaits it. Only ResetPasswordContent does, inside <Suspense>,
 * so the frame (background, logo, card, skeleton) stays in the prerendered shell.
 */
export default async function ResetPasswordPage({ searchParams }: PageProps<"/[locale]/reset-password">) {
  const locale = await getRouteLocale(); // a root param, known at build time: still static
  const content = getIntlayer("reset-password", locale);

  return (
    <Suspense fallback={<ResetPasswordSkeleton label={content.loading} />}>
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}

// The only dynamic access of the page.
async function ResetPasswordContent({ searchParams }: { searchParams: SearchParams }) {
  const { token, error } = await searchParams;
  return (
    <ResetPasswordScreen
      initialToken={typeof token === "string" && token !== "" ? token : null}
      linkRefused={error === "INVALID_TOKEN"}
    />
  );
}

// Same footprint as the form (design/10), so the card does not jump when it arrives.
function ResetPasswordSkeleton({ label }: { label: string }) {
  return (
    <div role="status" className="flex flex-col items-center motion-safe:animate-pulse">
      <span className="sr-only">{label}</span>
      <div aria-hidden className="h-[34px] w-[380px] max-w-full rounded-xs bg-white/15" />
      <div aria-hidden className="mt-[12px] h-[19px] w-[340px] max-w-full rounded-xs bg-white/10" />
      <div aria-hidden className="mt-[40px] h-[48px] w-full rounded-sm bg-white/5" />
      <div aria-hidden className="mt-[17px] h-[48px] w-full rounded-sm bg-white/5" />
      <div aria-hidden className="mt-2xl h-[51px] w-full rounded-md bg-primary-400/40" />
      <div aria-hidden className="mt-[40px] h-[21px] w-[150px] rounded-xs bg-white/10" />
    </div>
  );
}
