import { type Dictionary, t } from "intlayer";

// Temporary page: replaced by the real forgot-password form in a later step.
const forgotPasswordPageContent = {
  key: "forgot-password-page",
  content: {
    title: t({ fr: "Mot de passe oublié ?", en: "Forgot your password?" }),
    notice: t({
      fr: "Page provisoire : le formulaire de réinitialisation sera construit à une prochaine étape.",
      en: "Temporary page: the reset form will be built in a later step.",
    }),
    backToLogin: t({ fr: "Retour à la connexion", en: "Back to sign in" }),
  },
} satisfies Dictionary;

export default forgotPasswordPageContent;
