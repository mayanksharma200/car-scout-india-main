import Header from "@/components/Header";
import EMICalculator from "@/components/EMICalculator";
import Footer from "@/components/Footer";


const EMICalculatorPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8">
        <EMICalculator />
      </div>
      <Footer/>
      
    </div>
  );
};

export default EMICalculatorPage;