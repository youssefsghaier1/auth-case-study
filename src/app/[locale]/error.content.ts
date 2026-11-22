import { type Dictionary, t } from "intlayer";

// Error state of the pages (not in the design): shown when the server cannot answer (database or auth unreachable).
const errorPageContent = {
  key: "error-page",
  content: {
    title: t({ fr: "Une erreur est survenue", en: "Something went wrong" }),
    description: t({
      fr: "Le service ne répond pas pour le moment. Réessayez dans un instant.",
      en: "The service is not responding right now. Try again in a moment.",
    }),
    retry: t({ fr: "Réessayer", en: "Try again" }),
  },
} satisfies Dictionary;

export default errorPageContent;
