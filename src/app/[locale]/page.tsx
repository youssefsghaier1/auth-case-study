import { redirect } from "next/navigation";
import { getRouteLocale } from "@/lib/locale";

// /fr and /en have no screen of their own: send the user to the login page.
export default async function LocaleHomePage() {
  const locale = await getRouteLocale();
  redirect(`/${locale}/login`);
}
