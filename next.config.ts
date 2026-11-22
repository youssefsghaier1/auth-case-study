import type { NextConfig } from "next";
import { withIntlayer } from "next-intlayer/server";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
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
