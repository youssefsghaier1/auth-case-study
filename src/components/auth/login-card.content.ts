import { type Dictionary, insert, t } from "intlayer";

const loginCardContent = {
  key: "login-card",
  content: {
    login: {
      title: t({ fr: "Ravi de vous revoir sur Stolos !", en: "Welcome back to Stolos!" }),
      subtitle: t({ fr: "Connectez-vous à votre compte", en: "Sign in to your account" }),
      forgotPassword: t({ fr: "Mot de passe oublié ?", en: "Forgot your password?" }),
      submit: t({ fr: "Se connecter", en: "Sign in" }),
    },
    signup: {
      title: t({ fr: "Bienvenue sur Stolos !", en: "Welcome to Stolos!" }),
      subtitle: t({ fr: "Créez votre compte", en: "Create your account" }),
      submit: t({ fr: "Créer mon compte", en: "Create my account" }),
    },
    tabs: {
      label: t({ fr: "Connexion ou inscription", en: "Sign in or sign up" }),
      login: t({ fr: "Connexion", en: "Sign in" }),
      signup: t({ fr: "Inscription", en: "Sign up" }),
    },
    fields: {
      email: t({ fr: "Adresse courriel", en: "Email address" }),
      password: t({ fr: "Mot de passe", en: "Password" }),
      confirmPassword: t({ fr: "Confirmez le mot de passe", en: "Confirm your password" }),
      showPassword: t({ fr: "Afficher le mot de passe", en: "Show password" }),
      hidePassword: t({ fr: "Masquer le mot de passe", en: "Hide password" }),
    },
    // Zod messages (see auth-schemas.ts).
    validation: {
      emailRequired: t({ fr: "Saisissez votre adresse courriel.", en: "Enter your email address." }),
      emailInvalid: t({ fr: "Cette adresse courriel n'est pas valide.", en: "This email address is not valid." }),
      passwordRequired: t({ fr: "Saisissez votre mot de passe.", en: "Enter your password." }),
      passwordTooShort: t({
        fr: "Le mot de passe doit contenir au moins 8 caractères.",
        en: "Your password must be at least 8 characters long.",
      }),
      passwordTooLong: t({
        fr: "Le mot de passe doit contenir au plus 128 caractères.",
        en: "Your password must be at most 128 characters long.",
      }),
      confirmRequired: t({ fr: "Confirmez votre mot de passe.", en: "Confirm your password." }),
      passwordsMismatch: t({ fr: "Les mots de passe ne correspondent pas.", en: "The passwords do not match." }),
    },
    // Server answers (see src/lib/auth-errors.ts).
    errors: {
      invalidCredentials: t({
        fr: "Adresse courriel ou mot de passe incorrect.",
        en: "Incorrect email address or password.",
      }),
      emailTaken: t({
        fr: "Un compte existe déjà avec cette adresse courriel.",
        en: "An account already exists with this email address.",
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
    footer: {
      terms: t({ fr: "Conditions d'utilisation", en: "Terms of use" }),
      privacy: t({ fr: "Politique de confidentialité", en: "Privacy policy" }),
    },
    redirecting: t({ fr: "Connexion réussie. Ouverture de votre compte…", en: "Signed in. Opening your account…" }),
  },
} satisfies Dictionary;

export default loginCardContent;
