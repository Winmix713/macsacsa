import { forwardRef, useId, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import FloatingLabelInput from "@/features/auth/components/FloatingLabelInput";

interface PasswordFieldProps extends Omit<ComponentPropsWithoutRef<typeof FloatingLabelInput>, "type"> {
  label: string;
  error?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(({ label, error, className, id, ...props }, ref) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <div className="relative">
        <FloatingLabelInput
          ref={ref}
          id={inputId}
          type={show ? "text" : "password"}
          label={label}
          error={error}
          hideErrorMessage
          className={cn("pr-12", className)}
          autoComplete="current-password"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/5 text-slate-100 transition hover:bg-white/10"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="text-xs font-medium text-destructive/90">{error}</p> : null}
    </div>
  );
});

PasswordField.displayName = "PasswordField";

export default PasswordField;
