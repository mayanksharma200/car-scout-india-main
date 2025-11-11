import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Car,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Key,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createApiClient } from "@/utils/apiClient";

type Step = "email" | "otp" | "reset";

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();
  const api = createApiClient();

  // Countdown timer for resend OTP
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "/api"}/auth/forgot-password/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, role: "user" }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "OTP Sent",
          description: (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {data.message}
            </div>
          ),
        });
        setStep("otp");
        startCountdown();
      } else {
        throw new Error(data.error || "Failed to send OTP");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error.message || "Failed to send OTP. Please try again."}
          </div>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "/api"}/auth/forgot-password/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp, role: "user" }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "OTP Verified",
          description: (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {data.message}
            </div>
          ),
        });
        setResetToken(data.resetToken);
        setStep("reset");
      } else {
        throw new Error(data.error || "Invalid OTP");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error.message || "Failed to verify OTP. Please try again."}
          </div>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 8 characters long",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "/api"}/auth/forgot-password/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            resetToken,
            newPassword,
            role: "user",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Password Reset Successful",
          description: (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {data.message}
            </div>
          ),
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error(data.error || "Failed to reset password");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error.message || "Failed to reset password. Please try again."}
          </div>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Car className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">
                Carlist360
              </h1>
              <p className="text-sm text-primary-foreground/70">
                Find Your Perfect Car
              </p>
            </div>
          </Link>
        </div>

        <Card className="shadow-auto-lg bg-background/95 backdrop-blur-sm border-border">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <p className="text-muted-foreground">
              {step === "email" && "Enter your email to receive an OTP"}
              {step === "otp" && "Enter the OTP sent to your email"}
              {step === "reset" && "Create your new password"}
            </p>
          </CardHeader>

          <CardContent>
            {/* Step 1: Email Input */}
            {step === "email" && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending OTP...
                    </div>
                  ) : (
                    "Send OTP"
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    We've sent a 6-digit OTP to <strong>{email}</strong>. It will
                    expire in 10 minutes.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest font-mono"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the OTP?
                  </p>
                  {countdown > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Resend in {countdown}s
                    </p>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSendOTP}
                      disabled={loading}
                    >
                      Resend OTP
                    </Button>
                  )}
                </div>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep("email")}
                    className="text-primary"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Change Email
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Reset Password */}
            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Password must be at least 8 characters long.
                  </AlertDescription>
                </Alert>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Resetting Password...
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Back to Site */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-primary-foreground/70 hover:text-primary-foreground text-sm flex items-center justify-center gap-1"
          >
            ← Back to Carlist360 India
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
