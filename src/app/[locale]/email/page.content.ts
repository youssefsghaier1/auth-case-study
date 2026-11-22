import { type Dictionary, t } from "intlayer";

// design/09-email.png: the reset email, shown as it would look in a mailbox.
const emailPageContent = {
  key: "email-page",
  content: {
    brand: "Stolos",
    title: t({ fr: "Réinitialisez votre mot de passe", en: "Reset your password" }),
    button: t({ fr: "Choisir un nouveau mot de passe", en: "Choose a new password" }),
    intro: t({
      fr: "Nous avons reçu une demande de réinitialisation du mot de passe de votre compte Stolos. Ce lien expire dans une heure.",
      en: "We received a request to reset the password of your Stolos account. This link expires in one hour.",
    }),
    notYou: t({
      fr: "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message : votre mot de passe reste inchangé.",
      en: "If you did not make this request, you can ignore this message: your password stays unchanged.",
    }),
    copyLink: t({ fr: "Ou copiez ce lien dans votre navigateur :", en: "Or copy this link into your browser:" }),
    // Split around the brand name, which is underlined.
    footerBeforeBrand: t({ fr: "Ceci est un message automatique de ", en: "This is an automated message from " }),
    footerBrand: "Histia",
    footerAfterBrand: t({ fr: ". Merci de ne pas y répondre.", en: ". Please do not reply." }),
    loading: t({ fr: "Chargement du dernier courriel…", en: "Loading the latest email…" }),
    empty: {
      title: t({ fr: "Aucun courriel pour l'instant", en: "No email yet" }),
      text: t({
        fr: "Aucune demande de réinitialisation n'a encore été faite. Demandez un lien depuis « Mot de passe oublié ? », puis revenez ici.",
        en: "No reset has been requested yet. Ask for a link from “Forgot your password?”, then come back here.",
      }),
      action: t({ fr: "Demander un lien", en: "Request a link" }),
    },
  },
} satisfies Dictionary;

export default emailPageContent;
