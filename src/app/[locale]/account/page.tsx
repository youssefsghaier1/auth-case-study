import { getIntlayer } from "intlayer";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getRouteLocale } from "@/lib/locale";
import { getCurrentUser } from "@/lib/session";

// Protected page. The frame (background, logo, card) is static and prerendered; only the part that
// reads the session waits for the request, behind <Suspense> (required by Cache Components).
export default async function AccountPage() {
  const locale = await getRouteLocale();
  const content = getIntlayer("account-page", locale);

  return (
    <AuthShell>
      <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-2xl text-center tracking-normal">
        <h1 className="text-lm leading-[1.2] font-semibold">{content.title}</h1>
        <Suspense fallback={<AccountSkeleton loadingLabel={content.loading} />}>
          <AccountDetails locale={locale} />
        </Suspense>
      </div>
    </AuthShell>
  );
}

// Runs at request time. Without a valid session, getCurrentUser() redirects before anything below is rendered.
async function AccountDetails({ locale }: { locale: Parameters<typeof getIntlayer>[1] }) {
  const user = await getCurrentUser();
  const content = getIntlayer("account-page", locale);

  return (
    <>
      <div className="flex w-full flex-col gap-xs rounded-s border border-white/20 bg-white/5 px-xl py-l">
        <p className="text-sx text-white/60">{content.signedInAs}</p>
        <p className="text-ms font-semibold break-words">{user.name}</p>
        <p className="text-s break-all text-white/80">{user.email}</p>
      </div>
      <SignOutButton />
    </>
  );
}

// Same footprint as the details, so the card does not jump when they arrive.
function AccountSkeleton({ loadingLabel }: { loadingLabel: string }) {
  return (
    <div role="status" className="flex w-full flex-col items-center gap-2xl">
      <span className="sr-only">{loadingLabel}</span>
      <div aria-hidden className="flex w-full flex-col items-center gap-s rounded-s border border-white/20 bg-white/5 px-xl py-l motion-safe:animate-pulse">
        <div className="h-[14px] w-[140px] rounded-xs bg-white/10" />
        <div className="h-[22px] w-[200px] rounded-xs bg-white/15" />
        <div className="h-[18px] w-[240px] rounded-xs bg-white/10" />
      </div>
      <div aria-hidden className="h-[51px] w-full rounded-md bg-primary-400/40 motion-safe:animate-pulse" />
    </div>
  );
}
