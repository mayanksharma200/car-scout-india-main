import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { smsService } from "@/services/smsService";

interface OTPVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  phoneNumber: string;
}

const OTPVerification = ({
  isOpen,
  onClose,
  onVerified,
  phoneNumber,
}: OTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sentOtp, setSentOtp] = useState(""); // Store the sent OTP for development mode
  const { toast } = useToast();

  // Send OTP when component opens
  useEffect(() => {
    if (isOpen && phoneNumber && !otpSent) {
      sendOTP();
    }
  }, [isOpen, phoneNumber]);

  // Countdown timer for resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft > 0 && otpSent) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setCanResend(true);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft, otpSent]);

  // Clean up on component unmount or dialog close
  useEffect(() => {
    if (!isOpen) {
      setOtp("");
      setOtpSent(false);
      setSentOtp("");
      setTimeLeft(60);
      setCanResend(false);
      setLoading(false);
      setResendLoading(false);
    }
  }, [isOpen]);

  const sendOTP = async () => {
    try {
      setResendLoading(true);
      setCanResend(false);
      setTimeLeft(60);

      // Validate phone number first
      const validation = smsService.validatePhoneNumber(phoneNumber);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      console.log(`Sending OTP to ${phoneNumber}`);
      const result = await smsService.sendOTP(phoneNumber);

      if (result.success) {
        setOtpSent(true);

        // Store OTP for development mode only
        if (result.otp) {
          setSentOtp(result.otp);
        }

        toast({
          title: "OTP Sent",
          description:
            result.message || `Verification code sent to ${phoneNumber}`,
        });

        console.log("OTP sent successfully");
      } else {
        throw new Error(result.error || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Send OTP error:", error);

      toast({
        variant: "destructive",
        title: "Failed to Send OTP",
        description:
          error.message || "Please check your phone number and try again",
      });

      // Reset states on error
      setOtpSent(false);
      setSentOtp("");
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
      });
      return;
    }

    setLoading(true);

    try {
      console.log(`Verifying OTP: ${otp} for phone: ${phoneNumber}`);

      const verificationResult = await smsService.verifyOTP(phoneNumber, otp);

      if (verificationResult.success) {
        toast({
          title: "Phone Verified",
          description:
            verificationResult.message ||
            "Your phone number has been verified successfully",
        });

        console.log("OTP verified successfully");
        onVerified();
        onClose();
      } else {
        throw new Error(verificationResult.error || "Invalid OTP");
      }
    } catch (error: any) {
      console.error("Verify OTP error:", error);

      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
      });

      setOtp(""); // Clear the OTP input
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp(""); // Clear current OTP
    setOtpSent(false); // Reset OTP sent status
    setSentOtp(""); // Clear stored OTP
    await sendOTP();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClose = () => {
    // Clean up state when closing
    setOtp("");
    setOtpSent(false);
    setSentOtp("");
    setTimeLeft(60);
    setCanResend(false);
    setLoading(false);
    setResendLoading(false);
    onClose();
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return phone;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Your Phone Number</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              We've sent a 6-digit verification code to
            </p>
            <p className="font-medium">{formatPhoneNumber(phoneNumber)}</p>
          </div>

          {/* Development mode notice */}
          {process.env.NODE_ENV === "development" && sentOtp && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-700 font-medium">
                Development Mode
              </p>
              <p className="text-xs text-blue-600">OTP: {sentOtp}</p>
              <p className="text-xs text-blue-500 mt-1">
                This is only visible in development mode
              </p>
            </div>
          )}

          {/* Loading state for sending OTP */}
          {resendLoading && !otpSent && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-muted-foreground">
                  Sending OTP...
                </span>
              </div>
            </div>
          )}

          {otpSent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter Verification Code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>

                <div className="text-center">
                  {!canResend ? (
                    <p className="text-sm text-muted-foreground">
                      Resend code in {formatTime(timeLeft)}
                    </p>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={handleResendOTP}
                      disabled={resendLoading}
                      className="text-sm"
                    >
                      {resendLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        "Resend Code"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Error state for failed OTP send */}
          {!otpSent && !resendLoading && (
            <div className="text-center">
              <Button
                onClick={sendOTP}
                disabled={resendLoading}
                variant="outline"
                className="w-full"
              >
                {resendLoading ? "Sending..." : "Send OTP"}
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>
              Didn't receive the code? Check your SMS messages or try resending.
            </p>
            <p>OTP is valid for 10 minutes from the time it was sent.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerification;
