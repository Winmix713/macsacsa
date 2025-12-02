import { forwardRef, useId } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FloatingLabelInputProps extends ComponentPropsWithoutRef<typeof Input> {
  label: string;
  error?: string;
  hideErrorMessage?: boolean;
}

export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, error, hideErrorMessage = false, className, id, type = "text", ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              "peer h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 pb-1 pt-4 text-base text-slate-100 placeholder-transparent shadow-inner shadow-slate-900/40 transition focus:border-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 disabled:opacity-60",
              error && "border-destructive/80 focus:border-destructive focus:ring-destructive/30",
              className,
            )}
            placeholder=" "
            {...props}
          />
          <label
            htmlFor={inputId}
            className={cn(
              "pointer-events-none absolute left-4 top-1/2 block w-[calc(100%-2rem)] -translate-y-1/2 text-sm text-slate-300/90 transition-all duration-200",
              "peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-300/75",
              "peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-200",
            )}
          >
            {label}
          </label>
        </div>
        {error && !hideErrorMessage ? (
          <p className="text-xs font-medium text-destructive/90">{error}</p>
        ) : null}
      </div>
    );
  },
);

FloatingLabelInput.displayName = "FloatingLabelInput";

export default FloatingLabelInput;
