import { getIntlayer } from "intlayer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getRouteLocale } from "@/lib/locale";

// Temporary page so the "forgot password" link does not lead to a 404. Replaced in a later step.
export default async function ForgotPasswordPage() {
  const locale = await getRouteLocale();
  const content = getIntlayer("forgot-password-page", locale);

  return (
    <div className="flex flex-col items-center gap-xl text-center">
      <h1 className="text-lm leading-[1.2] font-semibold">{content.title}</h1>
      <p className="rounded-s border border-dashed border-warning/60 px-m py-sm text-sx text-warning">{content.notice}</p>
      <Button asChild variant="ghostDark">
        <Link href={`/${locale}/login`}>{content.backToLogin}</Link>
      </Button>
    </div>
  );
}
