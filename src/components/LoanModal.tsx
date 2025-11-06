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
      // Prepare the lead data with only fields that exist in the database
      const leadData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        source: config.source,
        status: "new",
      };

      // Add optional fields only if they exist in the schema
      // Try to add new fields, fall back gracefully if columns don't exist
      if (formData.employmentType) {
        leadData.employment_type = formData.employmentType;
      }
      if (formData.monthlyIncome) {
        leadData.monthly_income = parseInt(formData.monthlyIncome);
      }
      if (loanAmount) {
        leadData.loan_amount = loanAmount;
      }
      if (emiAmount) {
        leadData.emi_amount = emiAmount;
      }
      if (formData.message) {
        leadData.message = formData.message;
      }

      const { error } = await supabase.from("leads").insert(leadData);

      if (error) {
        // If error is due to missing columns, retry with only basic fields
        if (error.message.includes("column") && error.message.includes("does not exist")) {
          console.warn("Some columns don't exist, saving with basic fields only:", error.message);

          const basicData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            source: config.source,
            status: "new",
          };

          const { error: retryError } = await supabase.from("leads").insert(basicData);
          if (retryError) throw retryError;

          toast({
            title: "Request Submitted (Partial)",
            description: "Your basic information has been saved. Some loan details couldn't be saved due to a database schema issue. Please contact support.",
            variant: "default",
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
          setLoading(false);
          return;
        }
        throw error;
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
