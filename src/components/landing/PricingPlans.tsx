import { useMemo, useState } from "react";
import { Check, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const plans = [
  {
    name: "Starter",
    description: "Tapasztald meg az AI predikciós élményt kockázat nélkül.",
    primary: false,
    price: {
      monthly: 0,
      annual: 0,
    },
    cta: "Kezdés",
    benefits: [
      "Napi 3 predikciós riport",
      "Alap odds figyelés",
      "Közösségi toplisták",
      "Email értesítések",
    ],
    badge: "Ingyenes",
  },
  {
    name: "Pro",
    description: "Profi sportfogadóknak, akik magasabb találati arányt és mély statisztikát várnak.",
    primary: true,
    price: {
      monthly: 24990,
      annual: 249990,
    },
    cta: "Pro előfizetés",
    benefits: [
      "Korlátlan predikció",
      "Valós idejű modellriportok",
      "Edge anomáliafigyelés",
      "Havi ROI összefoglaló",
      "Discord pro szoba",
    ],
    badge: "Legnépszerűbb",
  },
  {
    name: "Elite",
    description: "Trading csapatoknak és ügynökségeknek dedikált szolgáltatásokkal.",
    primary: false,
    price: {
      monthly: 59990,
      annual: 559990,
    },
    cta: "Kapcsolatfelvétel",
    benefits: [
      "Dedikált AI coach",
      "Piaci API integrációk",
      "SLA szerinti támogatás",
      "Egyedi modelltréning",
      "Multi-account menedzsment",
    ],
    badge: "Enterprise",
  },
];

const formatCurrency = (value: number) => {
  if (value === 0) {
    return "Ingyenes";
  }

  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: "HUF",
    maximumFractionDigits: 0,
  }).format(value);
};

const PricingPlans = () => {
  const [annual, setAnnual] = useState(true);
  const navigate = useNavigate();
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.1 });

  const subtitle = useMemo(
    () => (annual ? "Takaríts meg akár 17%-ot éves előfizetéssel." : "Rugalmas havi csomagok bármikor lemondhatóak."),
    [annual],
  );

  return (
    <section className="py-16 sm:py-24" aria-labelledby="landing-pricing">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Árazás</span>
            <h2 id="landing-pricing" className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Rugalmas csomagok a tipster út bármely szakaszára.
            </h2>
            <p className="mt-4 text-base text-white/70 sm:text-lg">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
            <span className={cn("text-sm font-semibold", annual ? "text-white/50" : "text-white")}>Havi</span>
            <Switch
              aria-label="Éves számlázás beváltása"
              checked={annual}
              onCheckedChange={(checked) => setAnnual(checked)}
            />
            <span className={cn("text-sm font-semibold", annual ? "text-white" : "text-white/50")}>Éves</span>
          </div>
        </div>

        <div
          ref={ref}
          className={cn(
            "mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3",
            "transition-all duration-700 ease-out",
            isRevealed ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
          )}
        >
          {plans.map((plan) => {
            const price = annual ? plan.price.annual : plan.price.monthly;
            const per = plan.price.monthly === 0 ? "" : annual ? "/év" : "/hó";

            return (
              <article
                key={plan.name}
                className={cn(
                  "relative flex h-full flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur", 
                  plan.primary ? "border-primary/40 bg-primary/15 shadow-lg shadow-primary/20" : "shadow",
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                    {plan.badge}
                  </span>
                </div>
                <p className="text-sm text-white/70">{plan.description}</p>
                <div>
                  <p className="flex items-baseline gap-1 text-3xl font-semibold text-white">
                    {formatCurrency(price)}
                    <span className="text-sm text-white/60">{per}</span>
                  </p>
                  {plan.primary ? (
                    <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                      <Info className="h-4 w-4" aria-hidden="true" />
                      14 nap próbaidő
                    </p>
                  ) : null}
                </div>
                <ul className="space-y-3 text-sm text-white/70">
                  {plan.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  className={cn(
                    "mt-auto h-11 rounded-full px-6 text-sm font-semibold",
                    plan.primary
                      ? "bg-gradient-to-r from-primary via-emerald-500 to-secondary text-white shadow-lg shadow-primary/40 hover:shadow-xl"
                      : "border border-white/20 bg-white/10 text-white hover:bg-white/20",
                  )}
                  variant={plan.primary ? "default" : "outline"}
                  onClick={() => navigate(plan.primary ? "/predictions/new" : "/auth/register")}
                >
                  {plan.cta}
                </Button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
