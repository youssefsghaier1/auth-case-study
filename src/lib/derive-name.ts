/**
 * The server requires a `name` at sign-up but the design has no name field:
 * derive it from the part of the email before "@" ("jean.dupont_92@x.fr" -> "jean dupont 92").
 * Never empty: if cleaning removes everything (e.g. "._@x.fr"), keep the raw local part.
 */
export const deriveNameFromEmail = (email: string) => {
  const localPart = email.trim().split("@")[0] ?? "";
  const cleaned = localPart.replace(/[._]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned || localPart || email.trim();
};
