import { useMemo, useSyncExternalStore } from "react";
import type { z } from "zod";

/**
 * A small typed store over one sessionStorage key: it survives a reload and is empty in a new tab.
 * - Values are checked with Zod when read: anything unexpected (edited by hand, older format) counts as empty.
 * - If sessionStorage is blocked (privacy settings), an in-memory copy keeps the page working, without the reload.
 * - `useValue` reads it with useSyncExternalStore: the server and the first client render see null, then React
 *   re-renders with the stored value, without a hydration error.
 * Write only from event handlers and effects.
 */
export const createSessionStore = <Schema extends z.ZodType<object>>(key: string, schema: Schema) => {
  type Value = z.infer<Schema>;
  let memoryCopy: string | null = null;
  const listeners = new Set<() => void>();

  const readRaw = (): string | null => {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return memoryCopy;
    }
  };

  const writeRaw = (raw: string | null) => {
    memoryCopy = raw;
    try {
      if (raw === null) window.sessionStorage.removeItem(key);
      else window.sessionStorage.setItem(key, raw);
    } catch {
      // Blocked storage: the memory copy is used instead.
    }
    listeners.forEach((listener) => listener());
  };

  const parse = (raw: string | null): Value | null => {
    if (!raw) return null;
    try {
      const result = schema.safeParse(JSON.parse(raw));
      return result.success ? result.data : null;
    } catch {
      return null;
    }
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    read: () => parse(readRaw()),
    write: (value: Value) => writeRaw(JSON.stringify(value)),
    /** Merges into the stored value; does nothing when there is none. */
    update: (patch: Partial<Value>) => {
      const current = parse(readRaw());
      if (current) writeRaw(JSON.stringify({ ...current, ...patch }));
    },
    clear: () => writeRaw(null),
    useValue: () => {
      const raw = useSyncExternalStore(subscribe, readRaw, () => null);
      return useMemo(() => parse(raw), [raw]);
    },
  };
};
