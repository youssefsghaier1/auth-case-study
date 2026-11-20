import { AuthShell } from "@/components/auth/auth-shell";

// Every screen in the (auth) route group gets the shared frame. The group name is not part of the URL.
export default function AuthLayout({ children }: LayoutProps<"/[locale]">) {
  return <AuthShell>{children}</AuthShell>;
}
