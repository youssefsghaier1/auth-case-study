import { inter } from "@/lib/fonts";
import "../globals.css";

// Root layout of the /code helper page, which lives outside the translated [locale] routes.
export default function CodeLayout({ children }: LayoutProps<"/code">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
