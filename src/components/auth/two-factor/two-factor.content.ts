import { type Dictionary, insert, t } from "intlayer";

const twoFactorContent = {
  key: "two-factor",
  content: {
    title: t({ fr: "Confirmez votre identité", en: "Confirm your identity" }),
    codeGroupLabel: t({ fr: "Code de vérification à six chiffres", en: "Six-digit verification code" }),
    // Accessible name of each box: "Chiffre 1 sur 6" / "Digit 1 of 6".
    digit: t({ fr: "Chiffre", en: "Digit" }),
    of: t({ fr: "sur", en: "of" }),
    verifying: t({ fr: "Vérification du code…", en: "Checking the code…" }),
    description: {
      appOnly: t({
        fr: "Saisissez le code à six chiffres affiché dans votre application d'authentification.",
        en: "Enter the six-digit code shown in your authenticator app.",
      }),
      appAndEmail: t({
        fr: "Saisissez le code à six chiffres envoyé à l'adresse courriel de votre compte, ou le code affiché dans votre application d'authentification.",
        en: "Enter the six-digit code sent to your account's email address, or the code shown in your authenticator app.",
      }),
      emailOnly: t({
        fr: "Saisissez le code à six chiffres envoyé à l'adresse courriel de votre compte. S'il expire, demandez un nouveau code.",
        en: "Enter the six-digit code sent to your account's email address. If it expires, request a new one.",
      }),
    },
    sendEmailCode: t({ fr: "Envoyer un code par courriel", en: "Send a code by email" }),
    resendCode: t({ fr: "Renvoyer un code", en: "Resend a code" }),
    sendingCode: t({ fr: "Envoi du code…", en: "Sending the code…" }),
    codeSent: t({
      fr: "Un code vient d'être envoyé à l'adresse courriel de votre compte.",
      en: "A code has just been sent to your account's email address.",
    }),
    useRecoveryCode: t({ fr: "Utiliser un code de récupération", en: "Use a recovery code" }),
    backToSignIn: t({ fr: "Retour à la connexion", en: "Back to sign in" }),
    recovery: {
      title: t({ fr: "Saisissez un code de récupération", en: "Enter a recovery code" }),
      field: t({ fr: "Code de récupération", en: "Recovery code" }),
      required: t({ fr: "Saisissez un code de récupération.", en: "Enter a recovery code." }),
      submit: t({ fr: "Valider et se connecter", en: "Verify and sign in" }),
      useVerificationCode: t({ fr: "Utiliser un code de vérification", en: "Use a verification code" }),
      description: t({
        fr: "Utilisez l'un des codes de récupération sauvegardés lors de l'activation de la vérification en deux étapes. Chaque code est à usage unique.",
        en: "Use one of the recovery codes you saved when you turned on two-step verification. Each code can only be used once.",
      }),
    },
    errors: {
      invalidCode: t({ fr: "Code incorrect. Vérifiez-le et réessayez.", en: "Incorrect code. Check it and try again." }),
      invalidBackupCode: t({
        fr: "Code de récupération incorrect ou déjà utilisé.",
        en: "This recovery code is incorrect or has already been used.",
      }),
      codeExpired: t({ fr: "Ce code a expiré. Demandez-en un nouveau.", en: "This code has expired. Request a new one." }),
      tooManyForEmailCode: t({
        fr: "Trop d'essais pour ce code. Demandez-en un nouveau.",
        en: "Too many attempts for this code. Request a new one.",
      }),
      rateLimited: insert(
        t({
          fr: "Trop de tentatives. Réessayez dans {{seconds}} s.",
          en: "Too many attempts. Try again in {{seconds}} s.",
        }),
      ),
      rateLimitedNoDelay: t({
        fr: "Trop de tentatives. Réessayez dans quelques secondes.",
        en: "Too many attempts. Try again in a few seconds.",
      }),
      unknown: t({
        fr: "Une erreur est survenue. Vérifiez votre connexion et réessayez.",
        en: "Something went wrong. Check your connection and try again.",
      }),
    },
    // Dead ends: the boxes can no longer work, only "back to sign in" is offered.
    stopped: {
      attemptExpired: t({
        fr: "Votre tentative de connexion a expiré (10 minutes). Reconnectez-vous pour recevoir un nouveau code.",
        en: "Your sign-in attempt has expired (10 minutes). Sign in again to get a new code.",
      }),
      attemptCancelled: t({
        fr: "Trop de codes incorrects : cette tentative de connexion a été annulée. Reconnectez-vous.",
        en: "Too many incorrect codes: this sign-in attempt was cancelled. Sign in again.",
      }),
      // Better-Auth default lock: 15 minutes (accountLockout.durationSeconds, not changed in auth.ts).
      accountLocked: t({
        fr: "Trop de codes incorrects : votre compte est bloqué pendant environ 15 minutes. Réessayez plus tard.",
        en: "Too many incorrect codes: your account is locked for about 15 minutes. Try again later.",
      }),
    },
  },
} satisfies Dictionary;

export default twoFactorContent;
