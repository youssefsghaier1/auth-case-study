import { getIntlayer } from "intlayer";
import { getRouteLocale } from "@/lib/locale";

// Temporary page: proves that /fr/login and /en/login read the right dictionary. Replaced by the login card later.
export default async function LoginPage() {
  const locale = await getRouteLocale();
  const content = getIntlayer("login-page", locale);

  return (
    <main className="mx-auto flex w-full max-w-[36rem] flex-col gap-4 p-8">
      <h1 className="text-m font-semibold">{content.title}</h1>
      <p className="text-sx text-white/60">{content.subtitle}</p>
      <p className="text-xs text-white/40">locale: {locale}</p>
    </main>
  );
}
