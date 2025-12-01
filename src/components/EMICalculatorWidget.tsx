import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

interface EMICalculatorWidgetProps {
    price: number;
}

const EMICalculatorWidget = ({ price }: EMICalculatorWidgetProps) => {
    const [downPayment, setDownPayment] = useState(Math.round(price * 0.2)); // 20% default
    const [interestRate, setInterestRate] = useState(9.5); // 9.5% default
    const [tenure, setTenure] = useState(5); // 5 years default

    const [emi, setEmi] = useState(0);
    const [loanAmount, setLoanAmount] = useState(0);

    useEffect(() => {
        calculateEMI();
    }, [price, downPayment, interestRate, tenure]);

    const calculateEMI = () => {
        const principal = price - downPayment;
        const ratePerMonth = interestRate / 12 / 100;
        const months = tenure * 12;

        if (principal <= 0) {
            setEmi(0);
            setLoanAmount(0);
            return;
        }

        const emiValue =
            (principal * ratePerMonth * Math.pow(1 + ratePerMonth, months)) /
            (Math.pow(1 + ratePerMonth, months) - 1);

        setEmi(Math.round(emiValue));
        setLoanAmount(principal);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>EMI Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Loan Amount Display */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Loan Amount</span>
                    <span className="text-base font-semibold">{formatCurrency(loanAmount)}</span>
                </div>

                {/* Down Payment */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label className="text-xs">Down Payment</Label>
                        <span className="text-xs font-medium">{formatCurrency(downPayment)}</span>
                    </div>
                    <Slider
                        value={[downPayment]}
                        min={0}
                        max={price}
                        step={1000}
                        onValueChange={(value) => setDownPayment(value[0])}
                        className="py-1"
                    />
                </div>

                {/* Tenure */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label className="text-xs">Tenure (Years)</Label>
                        <span className="text-xs font-medium">{tenure} Years</span>
                    </div>
                    <Slider
                        value={[tenure]}
                        min={1}
                        max={7}
                        step={1}
                        onValueChange={(value) => setTenure(value[0])}
                        className="py-1"
                    />
                </div>

                <Separator />

                {/* Results */}
                <div className="space-y-1">
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-medium">Monthly EMI</span>
                        <span className="text-xl font-bold text-primary">
                            {formatCurrency(emi)}
                        </span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    asChild
                >
                    <Link to="/emi-calculator">Detailed Calculator</Link>
                </Button>
            </CardContent>
        </Card>
    );
};

export default EMICalculatorWidget;
