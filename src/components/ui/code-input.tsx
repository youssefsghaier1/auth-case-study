"use client";

import { type ClipboardEvent, type KeyboardEvent, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type CodeInputProps = {
  /** The digits typed so far, from the first box (e.g. "123" = three boxes filled). */
  value: string;
  onChange: (value: string) => void;
  /** Called once per complete code: never twice for the same code until the boxes change again. */
  onComplete: (code: string) => void;
  /** Accessible name of the group, e.g. "Six-digit verification code". */
  label: string;
  /** Accessible name of each box, e.g. (1, 6) => "Digit 1 of 6". */
  boxLabel: (position: number, total: number) => string;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
  /** Id of the error message, linked to the group and to each box. */
  errorId?: string;
};

const onlyDigits = (text: string) => text.replace(/\D/g, "");

/**
 * One box per digit. Typing advances, Backspace goes back, non-digits are ignored, and a pasted
 * (or auto-filled) code is spread from the first box whatever box has the focus.
 * The digits always fill the boxes from the left, so `value` is a plain string.
 */
export const CodeInput = ({
  value,
  onChange,
  onComplete,
  label,
  boxLabel,
  length = 6,
  disabled = false,
  invalid = false,
  errorId,
}: CodeInputProps) => {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const lastCompleted = useRef<string | null>(null);

  const focusBox = (index: number) => {
    const box = boxes.current[Math.max(0, Math.min(index, length - 1))];
    box?.focus();
    box?.select();
  };

  // The boxes may be emptied from outside (after a wrong code): the same code can then be completed again.
  useEffect(() => {
    if (value.length < length) lastCompleted.current = null;
  }, [value, length]);

  // On arrival, and when the boxes come back enabled and empty after an error, the first box takes the focus.
  useEffect(() => {
    if (!disabled && value === "") boxes.current[0]?.focus();
  }, [disabled, value]);

  const update = (next: string) => {
    onChange(next);
    // A ref, not state: two events in the same tick (paste, then input) still see the first call.
    if (next.length === length && next !== lastCompleted.current) {
      lastCompleted.current = next;
      onComplete(next);
    }
  };

  const handleChange = (index: number, typed: string) => {
    const digits = onlyDigits(typed);
    if (!digits) return; // a letter or a symbol: ignored, the box keeps its value
    if (digits.length >= length) {
      update(digits.slice(0, length)); // auto-filled one-time code: always from the first box
      focusBox(length - 1);
      return;
    }
    const next = (value.slice(0, index) + digits + value.slice(index + digits.length)).slice(0, length);
    update(next);
    focusBox(index + digits.length);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault(); // no input event follows: the paste is handled here only
    const digits = onlyDigits(event.clipboardData.getData("text")).slice(0, length);
    if (!digits) return;
    update(digits);
    focusBox(digits.length);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (index < value.length) {
        update(value.slice(0, index) + value.slice(index + 1)); // remove this digit
        focusBox(index);
      } else if (index > 0) {
        update(value.slice(0, index - 1)); // empty box: go back and remove the previous digit
        focusBox(index - 1);
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(Math.min(index + 1, value.length));
    }
  };

  return (
    <div role="group" aria-label={label} aria-describedby={errorId} className="flex justify-center gap-sm">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            boxes.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={boxLabel(index + 1, length)}
          aria-invalid={invalid || undefined}
          aria-describedby={errorId}
          disabled={disabled}
          placeholder="0"
          value={value[index] ?? ""}
          onChange={(event) => handleChange(index, event.target.value)}
          onPaste={handlePaste}
          onKeyDown={(event) => handleKeyDown(index, event)}
          // Boxes fill from the left: clicking past the first empty box goes to that box.
          onFocus={(event) => (index > value.length ? focusBox(value.length) : event.target.select())}
          // text-[length:var(--text-l)], not text-l: tailwind-merge (in cn) does not know the project's custom
          // sizes, takes "text-l" for a colour and drops it next to text-white.
          className={cn(
            "h-[81px] w-[52px] rounded-[4px] border-2 border-white/50 bg-transparent text-center text-[length:var(--text-l)] text-white transition-colors duration-200 outline-none placeholder:text-white/20 focus:border-white disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
            invalid && "border-danger focus:border-danger",
          )}
        />
      ))}
    </div>
  );
};
