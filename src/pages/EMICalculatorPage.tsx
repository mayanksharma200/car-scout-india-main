import Header from "@/components/Header";
import EMICalculator from "@/components/EMICalculator";

const EMICalculatorPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8">
        <EMICalculator />
      </div>
    </div>
  );
};

export default EMICalculatorPage;