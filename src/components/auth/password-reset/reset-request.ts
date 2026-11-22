import { z } from "zod";
import { createSessionStore } from "@/lib/session-store";

// The forgot-password request of this tab: what the confirmation and its countdown need after a reload.
const resetRequestSchema = z.object({
  email: z.string(),
  /** Written just before the request: a reload during it still shows the confirmation (a link may have gone out). */
  requestedAt: z.number(),
  /** When the server accepted the last request (or when its 429 says the window started): the countdown uses it. */
  sentAt: z.number().optional(),
});

const store = createSessionStore("stolos:password-reset-request", resetRequestSchema);

/** Read and write the forgot-password request of this tab (call from event handlers and effects only). */
export const resetRequestStore = {
  read: store.read,
  start: (email: string) => store.write({ email, requestedAt: Date.now() }),
  update: store.update,
  clear: store.clear,
};

/** The request of this tab, or null (on the server, in a new tab, or after starting over). */
export const useResetRequest = store.useValue;
