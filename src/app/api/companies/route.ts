import { isDeclaredLocale } from "intlayer";
import type { NextRequest } from "next/server";
import { getCompanies } from "@/lib/companies";

// GET /api/companies?locale=fr|en -> the companies shown behind the auth screens.
// Reading the query string makes this handler run at request time (not prerendered).
export function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale");
  if (!isDeclaredLocale(locale)) {
    return Response.json({ error: "Unknown or missing locale" }, { status: 400 });
  }
  return Response.json(getCompanies(locale));
}
