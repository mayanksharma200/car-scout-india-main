import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, TrendingUp } from "lucide-react";
import OTPVerification from "@/components/OTPVerification";

interface LoanModalProps {
  children: React.ReactNode;
  loanAmount?: number;
  emiAmount?: number;
  modalType: "preapproval" | "compare";
}

const LoanModal = ({
  children,
  loanAmount,
  emiAmount,
  modalType,
}: LoanModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    employmentType: "",
    monthlyIncome: "",
    message: "",
  });
  const { toast } = useToast();

  const modalConfig = {
    preapproval: {
      title: "Get Pre-Approved Loan",
      description:
        "Get instant pre-approval for your car loan with competitive rates",
      source: "loan_preapproval",
    },
    compare: {
      title: "Compare Loan Offers",
      description: "Compare multiple loan offers from top banks and NBFCs",
      source: "loan_comparison",
    },
  };

  const config = modalConfig[modalType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone) {
      toast({
        variant: "destructive",
        title: "Phone Required",
        description: "Please enter your phone number",
      });
      return;
    }
    setShowOTP(true);
  };

  const handleOTPVerified = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.from("leads").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        employment_type: formData.employmentType,
        monthly_income: formData.monthlyIncome
          ? parseInt(formData.monthlyIncome)
          : null,
        loan_amount: loanAmount,
        emi_amount: emiAmount,
        source: config.source,
        status: "new",
        message: formData.message,
      });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description:
          modalType === "preapproval"
            ? "We'll process your pre-approval request shortly!"
            : "We'll send you loan comparison details soon!",
      });

      setOpen(false);
      setShowOTP(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        city: "",
        employmentType: "",
        monthlyIncome: "",
        message: "",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {modalType === "preapproval" ? (
              <CreditCard className="w-5 h-5 text-primary" />
            ) : (
              <TrendingUp className="w-5 h-5 text-primary" />
            )}
            {config.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </DialogHeader>

        {/* Display calculated amounts if available */}
        {(loanAmount || emiAmount) && (
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            {loanAmount && (
              <div className="flex justify-between text-sm">
                <span>Loan Amount:</span>
                <span className="font-semibold">
                  ₹{loanAmount.toLocaleString()}
                </span>
              </div>
            )}
            {emiAmount && (
              <div className="flex justify-between text-sm">
                <span>Monthly EMI:</span>
                <span className="font-semibold">
                  ₹{Math.round(emiAmount).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, employmentType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salaried">Salaried</SelectItem>
                  <SelectItem value="self_employed">Self Employed</SelectItem>
                  <SelectItem value="business">Business Owner</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
            <Input
              id="monthlyIncome"
              type="number"
              value={formData.monthlyIncome}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  monthlyIncome: e.target.value,
                }))
              }
              placeholder="Ex: 50000"
            />
          </div>

          <div>
            <Label htmlFor="message">Additional Information</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Any specific requirements or questions..."
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Send OTP & Submit"}
          </Button>
        </form>

        <OTPVerification
          isOpen={showOTP}
          onClose={() => setShowOTP(false)}
          onVerified={handleOTPVerified}
          phoneNumber={formData.phone}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LoanModal;
