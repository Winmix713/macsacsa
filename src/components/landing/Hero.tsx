import { useMemo } from "react";
import { ArrowRight, ShieldCheck, Sparkles, Trophy, Activity, Target, Radar } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const statistics = [
  { label: "Aktív elemzések", value: 4872, suffix: "+" },
  { label: "Valós idejű esemény", value: 312, suffix: "+" },
  { label: "Találati arány", value: 91, suffix: "%" },
];

const glyphs = [
  { Icon: Trophy, className: "top-10 left-10", blur: "blur-[30px]" },
  { Icon: ShieldCheck, className: "bottom-24 left-1/4", blur: "blur-[26px]" },
  { Icon: Target, className: "top-20 right-12", blur: "blur-[22px]" },
  { Icon: Activity, className: "bottom-10 right-24", blur: "blur-[20px]" },
  { Icon: Radar, className: "top-1/2 right-1/3", blur: "blur-[24px]" },
];

const AnimatedStat = ({ label, value, suffix }: { label: string; value: number; suffix?: string }) => {
  const { ref, value: animatedValue } = useAnimatedCounter({ targetNumber: value });
  const formatted = useMemo(() => new Intl.NumberFormat("hu-HU").format(animatedValue), [animatedValue]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-md">
      <dt className="text-sm uppercase tracking-wide text-white/70">{label}</dt>
      <dd
        ref={(node) => ref(node)}
        className="mt-2 text-3xl font-semibold text-white"
        aria-label={`${label}: ${formatted}${suffix ?? ""}`}
      >
        {formatted}
        {suffix}
      </dd>
    </div>
  );
};

const LandingHero = () => {
  const navigate = useNavigate();
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.05 });
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section className="relative overflow-hidden pb-16 pt-24 sm:pt-32" aria-labelledby="landing-hero-heading">
      <div
        className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,var(--glow-emerald)_0%,rgba(0,0,0,0)_60%),radial-gradient(circle_at_bottom,var(--glow-violet)_0%,rgba(0,0,0,0)_65%)] opacity-40"
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/60 to-background" aria-hidden="true" />

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8">
        <div
          ref={ref}
          className={cn(
            "relative z-10 max-w-3xl", 
            "transition-all duration-700 ease-out",
            isRevealed ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
          )}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            WinMix TipsterHub 2.0
          </span>
          <h1 id="landing-hero-heading" className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            AI alapú sportfogadási intelligencia, amely minden mérkőzést előre felrajzol.
          </h1>
          <p className="mt-6 text-lg text-white/70 sm:text-xl">
            Ötvözzük a predikciós analitikát, valós idejű statisztikákat és intelligens automatizmusokat, hogy minden tipphez prémium minőségű döntéstámogatást adjunk.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="group h-12 rounded-full bg-gradient-to-r from-primary via-emerald-500 to-secondary px-8 text-base font-semibold text-white shadow-lg shadow-primary/40 transition hover:shadow-xl hover:shadow-primary/40"
              onClick={() => navigate("/predictions/new")}
            >
              <span className="flex items-center gap-2">
                Predikció indítása
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/30 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
              onClick={() => navigate("/dashboard")}
            >
              Platform bemutató
            </Button>
          </div>

          <dl className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {statistics.map((stat) => (
              <AnimatedStat key={stat.label} label={stat.label} value={stat.value} suffix={stat.suffix} />
            ))}
          </dl>
        </div>

        <div
          className={cn(
            "relative flex w-full max-w-xl flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl backdrop-blur-lg", 
            "transition-all duration-700 ease-out",
            isRevealed ? "translate-y-0 opacity-100 delay-150" : "translate-y-10 opacity-0"
          )}
        >
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-primary/20" aria-hidden="true" />
          <div className="flex w-full items-center justify-between">
            <span className="text-sm font-semibold text-white/80">Valós idejű predikció</span>
            <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">Live</span>
          </div>
          <div className="mt-6 w-full rounded-2xl border border-white/10 bg-background/60 p-5 shadow-inner">
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Premier League</span>
              <span>82%-os találati modell</span>
            </div>
            <div className="mt-4 flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-white">Manchester vs. Arsenal</p>
                <p className="text-sm text-white/60">xG különbség: 1.4</p>
                <p className="mt-3 text-sm text-primary">
                  Ajánlott: <span className="font-semibold">Hazai +2.5 gól</span>
                </p>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/40 bg-primary/15 text-2xl font-bold text-primary">
                78%
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-xs text-white/60">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                Forma mutató
                <p className="mt-1 text-sm font-semibold text-white">9.2</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                Prediktív index
                <p className="mt-1 text-sm font-semibold text-white">92</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                Bizalom
                <p className="mt-1 text-sm font-semibold text-white">Magas</p>
              </div>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-white/60">
            WinMix AI motor valós időben szinkronizálja a ligákat, gyorsítja a mintafelismerést és validálja a modelleket.
          </p>
        </div>
      </div>

      <div className="pointer-events-none" aria-hidden="true">
        {glyphs.map(({ Icon, className, blur }, index) => (
          <div
            key={index}
            className={cn(
              "absolute hidden h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 shadow-lg shadow-primary/20 backdrop-blur-xl sm:flex", 
              className,
              prefersReducedMotion ? "" : "motion-safe:animate-[float_8s_ease-in-out_infinite]",
            )}
            style={prefersReducedMotion ? undefined : { animationDelay: `${index * 0.45}s` }}
          >
            <div className={cn("flex h-20 w-20 items-center justify-center rounded-full bg-background/70", blur)}>
              <Icon className="h-8 w-8" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LandingHero;
