import { useMemo, useSyncExternalStore } from "react";
import { z } from "zod";

/** The server forgets a sign-in attempt after 10 minutes (2FA cookie, Better-Auth default of 600 s). */
export const ATTEMPT_LIFETIME_MS = 10 * 60 * 1000;
/** Same as RESEND_COOLDOWN_SECONDS in src/lib/auth.ts (not imported: that module is server-only). */
export const RESEND_COOLDOWN_MS = 30 * 1000;

const STORAGE_KEY = "stolos:pending-sign-in";

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

// sessionStorage can be blocked (privacy settings): an in-memory copy keeps the screen working, without the reload.
let memoryCopy: string | null = null;
const listeners = new Set<() => void>();

const readRaw = (): string | null => {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryCopy;
  }
};

const writeRaw = (raw: string | null) => {
  memoryCopy = raw;
  try {
    if (raw === null) window.sessionStorage.removeItem(STORAGE_KEY);
    else window.sessionStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // Blocked storage: the memory copy is used instead.
  }
  listeners.forEach((listener) => listener());
};

// Anything unexpected in storage (edited by hand, older format) counts as "no pending sign-in".
const parse = (raw: string | null): PendingSignIn | null => {
  if (!raw) return null;
  try {
    const result = pendingSignInSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

/** Read and write the pending sign-in of this tab (call from event handlers and effects only). */
export const pendingSignInStore = {
  read: () => parse(readRaw()),
  start: (email: string, methods: PendingSignIn["methods"]) =>
    writeRaw(JSON.stringify({ email, methods, startedAt: Date.now() } satisfies PendingSignIn)),
  update: (patch: Partial<PendingSignIn>) => {
    const current = parse(readRaw());
    if (current) writeRaw(JSON.stringify({ ...current, ...patch }));
  },
  clear: () => writeRaw(null),
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * The pending sign-in of this tab, or null (on the server, in a new tab, or once it is over).
 * useSyncExternalStore: the server and the first client render see null, then React re-renders with the stored value,
 * without a hydration error.
 */
export const usePendingSignIn = () => {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => parse(raw), [raw]);
};
