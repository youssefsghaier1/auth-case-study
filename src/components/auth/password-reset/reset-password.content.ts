import { type Dictionary, t } from "intlayer";

const resetPasswordContent = {
  key: "reset-password",
  content: {
    // design/10-new-password.png
    form: {
      title: t({ fr: "Créez un nouveau mot de passe", en: "Create a new password" }),
      description: t({
        fr: "Choisissez un nouveau mot de passe pour votre compte.",
        en: "Choose a new password for your account.",
      }),
      newPassword: t({ fr: "Nouveau mot de passe", en: "New password" }),
      confirmPassword: t({ fr: "Confirmez le mot de passe", en: "Confirm the password" }),
      submit: t({ fr: "Enregistrer le mot de passe", en: "Save the password" }),
      saving: t({ fr: "Enregistrement du mot de passe…", en: "Saving the password…" }),
    },
    // Not in the design: one screen for every unusable link.
    invalidLink: {
      title: t({ fr: "Ce lien ne fonctionne pas", en: "This link does not work" }),
      missing: t({
        fr: "Ce lien ne contient pas de code de réinitialisation. Ouvrez le lien reçu par courriel, ou demandez-en un nouveau.",
        en: "This link has no reset code. Open the link from the email, or request a new one.",
      }),
      invalid: t({
        fr: "Ce lien de réinitialisation n'est plus valide : il a expiré (1 heure), a déjà servi, ou un lien plus récent l'a remplacé.",
        en: "This reset link is no longer valid: it expired (1 hour), was already used, or a newer link replaced it.",
      }),
      requestNewLink: t({ fr: "Demander un nouveau lien", en: "Request a new link" }),
    },
    backToSignIn: t({ fr: "Retour à la connexion", en: "Back to sign in" }),
    loading: t({ fr: "Vérification du lien…", en: "Checking the link…" }),
    unknownError: t({
      fr: "Une erreur est survenue. Vérifiez votre connexion et réessayez.",
      en: "Something went wrong. Check your connection and try again.",
    }),
    // Shown on /login?reset=success.
    successNotice: t({
      fr: "Votre mot de passe a été modifié. Connectez-vous avec le nouveau.",
      en: "Your password has been changed. Sign in with the new one.",
    }),
  },
} satisfies Dictionary;

export default resetPasswordContent;
