import { useState, type ReactNode } from "react";
import type { Provider } from "@supabase/auth-js";
import { Chrome, Github, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SocialAuthButtonsProps {
  onSelect: (provider: Provider) => Promise<void> | void;
  className?: string;
}

const providers: Array<{ id: Provider; label: string; icon: ReactNode }> = [
  {
    id: "google",
    label: "Continue with Google",
    icon: <Chrome className="h-4 w-4" />,
  },
  {
    id: "github",
    label: "Continue with GitHub",
    icon: <Github className="h-4 w-4" />,
  },
];

export const SocialAuthButtons = ({ onSelect, className }: SocialAuthButtonsProps) => {
  const [pending, setPending] = useState<Provider | null>(null);

  const handleSelect = async (provider: Provider) => {
    if (pending) return;
    try {
      setPending(provider);
      await onSelect(provider);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className={cn("grid gap-3", className)}>
      {providers.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          className="h-12 w-full justify-center gap-2 rounded-2xl border-white/15 bg-white/10 text-slate-100 hover:border-emerald-200/60 hover:bg-emerald-400/10"
          disabled={Boolean(pending)}
          onClick={() => handleSelect(provider.id)}
        >
          {pending === provider.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            provider.icon
          )}
          <span className="text-sm font-medium">{provider.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default SocialAuthButtons;
