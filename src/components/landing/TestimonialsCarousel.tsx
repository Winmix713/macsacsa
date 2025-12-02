import { useEffect, useState } from "react";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const testimonials = [
  {
    name: "Kiss Dániel",
    role: "Stratégiai vezető, BetLabs",
    quote:
      "A WinMix olyan mélységű mintafelismerést hozott, amit eddig csak saját fejlesztésű rendszerekben láttunk. A prediktív dashboard teljesen átalakította a döntéshozatalt.",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=160&h=160&q=80",
  },
  {
    name: "Szabó Enikő",
    role: "Chief Analyst, OddsFlow",
    quote:
      "Az automatikus anomáliafigyelés naponta több órát spórol a csapatnak. Az AI jelzései pontosan illeszkednek a kockázati profilunkhoz.",
    avatar:
      "https://images.unsplash.com/photo-1531891380293-dc6a3abcf0d4?auto=format&fit=facearea&w=160&h=160&q=80",
  },
  {
    name: "Farkas Patrik",
    role: "Head of Trading, SharpEdge",
    quote:
      "A pricing modul segítségével agresszívebben tudunk belépni a piacra. A WinMix jelzései a legjobb ROI-t hozták az elmúlt negyedévben.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=160&h=160&q=80",
  },
];

const TestimonialsCarousel = () => {
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.2 });
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());
    const handleSelect = () => setCurrent(api.selectedScrollSnap());

    api.on("select", handleSelect);
    api.on("reInit", handleSelect);

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleSelect);
    };
  }, [api]);

  return (
    <section className="py-16 sm:py-24" aria-labelledby="landing-testimonials">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Visszajelzések</span>
          <h2 id="landing-testimonials" className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            A profi tipsterek és kereskedők szerint
          </h2>
          <p className="mt-4 text-base text-white/70">
            Valós, adatvezérelt eredményekkel igazolt együttműködések a top trading csapatokkal.
          </p>
        </div>

        <div
          ref={ref}
          className={cn(
            "relative mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur", 
            "transition-all duration-700 ease-out",
            isRevealed ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
          )}
        >
          <Carousel
            className="w-full"
            opts={{ align: "start" }}
            setApi={setApi}
          >
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.name} className="md:basis-1/2 xl:basis-1/3">
                  <figure className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-background/70 p-6 text-left shadow-inner">
                    <blockquote className="text-base text-white/80">“{testimonial.quote}”</blockquote>
                    <figcaption className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={testimonial.avatar}
                          alt={`${testimonial.name} portréja`}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <AvatarFallback>{testimonial.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                        <p className="text-xs text-white/60">{testimonial.role}</p>
                      </div>
                    </figcaption>
                  </figure>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-6 hidden sm:flex" aria-label="Előző vélemény" />
            <CarouselNext className="-right-6 hidden sm:flex" aria-label="Következő vélemény" />
          </Carousel>

          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.name}
                type="button"
                className={cn(
                  "h-2.5 w-8 rounded-full transition", 
                  index === current ? "bg-primary" : "bg-white/20 hover:bg-white/40",
                )}
                onClick={() => api?.scrollTo(index)}
                aria-label={`${testimonial.name} értékelésének megnyitása`}
                aria-current={index === current}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
