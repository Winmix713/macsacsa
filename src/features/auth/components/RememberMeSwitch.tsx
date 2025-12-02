import type { ComponentPropsWithoutRef } from "react";
import { Switch } from "@/components/ui/switch";

interface RememberMeSwitchProps extends Pick<ComponentPropsWithoutRef<typeof Switch>, "checked" | "onCheckedChange" | "disabled"> {
  label?: string;
}

export const RememberMeSwitch = ({ label = "Remember me", checked, onCheckedChange, disabled }: RememberMeSwitchProps) => {
  return (
    <label className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
      <span>{label}</span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="data-[state=checked]:bg-emerald-400"
      />
    </label>
  );
};

export default RememberMeSwitch;
