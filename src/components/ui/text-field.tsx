import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder" | "size"> & {
  label: ReactNode;
  errorMessage?: string;
};

// Labelled text input (email...). The kit has no such field, so this one copies PasswordInput's
// floating label, border and error styles, without the show/hide button, to keep both fields identical.
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, errorMessage, id, className, "aria-describedby": describedBy, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className={cn("flex w-full flex-col gap-4", className)}>
        <div className={cn("group/field relative rounded-sm bg-black/10 font-display", errorMessage && "bg-danger/5")}>
          <fieldset
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute -top-2 inset-x-0 bottom-0 min-w-0 rounded-sm border border-white/40 px-3 transition-colors duration-200 group-hover/field:border-white/60 group-focus-within/field:border-white/60 motion-reduce:transition-none",
              errorMessage
                && "border-danger group-hover/field:border-danger group-focus-within/field:border-danger",
            )}
          >
            <legend className="invisible h-4 max-w-0 overflow-hidden whitespace-nowrap text-xs leading-4 transition-[max-width] duration-200 group-has-[input:not(:placeholder-shown)]/field:max-w-full motion-reduce:transition-none">
              <span className="px-1">{label}</span>
            </legend>
          </fieldset>
          <Input
            {...props}
            ref={ref}
            id={inputId}
            aria-invalid={errorMessage ? true : props["aria-invalid"]}
            aria-describedby={[describedBy, errorMessage ? errorId : undefined].filter(Boolean).join(" ") || undefined}
            placeholder=" "
            className="w-full gap-4 px-4 py-2.5"
            inputClassName="h-7 w-full text-lg leading-7 text-white"
          />
          <label
            htmlFor={inputId}
            className={cn(
              "absolute top-1/2 left-4 origin-left -translate-y-1/2 cursor-text text-lg leading-7 text-white/40 transition-[top,scale,color] duration-200 ease-out group-hover/field:text-white/60 group-has-[input:not(:placeholder-shown)]/field:top-0 group-has-[input:not(:placeholder-shown)]/field:scale-[0.666667] group-has-[input:not(:placeholder-shown)]/field:text-white/60 motion-reduce:transition-none",
              errorMessage
                && "text-danger group-hover/field:text-danger group-has-[input:not(:placeholder-shown)]/field:text-danger",
            )}
          >
            {label}
          </label>
        </div>
        {errorMessage && (
          <p id={errorId} role="alert" className="text-sx text-danger">
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

TextField.displayName = "TextField";
