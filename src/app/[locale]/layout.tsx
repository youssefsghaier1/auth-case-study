import type { Metadata } from "next";
import { IntlayerProvider } from "next-intlayer/server";
import { QueryProvider } from "@/components/providers/query-provider";
import { inter } from "@/lib/fonts";
import { getRouteLocale } from "@/lib/locale";
import "../globals.css";

// Pre-renders /fr and /en at build time (required by Cache Components for the [locale] root param).
export { generateStaticParams } from "next-intlayer";

export const metadata: Metadata = {
  title: "Stolos",
};

// Root layout of every translated page: sets <html lang> and gives the locale to client components.
export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await getRouteLocale();

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <IntlayerProvider locale={locale}>
          <QueryProvider>{children}</QueryProvider>
        </IntlayerProvider>
      </body>
    </html>
  );
}
