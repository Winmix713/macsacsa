import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <div className="winmix-auth-gradient" />
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
        <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr,1fr]">
          <aside className="hidden lg:flex h-full flex-col justify-center gap-10 text-slate-100">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400/15 text-2xl font-semibold text-emerald-300 shadow-lg shadow-emerald-500/20">
                WM
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200/80">
                  WinMix TipsterHub
                </p>
                <p className="text-base text-slate-200/90">AI-powered football intelligence on tap.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-semibold leading-tight text-white">
                Predict the pitch with<br />confidence and speed.
              </h2>
              <p className="max-w-md text-base text-slate-300/80">
                Build winning slips faster with gradient-enhanced insights, real-time monitoring, and a modern toolkit designed for analysts and ambitious bettors alike.
              </p>
            </div>

            <dl className="grid max-w-md grid-cols-2 gap-4 text-sm text-slate-200/80">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <dt className="text-xs uppercase tracking-[0.2em] text-emerald-200/60">Accuracy</dt>
                <dd className="mt-2 text-2xl font-semibold text-white">67.4%</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <dt className="text-xs uppercase tracking-[0.2em] text-emerald-200/60">Live feeds</dt>
                <dd className="mt-2 text-2xl font-semibold text-white">24/7</dd>
              </div>
            </dl>
          </aside>

          <main className={cn("relative", "lg:justify-self-end", "w-full")}>            
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/85 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
              <div className="absolute -right-24 top-20 hidden h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl sm:block" aria-hidden />
              <header className="mb-8 space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
                {subtitle ? <p className="text-sm text-slate-400/90 sm:text-base">{subtitle}</p> : null}
              </header>
              <div className="space-y-8">
                {children}
              </div>
              {footer ? <div className="mt-10 text-center text-sm text-slate-400">{footer}</div> : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
