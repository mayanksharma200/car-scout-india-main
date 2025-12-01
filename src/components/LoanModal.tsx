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
  carId?: string;
  carName?: string;
}

const LoanModal = ({
  children,
  loanAmount,
  emiAmount,
  modalType,
  carId,
  carName,
}: LoanModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [phoneError, setPhoneError] = useState("");
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

  // Check if form is valid for submit button state
  const isFormValid = () => {
    return (
      formData.name.length >= 2 &&
      formData.email.length > 0 &&
      formData.phone.length === 10 &&
      formData.city.length >= 2 &&
      formData.employmentType.length > 0 &&
      formData.monthlyIncome.length > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Name validation
    if (formData.name.length < 2) {
      toast({
        variant: "destructive",
        title: "Invalid Name",
        description: "Name must be at least 2 characters long",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address",
      });
      return;
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
      });
      return;
    }

    // City validation
    if (formData.city.length < 2) {
      toast({
        variant: "destructive",
        title: "Invalid City",
        description: "City name must be at least 2 characters long",
      });
      return;
    }

    // Employment Type validation
    if (!formData.employmentType) {
      toast({
        variant: "destructive",
        title: "Employment Type Required",
        description: "Please select your employment type",
      });
      return;
    }

    // Monthly Income validation
    if (!formData.monthlyIncome || parseInt(formData.monthlyIncome) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Income",
        description: "Please enter a valid monthly income",
      });
      return;
    }

    setShowOTP(true);
  };

  const handleOTPVerified = async () => {
    setLoading(true);

    try {
      // Prepare the lead data
      const leadData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        source: config.source,
        status: "new",
        employment_type: formData.employmentType,
        monthly_income: formData.monthlyIncome ? parseInt(formData.monthlyIncome) : null,
        message: formData.message,
      };

      // Add car ID if available
      if (carId) {
        leadData.interested_car_id = carId;
      }

      // Add loan details if available
      if (loanAmount) {
        leadData.loan_amount = loanAmount;
      }
      if (emiAmount) {
        leadData.emi_amount = emiAmount;
      }

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to submit request");
      }

      toast({
        title: "Request Submitted",
        description:
          modalType === "preapproval"
            ? "We'll process your pre-approval request shortly!"
            : "We'll send you loan comparison details soon!",
      });

      setOpen(false);
      setShowOTP(false);
      setPhoneError("");
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
      <DialogContent className="sm:max-w-md max-h-[100vh] overflow-y-auto">
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

        {/* Display car and calculated amounts if available */}
        {(carName || loanAmount || emiAmount) && (
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            {carName && (
              <div className="flex justify-between text-sm">
                <span>Interested Car:</span>
                <span className="font-semibold text-primary">
                  {carName}
                </span>
              </div>
            )}
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
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                  if (value.length <= 10) {
                    setFormData((prev) => ({ ...prev, phone: value }));
                    // Clear error when user is typing
                    if (phoneError) setPhoneError("");
                  }
                }}
                onBlur={() => {
                  // Validate on blur (when user leaves the field)
                  if (formData.phone.length > 0 && formData.phone.length < 10) {
                    setPhoneError("Please enter a valid 10-digit phone number");
                  }
                }}
                maxLength={10}
                placeholder="10-digit phone number"
                className={phoneError ? "border-red-500 focus-visible:ring-red-500" : ""}
                required
              />
              {phoneError && (
                <p className="text-sm text-red-500 mt-1">{phoneError}</p>
              )}
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
              <Label htmlFor="employmentType">Employment Type *</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, employmentType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="salaried">Salaried</SelectItem>
                  <SelectItem value="self_employed">Self Employed</SelectItem>
                  <SelectItem value="business">Business Owner</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="monthlyIncome">Monthly Income (₹) *</Label>
            <Input
              id="monthlyIncome"
              type="text"
              inputMode="numeric"
              value={formData.monthlyIncome}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow digits
                setFormData((prev) => ({
                  ...prev,
                  monthlyIncome: value,
                }))
              }}
              onKeyDown={(e) => {
                // Prevent 'e', 'E', '+', '-', '.'
                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
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

          <Button type="submit" disabled={loading || !isFormValid()} className="w-full">
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
