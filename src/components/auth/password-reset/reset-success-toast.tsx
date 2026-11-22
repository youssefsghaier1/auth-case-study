"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const subscribeToNothing = () => () => {};
/** false on the server and during hydration, true once the page runs in the browser. */
const useIsInBrowser = () =>
  useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

/**
 * The "password changed" message, fixed at the top of the screen so nothing on the page moves when it appears
 * (it streams in after the first paint). Rendered into <body>: inside the glass card, whose backdrop-filter
 * traps fixed elements, it would be positioned against the card instead of the screen.
 */
export const ResetSuccessToast = ({ message }: { message: string }) => {
  const isInBrowser = useIsInBrowser();
  if (!isInBrowser) return null;

  return createPortal(
    <p
      role="status"
      // Above the logo: one line on a computer, two on a phone, without touching the logo drawing.
      className="fixed inset-x-m top-s z-50 mx-auto max-w-[600px] rounded-s border border-success/60 bg-success-100 px-m py-s text-center text-sx tracking-normal backdrop-blur-xs"
    >
      {message}
    </p>,
    document.body,
  );
};
