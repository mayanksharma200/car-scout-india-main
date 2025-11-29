import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Car, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useUserAuth } from "@/contexts/UserAuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, googleLogin, user, loading } = useUserAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    newsletter: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Validation functions
  const validateField = (field: string, value: string | boolean): string => {
    switch (field) {
      case "firstName":
      case "lastName":
        if (typeof value === "string") {
          if (!value.trim()) {
            return `${field === "firstName" ? "First" : "Last"} name is required`;
          }
          if (value.trim().length < 2) {
            return `${field === "firstName" ? "First" : "Last"} name must be at least 2 characters`;
          }
          if (!/^[a-zA-Z\s'-]+$/.test(value)) {
            return "Name can only contain letters, spaces, hyphens, and apostrophes";
          }
        }
        break;

      case "email":
        if (typeof value === "string") {
          if (!value.trim()) {
            return "Email is required";
          }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return "Please enter a valid email address";
          }
        }
        break;

      case "phone":
        if (typeof value === "string") {
          if (!value.trim()) {
            return "Phone number is required";
          }
          // Indian phone number validation (10 digits, optionally starting with +91)
          const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
          const cleanedPhone = value.replace(/[\s-]/g, "");
          if (!phoneRegex.test(cleanedPhone)) {
            return "Please enter a valid Indian phone number (10 digits)";
          }
        }
        break;

      case "password":
        if (typeof value === "string") {
          if (!value) {
            return "Password is required";
          }
          if (value.length < 8) {
            return "Password must be at least 8 characters long";
          }
          if (!/(?=.*[a-z])/.test(value)) {
            return "Password must contain at least one lowercase letter";
          }
          if (!/(?=.*[A-Z])/.test(value)) {
            return "Password must contain at least one uppercase letter";
          }
          if (!/(?=.*\d)/.test(value)) {
            return "Password must contain at least one number";
          }
          if (!/(?=.*[@$!%*?&#])/.test(value)) {
            return "Password must contain at least one special character (@$!%*?&#)";
          }
        }
        break;

      case "confirmPassword":
        if (typeof value === "string") {
          if (!value) {
            return "Please confirm your password";
          }
          if (value !== formData.password) {
            return "Passwords do not match";
          }
        }
        break;

      case "agreeToTerms":
        if (typeof value === "boolean" && !value) {
          return "You must agree to the terms and conditions";
        }
        break;
    }
    return "";
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    // Special handling for phone field - only allow numbers, +, spaces, and hyphens
    if (field === "phone" && typeof value === "string") {
      // Only allow digits, +, spaces, and hyphens
      const sanitizedValue = value.replace(/[^\d+\s-]/g, "");
      value = sanitizedValue;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Validate field on change if it has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    }

    // Special case: if password changes, revalidate confirmPassword
    if (field === "password" && touched.confirmPassword) {
      const confirmError = validateField("confirmPassword", formData.confirmPassword);
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    const error = validateField(field, formData[field as keyof typeof formData]);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields = ["firstName", "lastName", "email", "phone", "password", "confirmPassword", "agreeToTerms"];
    const touchedFields = allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(touchedFields);

    // Validate all fields
    const newErrors: Record<string, string> = {};
    allFields.forEach((field) => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix all errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { success, error } = await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });

      if (!success) {
        if (error?.includes("User already exists")) {
          toast({
            title: "Account Already Exists",
            description:
              "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Failed",
            description: error || "Failed to create account",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Account Created Successfully!",
        description:
          "Your account has been created and you are now logged in.",
      });

      // Navigation is handled by the useEffect that watches 'user'
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { success, error } = await googleLogin();

      if (!success) {
        toast({
          title: "Google Sign In Failed",
          description: error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Google Sign In Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFacebookSignIn = async () => {
    toast({
      title: "Coming Soon",
      description: "Facebook login is not yet supported.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
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
              <p className="text-sm text-primary-foreground/70">India</p>
            </div>
          </Link>
        </div>

        <Card className="shadow-auto-lg bg-background/95 backdrop-blur-sm border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <p className="text-muted-foreground">
              Join Carlist360 to save cars and get personalized recommendations
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      onBlur={() => handleBlur("firstName")}
                      className={`pl-10 ${errors.firstName && touched.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      required
                    />
                  </div>
                  {errors.firstName && touched.firstName && (
                    <p className="text-xs text-red-500">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    onBlur={() => handleBlur("lastName")}
                    className={errors.lastName && touched.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}
                    required
                  />
                  {errors.lastName && touched.lastName && (
                    <p className="text-xs text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={`pl-10 ${errors.email && touched.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    required
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="10-digit phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    onBlur={() => handleBlur("phone")}
                    className={`pl-10 ${errors.phone && touched.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    required
                  />
                </div>
                {errors.phone && touched.phone && (
                  <p className="text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    onBlur={() => handleBlur("password")}
                    className={`pl-10 pr-10 ${errors.password && touched.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    required
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
                {errors.password && touched.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
                {!errors.password && formData.password && (
                  <p className="text-xs text-muted-foreground">
                    Must contain: 8+ chars, uppercase, lowercase, number, special char
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    onBlur={() => handleBlur("confirmPassword")}
                    className={`pl-10 pr-10 ${errors.confirmPassword && touched.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms & Newsletter */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => {
                        handleInputChange("agreeToTerms", checked as boolean);
                        if (touched.agreeToTerms) {
                          handleBlur("agreeToTerms");
                        }
                      }}
                      required
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="text-primary hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  {errors.agreeToTerms && touched.agreeToTerms && (
                    <p className="text-xs text-red-500">{errors.agreeToTerms}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={formData.newsletter}
                    onCheckedChange={(checked) =>
                      handleInputChange("newsletter", checked as boolean)
                    }
                  />
                  <Label htmlFor="newsletter" className="text-sm">
                    Send me car updates and promotional offers
                  </Label>
                </div>
              </div>

              {/* Create Account Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 shadow-auto-md"
                disabled={!formData.agreeToTerms || isSubmitting || loading}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or sign up with
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting || loading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleFacebookSignIn}
                  disabled={isSubmitting || loading}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
