import { getIntlayer } from "intlayer";
import { getRouteLocale } from "@/lib/locale";

// Temporary page: shows the shared frame with real text. Replaced by the login card later.
export default async function LoginPage() {
  const locale = await getRouteLocale();
  const content = getIntlayer("login-page", locale);

  return (
    <div className="flex flex-col items-center gap-s text-center">
      <h1 className="text-lm font-semibold">{content.title}</h1>
      <p className="text-s text-white/80">{content.subtitle}</p>
    </div>
  );
}
