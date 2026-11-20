import { isDeclaredLocale } from "intlayer";
import { notFound } from "next/navigation";
import { locale as localeParam } from "next/root-params";

/** Locale of the current route (/fr/... or /en/...), for Server Components. An unknown locale renders a 404. */
export const getRouteLocale = async () => {
  const locale = await localeParam();
  if (!isDeclaredLocale(locale)) notFound();
  return locale;
};
