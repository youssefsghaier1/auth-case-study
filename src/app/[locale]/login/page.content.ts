import { type Dictionary, t } from "intlayer";

const loginPageContent = {
  key: "login-page",
  content: {
    title: t({
      fr: "Ravi de vous revoir sur Stolos !",
      en: "Welcome back to Stolos!",
    }),
    subtitle: t({
      fr: "Connectez-vous à votre compte",
      en: "Sign in to your account",
    }),
  },
} satisfies Dictionary;

export default loginPageContent;
