import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Car,
  Shield,
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
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { createApiClient } from "@/utils/apiClient";

const AdminLogin = () => {
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
  const { login, loading } = useAdminAuth();

  // Get redirect path from location state
  const from = (location.state as any)?.from?.pathname || "/admin";

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
      console.log("🔐 Attempting admin login...");

      const result = await login(
        formData.email,
        formData.password
      );

      if (result.success) {
        toast({
          title: "Login Successful",
          description: (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Welcome to the admin dashboard!
            </div>
          ),
        });

        console.log("🚀 Redirecting to:", from);
        navigate(from, { replace: true });
      } else {
        throw new Error(result.error || "Login failed");
      }
    } catch (error: any) {
      console.error("❌ Admin login error:", error);

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
      } else if (error.message.includes("Admin access")) {
        errorMessage =
          "This account does not have admin privileges. Please contact your administrator.";
        errorTitle = "Access Denied";
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
                Carlist360
              </h1>
              <p className="text-sm text-primary-foreground/70">Admin Portal</p>
            </div>
          </Link>
        </div>

        <Card className="shadow-auto-lg bg-background/95 backdrop-blur-sm border-border">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <p className="text-muted-foreground">
              Sign in with your secure token-based credentials
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@Carlist360.com"
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
                    placeholder="Enter secure password"
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
                    Keep me signed in
                  </Label>
                </div>
                <Link
                  to="/admin/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Security Notice */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  This login uses secure HTTP-only cookies for authentication.
                  Your session will remain active for 7 days with automatic token refresh.
                </AlertDescription>
              </Alert>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-primary hover:opacity-90 shadow-auto-md"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  "Access Admin Dashboard"
                )}
              </Button>

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
                          email: "test@Carlist360.com",
                          password: "test123456",
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

              {/* Security Footer */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  🔒 This is a secure admin area. All activities are logged and
                  monitored.
                  <br />
                  Refresh tokens are stored in HTTP-only cookies for maximum
                  security.
                </p>
              </div>
            </form>
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

        {/* Development Info */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-4 bg-background/80 rounded-lg backdrop-blur-sm">
            <p className="text-xs text-center text-muted-foreground">
              <strong>Dev Mode:</strong> Using secure cookie-based auth with
              7-day access tokens + 30-day refresh tokens
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
