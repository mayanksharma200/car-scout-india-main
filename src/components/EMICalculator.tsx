import { useState } from "react";
import { Calculator, IndianRupee, Calendar, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import LoanModal from "@/components/LoanModal"; // Import the new component
import { useToast } from "@/hooks/use-toast";

const EMICalculator = () => {
  const { toast } = useToast();
  const [carPrice, setCarPrice] = useState(1000000);
  const [downPayment, setDownPayment] = useState(200000);
  const [loanTenure, setLoanTenure] = useState(5);
  const [interestRate, setInterestRate] = useState(9.5);

  const calculateEMI = () => {
    const principal = carPrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const months = loanTenure * 12;

    if (monthlyRate === 0) return principal / months;

    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    return emi;
  };

  const emiAmount = calculateEMI();
  const totalAmount = emiAmount * loanTenure * 12;
  const totalInterest = totalAmount - (carPrice - downPayment);
  const loanAmount = carPrice - downPayment;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 animate-fade-in">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            EMI Calculator
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Calculate your monthly EMI and plan your car purchase with
            confidence. Get instant results and compare different loan options.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Calculator Form */}
          <Card className="shadow-auto-lg border-border hover-scale transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-6 h-6 text-primary" />
                Loan Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Car Price */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Car Price</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="number"
                    value={carPrice}
                    onChange={(e) => setCarPrice(Number(e.target.value))}
                    className="pl-10"
                    placeholder="Ex: 10,00,000"
                  />
                </div>
                <Slider
                  value={[carPrice]}
                  onValueChange={(value) => setCarPrice(value[0])}
                  max={5000000}
                  min={300000}
                  step={50000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹3 Lakh</span>
                  <span>₹50 Lakh</span>
                </div>
              </div>

              {/* Down Payment */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Down Payment</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="pl-10"
                    placeholder="Ex: 2,00,000"
                  />
                </div>
                <Slider
                  value={[downPayment]}
                  onValueChange={(value) => setDownPayment(value[0])}
                  max={carPrice * 0.8}
                  min={carPrice * 0.1}
                  step={10000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10% of car price</span>
                  <span>80% of car price</span>
                </div>
              </div>

              {/* Loan Tenure */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Loan Tenure (Years)
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="number"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(Number(e.target.value))}
                    className="pl-10"
                    placeholder="Ex: 5"
                  />
                </div>
                <Slider
                  value={[loanTenure]}
                  onValueChange={(value) => setLoanTenure(value[0])}
                  max={7}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 Year</span>
                  <span>7 Years</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Interest Rate (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="number"
                    value={interestRate}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value <= 15) {
                        setInterestRate(value);
                      } else {
                        toast({
                          title: "Limit Reached",
                          description: "Interest rate cannot exceed 15%",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="pl-10"
                    step="0.1"
                    placeholder="Ex: 9.5"
                  />
                </div>
                <Slider
                  value={[interestRate]}
                  onValueChange={(value) => setInterestRate(value[0])}
                  max={15}
                  min={7}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>7%</span>
                  <span>15%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {/* EMI Result Card */}
            <Card className="shadow-auto-lg border-border bg-gradient-card hover-scale transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">
                    Monthly EMI
                  </div>
                  <div className="text-4xl font-bold text-accent mb-4">
                    {formatCurrency(emiAmount)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">
                        Principal Amount
                      </div>
                      <div className="font-semibold">
                        {formatCurrency(carPrice - downPayment)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Total Interest
                      </div>
                      <div className="font-semibold">
                        {formatCurrency(totalInterest)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Breakdown */}
            <Card className="shadow-auto-lg border-border hover-scale transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Loan Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Car Price</span>
                  <span className="font-semibold">
                    {formatCurrency(carPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Down Payment</span>
                  <span className="font-semibold">
                    {formatCurrency(downPayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Loan Amount</span>
                  <span className="font-semibold">
                    {formatCurrency(carPrice - downPayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">
                    Total Amount Payable
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(totalAmount + downPayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Total Interest</span>
                  <span className="font-semibold text-accent">
                    {formatCurrency(totalInterest)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* CTA with Lead Forms */}
            <div className="space-y-3">
              <LoanModal
                loanAmount={loanAmount}
                emiAmount={emiAmount}
                modalType="preapproval"
              >
                <Button className="w-full bg-gradient-accent hover:opacity-90 shadow-auto-md text-lg py-6">
                  Get Pre-Approved Loan
                </Button>
              </LoanModal>

              <LoanModal
                loanAmount={loanAmount}
                emiAmount={emiAmount}
                modalType="compare"
              >
                <Button
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Compare Loan Offers
                </Button>
              </LoanModal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EMICalculator;
