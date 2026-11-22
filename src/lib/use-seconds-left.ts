import { useEffect, useState } from "react";

/**
 * Whole seconds left until `deadline` (a Date.now() timestamp), or 0 when it is past or undefined.
 * Always recomputed from the clock (4 times a second), never decremented: it stays right after a reload
 * or when the tab was in the background.
 * Use it only in components that render in the browser (e.g. shown from sessionStorage state): it reads the clock,
 * and Cache Components refuses Date.now() while prerendering.
 */
export const useSecondsLeft = (deadline: number | undefined) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  return deadline === undefined ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000));
};
