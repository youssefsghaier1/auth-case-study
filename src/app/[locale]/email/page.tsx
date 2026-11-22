import { getIntlayer } from "intlayer";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { getLatestPasswordResetMail } from "@/lib/dev-mail";
import { getRouteLocale } from "@/lib/locale";

type Locale = Awaited<ReturnType<typeof getRouteLocale>>;

/**
 * Dev mailbox (design/09-email.png): the latest password-reset email of any account, as a user would see it.
 * The frame is static and prerendered; the database read waits for the request, behind <Suspense>.
 */
export default async function EmailPage() {
  const locale = await getRouteLocale();
  const content = getIntlayer("email-page", locale);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-linear-160 from-primary-500 to-primary-800 px-m py-2xl tracking-normal">
      <div className="flex w-full max-w-[520px] flex-col items-center">
        <header className="flex items-center gap-s">
          <Image src="/logo-stolos@2x.png" alt="" width={28} height={28} loading="eager" />
          <span className="text-ms font-semibold">{content.brand}</span>
        </header>

        {/* isolate: the faded logo (-z-10) stays above the card background and below the text. */}
        <main className="relative isolate mt-[23px] w-full overflow-hidden rounded-m border border-white/10 bg-linear-160 from-black/40 to-black/55 px-[30px] pt-[45px] pb-[48px] text-center">
          <Image
            src="/logo-stolos@2x.png"
            alt=""
            width={220}
            height={217}
            // Visible on arrival, and measured as the page's Largest Contentful Paint: never lazy.
            loading="eager"
            className="pointer-events-none absolute -bottom-[95px] left-1/2 -z-10 -translate-x-1/2 opacity-[0.07]"
          />
          <Suspense fallback={<EmailSkeleton label={content.loading} />}>
            <LatestResetEmail locale={locale} />
          </Suspense>
        </main>

        <footer className="mt-[29px] text-center text-sx text-white/60">
          {content.footerBeforeBrand}
          <span className="underline">{content.footerBrand}</span>
          {content.footerAfterBrand}
        </footer>
      </div>
    </div>
  );
}

// Request time: always the latest email, read on the server (never from the client).
async function LatestResetEmail({ locale }: { locale: Locale }) {
  await connection();
  const mail = await getLatestPasswordResetMail();
  const content = getIntlayer("email-page", locale);

  if (!mail) {
    return (
      <>
        <h1 className="text-m font-semibold">{content.empty.title}</h1>
        <p className="mt-l text-s leading-[1.5] text-white/60">{content.empty.text}</p>
        <Button asChild variant="primary" alignment="center" textSize="base" className="mt-xl h-11 px-[17px] font-normal">
          <Link href={`/${locale}/forgot-password`}>{content.empty.action}</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <h1 className="text-m font-semibold">{content.title}</h1>
      <Button asChild variant="primary" alignment="center" textSize="base" className="mt-[45px] h-11 px-[17px] font-normal">
        <a href={mail.content}>{content.button}</a>
      </Button>
      {/* Light weight, as measured on the design: the first paragraph then fits on two lines. */}
      <p className="mt-[47px] text-s leading-[1.5] font-light text-white/60">{content.intro}</p>
      <p className="mt-[12px] text-sx leading-[1.43] font-light text-white/45">{content.notYou}</p>
      <p className="mt-[25px] text-xs text-white/45">{content.copyLink}</p>
      <a href={mail.content} className="mt-[3px] block text-xs break-all text-primary hover:underline">
        {mail.content}
      </a>
    </>
  );
}

// Same footprint as the email, so the card does not jump when it arrives.
function EmailSkeleton({ label }: { label: string }) {
  return (
    <div role="status" className="flex flex-col items-center motion-safe:animate-pulse">
      <span className="sr-only">{label}</span>
      <div aria-hidden className="h-[24px] w-[360px] max-w-full rounded-xs bg-white/15" />
      <div aria-hidden className="mt-[45px] h-11 w-[284px] max-w-full rounded-md bg-primary-400/40" />
      <div aria-hidden className="mt-[50px] h-[40px] w-full rounded-xs bg-white/10" />
      <div aria-hidden className="mt-m h-[34px] w-full rounded-xs bg-white/5" />
      <div aria-hidden className="mt-[30px] h-[28px] w-[320px] max-w-full rounded-xs bg-white/5" />
    </div>
  );
}
