import { ClipboardCheck, GaugeCircle, Lightbulb, Rocket } from "lucide-react";

import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const steps = [
  {
    title: "Liga és mérkőzés kiválasztása",
    description:
      "Pillanatok alatt összeállíthatod a slipet: több mint 60 liga, részletes csapatadatok és formagörbék állnak rendelkezésre.",
    accent: "0. perc",
    icon: ClipboardCheck,
  },
  {
    title: "AI elemzés összeállítása",
    description:
      "A WinMix motor 12 külön modellből gyűjti be a predikciókat, majd a saját kockázati profilodra optimalizálja a javaslatot.",
    accent: "+45 mp",
    icon: Lightbulb,
  },
  {
    title: "Valós idejű validálás",
    description:
      "Edge detektor és piaci monitor figyeli a fogadási mozgásokat; ha anomália érkezik, azonnal értesítünk.",
    accent: "+2 perc",
    icon: GaugeCircle,
  },
  {
    title: "Intelligens végrehajtás",
    description:
      "A rendszer automatikusan frissíti a slipet, és segít időzíteni a fogadást a legjobb oddsokra a választott bukmikerednél.",
    accent: "Finish",
    icon: Rocket,
  },
];

const TimelineStep = ({
  title,
  description,
  accent,
  icon: Icon,
  index,
}: (typeof steps)[number] & { index: number }) => {
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.3 });

  return (
    <li
      ref={ref}
      className={cn(
        "relative ml-6 rounded-3xl border border-white/10 bg-white/5 p-6 pl-8 backdrop-blur transition-all duration-700 ease-out", 
        isRevealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
      )}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <span className="absolute -left-[11px] top-8 h-5 w-5 rounded-full border-2 border-background bg-primary" aria-hidden="true" />
      <span className="absolute -left-14 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{accent}</span>
      <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm text-white/70">{description}</p>
    </li>
  );
};

const HowItWorksTimeline = () => {
  return (
    <section className="py-16 sm:py-24" aria-labelledby="landing-how-it-works">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Folyamat</span>
          <h2 id="landing-how-it-works" className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Így segít a WinMix AI néhány perc alatt kialakítani a profitábilis döntést.
          </h2>
          <p className="mt-4 text-base text-white/70 sm:text-lg">
            A pipeline minden lépése átlátható, értelmezhető, és személyre szabható az egyedi stratégiai céljaidhoz.
          </p>
        </div>
        <ol className="relative border-l border-white/10 pl-6">
          {steps.map((step, index) => (
            <TimelineStep key={step.title} {...step} index={index} />
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorksTimeline;
