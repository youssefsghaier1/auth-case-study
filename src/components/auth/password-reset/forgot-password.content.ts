import { type Dictionary, t } from "intlayer";

const forgotPasswordContent = {
  key: "forgot-password",
  content: {
    // design/07-forgot.png
    form: {
      title: t({ fr: "Mot de passe oublié ?", en: "Forgot your password?" }),
      description: t({
        fr: "Saisissez l'adresse courriel de votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe.",
        en: "Enter your account's email address. We will send you a link to reset your password.",
      }),
      email: t({ fr: "Adresse courriel", en: "Email address" }),
      submit: t({ fr: "Envoyer le lien", en: "Send the link" }),
    },
    // design/08-forgot-sent.png: the same text whether the account exists or not.
    sent: {
      title: t({ fr: "Vérifiez votre boîte courriel", en: "Check your inbox" }),
      description: t({
        fr: "Si un compte est associé à cette adresse, vous recevrez un lien pour réinitialiser votre mot de passe. Pensez à vérifier vos courriers indésirables.",
        en: "If an account is linked to this address, you will receive a link to reset your password. Remember to check your spam folder.",
      }),
      resend: t({ fr: "Renvoyer le lien", en: "Resend the link" }),
      sending: t({ fr: "Envoi du lien…", en: "Sending the link…" }),
      resent: t({
        fr: "Si un compte est associé à cette adresse, un nouveau lien vient d'être envoyé.",
        en: "If an account is linked to this address, a new link has just been sent.",
      }),
    },
    backToSignIn: t({ fr: "Retour à la connexion", en: "Back to sign in" }),
    unknownError: t({
      fr: "Une erreur est survenue. Vérifiez votre connexion et réessayez.",
      en: "Something went wrong. Check your connection and try again.",
    }),
  },
} satisfies Dictionary;

export default forgotPasswordContent;
