import { type IntlayerConfig, Locales } from "intlayer";

const config: IntlayerConfig = {
  internationalization: {
    locales: [Locales.FRENCH, Locales.ENGLISH],
    defaultLocale: Locales.FRENCH,
    // A dictionary that misses a translation for one of the locales fails type-checking.
    strictMode: "strict",
  },
  routing: {
    // Every URL carries its locale: /fr/... and /en/... (no unprefixed default).
    mode: "prefix-all",
  },
};

export default config;
