import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Car,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { createApiClient } from "@/utils/apiClient";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, loading } = useUserAuth();

  // Get redirect path from location state
  const from = (location.state as any)?.from?.pathname || "/";

  // Create API client instance for this component
  const api = createApiClient();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
      });
      return;
    }

    try {
      console.log("🔐 Attempting user login...");

      const result = await login(
        formData.email,
        formData.password,
        formData.rememberMe
      );

      if (result.success) {
        toast({
          title: "Login Successful",
          description: (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Welcome back to AutoScope!
            </div>
          ),
        });

        console.log("🚀 Redirecting to:", from);
        navigate(from, { replace: true });
      } else {
        throw new Error(result.error || "Login failed");
      }
    } catch (error: any) {
      console.error("❌ User login error:", error);

      let errorMessage = "An unexpected error occurred";
      let errorTitle = "Login Failed";
      let isStorageError = false;

      if (error.message.includes("Invalid credentials")) {
        errorMessage =
          "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message.includes("Too many")) {
        errorMessage =
          "Too many login attempts. Please wait a moment before trying again.";
        errorTitle = "Rate Limited";
      } else if (error.message.includes("Account is deactivated")) {
        errorMessage =
          "Your account has been deactivated. Please contact support.";
        errorTitle = "Account Deactivated";
      } else if (error.message.includes("localStorage")) {
        errorMessage =
          "Login successful, but some features might not work properly in this environment.";
        errorTitle = "Limited Functionality";
        isStorageError = true;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: isStorageError ? "default" : "destructive",
        title: errorTitle,
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </div>
        ),
      });

      if (isStorageError) {
        console.log("🚀 Redirecting despite localStorage error");
        navigate(from, { replace: true });
      }
    }
  };

  const handleTestConnection = async () => {
    try {
      const response = await api.cars.getFeatured();
      if (response.success) {
        toast({
          title: "Connection Test",
          description: "✅ Backend connection successful!",
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Test Failed",
        description: `❌ ${error.message || "Could not connect to backend"}`,
      });
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
                AutoScope
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
              <User className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <p className="text-muted-foreground">
              Sign in to your AutoScope account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 ${
                      validationErrors.email ? "border-destructive" : ""
                    }`}
                    required
                    autoComplete="email"
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-sm text-destructive">
                    {validationErrors.email}
                  </p>
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
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`pl-10 pr-10 ${
                      validationErrors.password ? "border-destructive" : ""
                    }`}
                    required
                    autoComplete="current-password"
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
                {validationErrors.password && (
                  <p className="text-sm text-destructive">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      handleInputChange("rememberMe", checked as boolean)
                    }
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-primary hover:opacity-90 shadow-auto-md"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-primary hover:underline font-medium"
                  >
                    Create account
                  </Link>
                </p>
              </div>

              {/* Development Tools */}
              {process.env.NODE_ENV === "development" && (
                <div className="space-y-2 pt-4 border-t">
                  <Label className="text-xs text-muted-foreground">
                    Development Tools:
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTestConnection}
                      className="text-xs"
                    >
                      Test Backend
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          email: "user@example.com",
                          password: "password123",
                          rememberMe: false,
                        });
                      }}
                      className="text-xs"
                    >
                      Fill Test Data
                    </Button>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  Your session will be kept secure with encrypted tokens. We
                  never store your password.
                </AlertDescription>
              </Alert>
            </form>
          </CardContent>
        </Card>

        {/* Back to Site */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-primary-foreground/70 hover:text-primary-foreground text-sm flex items-center justify-center gap-1"
          >
            ← Back to AutoScope India
          </Link>
        </div>

        {/* Development Info */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-4 bg-background/80 rounded-lg backdrop-blur-sm">
            <p className="text-xs text-center text-muted-foreground">
              <strong>Dev Mode:</strong> Using secure cookie-based auth with
              15min access tokens + 7d refresh tokens
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
