import { Suspense, lazy } from "react";

import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import {
  AiFeatureCards,
  HowItWorksTimeline,
  LandingHero,
  LivePredictionMarquee,
  PricingPlans,
} from "@/components/landing";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const TestimonialsCarousel = lazy(() => import("@/components/landing/TestimonialsCarousel"));

const Index = () => {
  useDocumentTitle("WinMix TipsterHub");

  return (
    <div className="min-h-screen">
      <Sidebar />
      <TopBar />
      <main className="ml-0 md:ml-[84px]">
        <LandingHero />
        <AiFeatureCards />
        <HowItWorksTimeline />
        <LivePredictionMarquee />
        <Suspense
          fallback={
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
              <div className="h-64 rounded-3xl border border-white/10 bg-white/5" aria-hidden="true" />
            </div>
          }
        >
          <TestimonialsCarousel />
        </Suspense>
        <PricingPlans />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
