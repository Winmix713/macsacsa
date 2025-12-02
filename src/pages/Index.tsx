import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const Index = () => {
  const navigate = useNavigate();
  useDocumentTitle("WinMix TipsterHub");

  return (
    <div className="space-y-16 pb-16">
      <HeroSection />
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Készen állsz az AI predikciókra?
            </h2>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Válassz 8 mérkőzést és a WinMix advanced pattern recognition rendszere azonnal elkészíti a részletes predikciós elemzést.
            </p>
            <Button
              onClick={() => navigate("/predictions/new")}
              size="lg"
              className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary px-8 text-base font-semibold text-primary-foreground ring-1 ring-primary transition hover:ring-primary/80"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                Új predikciók készítése
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/40 to-white/0 transition-transform duration-500 group-hover:translate-x-0" />
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Index;
