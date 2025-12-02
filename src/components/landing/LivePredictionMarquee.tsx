import { Megaphone, Radio } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const predictionStream = [
  {
    league: "Serie A",
    match: "Inter vs. Napoli",
    callout: "Hazai győzelem",
    confidence: "88%",
  },
  {
    league: "La Liga",
    match: "Barcelona vs. Sevilla",
    callout: "Mindkét csapat szerez gólt",
    confidence: "82%",
  },
  {
    league: "Bundesliga",
    match: "Leverkusen vs. Dortmund",
    callout: "+2.5 gól",
    confidence: "79%",
  },
  {
    league: "NB I",
    match: "Fradi vs. Fehérvár",
    callout: "Hazai + mindkét csapat",
    confidence: "74%",
  },
  {
    league: "Premier League",
    match: "Brighton vs. Newcastle",
    callout: "X2",
    confidence: "69%",
  },
  {
    league: "Ligue 1",
    match: "PSG vs. Lille",
    callout: "Mbappé találat",
    confidence: "71%",
  },
];

const LivePredictionMarquee = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section className="py-16" aria-labelledby="landing-live-feed">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-primary/20 via-background to-secondary/20 p-8 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <Radio className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Live feed</p>
                <h2 id="landing-live-feed" className="text-2xl font-semibold sm:text-3xl">
                  Aktív WinMix predikciók
                </h2>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/70">
              <Megaphone className="h-4 w-4" aria-hidden="true" />
              Folyamatos frissítés
            </span>
          </div>
          <div className="relative mt-8" role="presentation">
            <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-background via-background/90 to-transparent" aria-hidden="true" />
            <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-background via-background/90 to-transparent" aria-hidden="true" />
            <div
              className={cn(
                "flex min-w-max items-center gap-8 text-sm text-white/80", 
                prefersReducedMotion ? "" : "motion-safe:animate-[marquee_22s_linear_infinite]",
              )}
              aria-live="polite"
            >
              {[...predictionStream, ...predictionStream].map((item, index) => (
                <div
                  key={`${item.match}-${index}`}
                  className="inline-flex min-w-[18rem] items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-primary">{item.league}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{item.match}</p>
                    <p className="text-xs text-white/60">{item.callout}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{item.confidence}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LivePredictionMarquee;
