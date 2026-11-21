import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getRouteLocale } from "@/lib/locale";

/** Only what the account page shows: never the raw session or its token. */
export type CurrentUser = { name: string; email: string };

/**
 * The signed-in user, checked on the server at every request (data access layer).
 * Better-Auth looks the session up in the database: a missing, forged, expired or signed-out
 * session gives `null`, and the visitor is sent to the login page before any user data is rendered.
 * It reads the request headers, so callers must sit behind a <Suspense> boundary (Cache Components).
 */
export const getCurrentUser = async (): Promise<CurrentUser> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/${await getRouteLocale()}/login`);
  return { name: session.user.name, email: session.user.email };
};
