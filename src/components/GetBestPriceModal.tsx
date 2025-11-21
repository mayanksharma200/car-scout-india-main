import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Phone } from "lucide-react";
import OTPVerification from "@/components/OTPVerification";

interface GetBestPriceModalProps {
  carName: string;
  carId?: string;
}

const GetBestPriceModal = ({ carName, carId }: GetBestPriceModalProps) => {
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
      formData.timeline.length > 0
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
      const { error } = await supabase.from('leads').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        timeline: formData.timeline,
        interested_car_id: carId,
        source: 'get_best_price',
        status: 'new'
      });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "We'll contact you with the best price shortly!"
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
        <Button className="w-full" size="lg">
          <Phone className="w-4 h-4 mr-2" />
          Get Best Price
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Get Best Price for {carName}</DialogTitle>
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

export default GetBestPriceModal;