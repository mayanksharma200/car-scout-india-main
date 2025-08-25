import Header from "@/components/Header";
import EMICalculator from "@/components/EMICalculator";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";


const EMICalculatorPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdBanner placement="below_navigation" />
      <div className="py-8">
        <EMICalculator />
      </div>
      <AdBanner placement="above_footer" />
      <Footer/>
      
    </div>
  );
};

export default EMICalculatorPage;