import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BrandGrid from "@/components/BrandGrid";
import FeaturedCars from "@/components/FeaturedCars";
import CompareSection from "@/components/CompareSection";
import EMICalculator from "@/components/EMICalculator";
import Footer from "@/components/Footer";


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <BrandGrid />
      <FeaturedCars />
      <CompareSection />
      <EMICalculator />
      <Footer />
    </div>
  );
};

export default Index;