import { Brain, Cpu, LineChart, ShieldCheck, Network } from "lucide-react";

import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const features = [
  {
    title: "Mintafelismerés valós időben",
    description:
      "Az AI motor másodpercenként 40 000 jelzést szkennel, és automatikusan súlyozza, hogy mely ligák és csapatok bírnak kiemelt hatással.",
    highlight: "Prediktív erősség",
    icon: Brain,
  },
  {
    title: "Automatikus anomáliafigyelés",
    description:
      "Workflow-ok értesítik a csapatot, ha rendellenes fogadási minták vagy odds kilengések jelentkeznek, így időben reagálhatsz.",
    highlight: "24/7 guardian",
    icon: ShieldCheck,
  },
  {
    title: "Adatcsatornák egyben",
    description:
      "35+ adatforrás összehangolt feldolgozása; az odds, forma, xG és keretfrissítések egy kezelőfelületen érkeznek.",
    highlight: "Multiszintű aggregáció",
    icon: Network,
  },
  {
    title: "Modellek önhangoló módon",
    description:
      "A rendszer folyamatosan monitorozza a modellhűséget, és javaslatot tesz a súlyozások finomhangolására a magasabb ROI érdekében.",
    highlight: "WinMix Adaptive",
    icon: LineChart,
  },
  {
    title: "Edge számítás célzottan",
    description:
      "Kiemelten kezeli a kisebb ligákat, ahol a piaci zaj alacsonyabb, így könnyebb kimutatni a profitábilis lehetőségeket.",
    highlight: "Deep edge",
    icon: Cpu,
  },
];

const FeatureCard = ({
  title,
  description,
  highlight,
  icon: Icon,
  index,
}: (typeof features)[number] & { index: number }) => {
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.2 });

  return (
    <article
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur transition-all duration-700 ease-out", 
        "hover:-translate-y-1 hover:border-white/20 hover:bg-white/10",
        isRevealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
      )}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
        {highlight}
      </span>
      <div className="mt-5 flex items-center gap-3 text-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold leading-tight">{title}</h3>
      </div>
      <p className="mt-4 text-sm text-white/70">{description}</p>
    </article>
  );
};

const AiFeatureCards = () => {
  return (
    <section className="py-16 sm:py-24" aria-labelledby="landing-ai-features">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">AI modulok</span>
          <h2 id="landing-ai-features" className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Minden predikció mögött több mint 50 intelligens mikroszolgáltatás dolgozik.
          </h2>
          <p className="mt-4 text-base text-white/70 sm:text-lg">
            A WinMix TipsterHub moduláris AI-stackje az adatot, a piaci kontextust és a stratégiai preferenciákat egy egyesített élményben adja át.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AiFeatureCards;
