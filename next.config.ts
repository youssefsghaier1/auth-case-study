import type { NextConfig } from "next";
import { withIntlayer } from "next-intlayer/server";

// Headers that change nothing for the app's own requests (all same-origin fetch calls).
// No script-src: a strict script policy needs a nonce per request, which prerendered (static) pages cannot carry.
const securityHeaders = [
  // No other site may show these pages in a frame (clickjacking). X-Frame-Options is the same rule for old browsers.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'" },
  { key: "X-Frame-Options", value: "DENY" },
  // The browser trusts the announced Content-Type and never guesses another one.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // The browser default, written out: other sites only see the origin, never a full URL.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

// The reset token sits in these URLs: they never send a Referer at all (the last matching rule wins).
const noReferrer = [{ key: "Referrer-Policy", value: "no-referrer" }];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false, // no "X-Powered-By: Next.js": nothing to gain from announcing the framework
  headers: async () => [
    { source: "/:path*", headers: securityHeaders },
    { source: "/:locale/reset-password", headers: noReferrer },
    { source: "/api/auth/reset-password/:token", headers: noReferrer },
  ],
  // `next dev` prints every request with its full URL: keep the reset token out of the terminal
  // (/[locale]/reset-password?token=… and the email link /api/auth/reset-password/<token>). Production does not log requests.
  logging: { incomingRequests: { ignore: [/\/reset-password/] } },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// Async on purpose: Intlayer builds the dictionaries before Next.js starts.
export default withIntlayer(nextConfig);
