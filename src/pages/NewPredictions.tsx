import AppSidebar from "@/components/navigation/AppSidebar";
import GlobalHeader from "@/components/navigation/GlobalHeader";
import MatchSelection from "@/components/MatchSelection";
import Footer from "@/components/Footer";

const NewPredictions = () => {
  return (
    <div className="min-h-screen">
      <AppSidebar />
      <GlobalHeader />
      <main className="relative">
        <MatchSelection />
      </main>
      <Footer />
    </div>
  );
};

export default NewPredictions;
