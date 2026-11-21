import { type Dictionary, t } from "intlayer";

const accountPageContent = {
  key: "account-page",
  content: {
    title: t({ fr: "Vous êtes connecté", en: "You are signed in" }),
    signedInAs: t({ fr: "Connecté en tant que", en: "Signed in as" }),
    loading: t({ fr: "Chargement de votre compte…", en: "Loading your account…" }),
    signOut: t({ fr: "Se déconnecter", en: "Sign out" }),
    signOutError: t({
      fr: "La déconnexion a échoué. Vérifiez votre connexion et réessayez.",
      en: "Signing out failed. Check your connection and try again.",
    }),
  },
} satisfies Dictionary;

export default accountPageContent;
