import { z } from "zod";
import { createSessionStore } from "@/lib/session-store";

/** The server forgets a sign-in attempt after 10 minutes (2FA cookie, Better-Auth default of 600 s). */
export const ATTEMPT_LIFETIME_MS = 10 * 60 * 1000;

// What the 2FA screen needs to come back after a reload. Never the password.
const pendingSignInSchema = z.object({
  email: z.string(),
  methods: z.array(z.enum(["totp", "otp"])).min(1),
  startedAt: z.number(),
  /** Written just before the automatic first send: a second automatic send (Strict Mode, reload) sees it and stops. */
  autoSendStartedAt: z.number().optional(),
  /** When the server accepted the last email code: the 30 s countdown is computed from it. */
  emailCodeSentAt: z.number().optional(),
});

export type PendingSignIn = z.infer<typeof pendingSignInSchema>;

const store = createSessionStore("stolos:pending-sign-in", pendingSignInSchema);

/** Read and write the pending sign-in of this tab (call from event handlers and effects only). */
export const pendingSignInStore = {
  read: store.read,
  start: (email: string, methods: PendingSignIn["methods"]) => store.write({ email, methods, startedAt: Date.now() }),
  update: store.update,
  clear: store.clear,
};

/** The pending sign-in of this tab, or null (on the server, in a new tab, or once it is over). */
export const usePendingSignIn = store.useValue;
