// Adds the locale to URLs that have none: /login -> /fr/login or /en/login
// (stored locale, then the browser's Accept-Language, then the default locale).
export { intlayerProxy as proxy } from "next-intlayer/proxy";

export const config = {
  // Skip the auth API, the /code helper page, Next.js internals and files with an extension (logo, favicon).
  matcher: "/((?!api/|code$|_next/|.*\\..*).*)",
};
