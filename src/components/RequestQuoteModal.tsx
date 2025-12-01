import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";
import OTPVerification from "@/components/OTPVerification";

interface RequestQuoteModalProps {
  carName: string;
  carId?: string;
}

const RequestQuoteModal = ({ carName, carId }: RequestQuoteModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    timeline: "",
    budget_min: "",
    budget_max: "",
    message: ""
  });
  const { toast } = useToast();

  // Check if form is valid for submit button state
  const isFormValid = () => {
    return (
      formData.name.length >= 2 &&
      formData.email.length > 0 &&
      formData.phone.length === 10 &&
      formData.city.length >= 2 &&
      formData.timeline.length > 0 &&
      formData.budget_min.length > 0 &&
      formData.budget_max.length > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Name validation
    if (formData.name.length < 2) {
      toast({
        variant: "destructive",
        title: "Invalid Name",
        description: "Name must be at least 2 characters long"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address"
      });
      return;
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number"
      });
      return;
    }

    // Budget validation
    if (!formData.budget_min || parseInt(formData.budget_min) <= 0) {
      toast({
        variant: "destructive",
        title: "Budget Required",
        description: "Please enter minimum budget"
      });
      return;
    }

    if (!formData.budget_max || parseInt(formData.budget_max) <= 0) {
      toast({
        variant: "destructive",
        title: "Budget Required",
        description: "Please enter maximum budget"
      });
      return;
    }

    if (parseInt(formData.budget_min) > parseInt(formData.budget_max)) {
      toast({
        variant: "destructive",
        title: "Invalid Budget Range",
        description: "Minimum budget cannot be greater than maximum budget"
      });
      return;
    }

    // City validation
    if (formData.city.length < 2) {
      toast({
        variant: "destructive",
        title: "Invalid City",
        description: "City name must be at least 2 characters long"
      });
      return;
    }

    // Timeline validation
    if (!formData.timeline) {
      toast({
        variant: "destructive",
        title: "Timeline Required",
        description: "Please select your purchase timeline"
      });
      return;
    }

    setShowOTP(true);
  };

  const handleOTPVerified = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          timeline: formData.timeline,
          budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
          interested_car_id: carId,
          source: 'request_quote',
          status: 'new'
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to submit request");
      }

      toast({
        title: "Quote Request Submitted",
        description: "We'll send you a detailed quote shortly!"
      });

      setOpen(false);
      setShowOTP(false);
      setPhoneError("");
      setFormData({
        name: "",
        email: "",
        phone: "",
        city: "",
        timeline: "",
        budget_min: "",
        budget_max: "",
        message: ""
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" size="lg">
          <Mail className="w-4 h-4 mr-2" />
          Request Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Quote for {carName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                    setFormData(prev => ({ ...prev, phone: value }));
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
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="timeline">Purchase Timeline *</Label>
              <Select value={formData.timeline} onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="within_month">Within a month</SelectItem>
                  <SelectItem value="within_3_months">Within 3 months</SelectItem>
                  <SelectItem value="within_6_months">Within 6 months</SelectItem>
                  <SelectItem value="just_exploring">Just exploring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget_min">Budget From (₹) *</Label>
              <Input
                id="budget_min"
                type="text"
                inputMode="numeric"
                value={formData.budget_min}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow digits
                  setFormData(prev => ({ ...prev, budget_min: value }));
                }}
                onKeyDown={(e) => {
                  // Prevent 'e', 'E', '+', '-', '.'
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="5,00,000"
              />
            </div>
            <div>
              <Label htmlFor="budget_max">Budget To (₹) *</Label>
              <Input
                id="budget_max"
                type="text"
                inputMode="numeric"
                value={formData.budget_max}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow digits
                  setFormData(prev => ({ ...prev, budget_max: value }));
                }}
                onKeyDown={(e) => {
                  // Prevent 'e', 'E', '+', '-', '.'
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="10,00,000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="message">Additional Requirements</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
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

export default RequestQuoteModal;