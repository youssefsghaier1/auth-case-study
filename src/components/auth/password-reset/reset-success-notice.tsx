import { getIntlayer } from "intlayer";
import { getRouteLocale } from "@/lib/locale";
import { ResetSuccessToast } from "./reset-success-toast";

type Props = { searchParams: PageProps<"/[locale]/login">["searchParams"] };

/**
 * "Password changed, sign in again", on /login?reset=success. It only states a fact and gives no access:
 * typing the parameter by hand just shows the sentence.
 * It reads searchParams, so the login page renders it inside <Suspense fallback={null}>: the form stays in the
 * prerendered shell, and the message is a fixed toast, so its late arrival does not move the card.
 */
export async function ResetSuccessNotice({ searchParams }: Props) {
  const { reset } = await searchParams;
  if (reset !== "success") return null;
  const content = getIntlayer("reset-password", await getRouteLocale());

  return <ResetSuccessToast message={content.successNotice} />;
}
