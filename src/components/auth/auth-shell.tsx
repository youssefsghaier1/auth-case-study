import Image from "next/image";
import type { ReactNode } from "react";

// Shared frame of every auth screen: violet background with two glows, the logo, and the glass card.
export const AuthShell = ({ children }: { children: ReactNode }) => (
  // `isolate` keeps the -z-10 background above the <body> background instead of behind it.
  <div className="isolate flex min-h-dvh flex-col items-center px-m">
    {/* Decorative background. Fixed, so it stays in place if a small screen has to scroll. */}
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-(--app-background)">
      {/* Placeholder: the company cards go here, under the dimming layer (later step). */}
      <div className="absolute inset-0" />
      <div className="absolute inset-0 bg-black/30" />
      {/* Sizes measured on the 1920x1080 design (1080 x 720 px and 1440 x 560 px ellipses). */}
      <div className="auth-glow absolute top-0 left-1/2 h-[66.7vh] w-[56.25vw] -translate-x-1/2 -translate-y-1/2" />
      <div className="auth-glow absolute bottom-0 left-1/2 h-[51.9vh] w-[75vw] -translate-x-1/2 translate-y-1/2 [--glow-strength:71%]" />
    </div>

    {/* Logo + card fill at least 88% of the screen height, the card centred below the logo.
        The last 12% stays empty, which puts the card centre at y = 606 on a 1080px screen.
        A card too tall for that space uses the empty 12% first: the page only scrolls if it really does not fit. */}
    <div className="flex min-h-[88dvh] w-full flex-col items-center">
      <header className="pt-[8.7dvh]">
        {/* 169x167 is the natural size of the @2x file; the drawing itself sits slightly left inside it. */}
        <Image src="/logo-stolos@2x.png" alt="Stolos" width={169} height={167} loading="eager" />
      </header>

      <main className="flex w-full flex-1 flex-col items-center justify-center py-m">
        {/* The design card is a light glass (slightly brighter than the page, 1px light border):
            same glassmorphism utility, with its --glass-background variable set for this card only. */}
        <div className="glassmorphism w-full max-w-[595px] rounded-m border border-white/20 p-4xl [--glass-background:rgb(255_255_255/4%)]">
          {children}
        </div>
      </main>
    </div>
  </div>
);
