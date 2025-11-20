import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";

const AdminSetup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    adminKey: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { toast } = useToast();

  // Only show in development environment
  const isDev =
    import.meta.env.DEV || import.meta.env.VITE_DEBUG_MODE === "true";
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  // Only show if in development mode or on localhost
  if (!isDev && !isLocalhost) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const backendUrl =
        import.meta.env.VITE_API_URL || "/api";
      const response = await fetch(`${backendUrl}/auth/create-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Admin Created",
          description: `Admin user ${result.data.email} created successfully`,
        });
        setFormData({ email: "", password: "", adminKey: "" });
      } else {
        throw new Error(result.error || "Failed to create admin user");
      }
    } catch (error: any) {
      toast({
        title: "Admin Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 w-80 z-50 bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <CardTitle className="text-sm">Admin Setup (Dev)</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="h-6 w-6 p-0 hover:bg-blue-100"
          >
            {isVisible ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
        </div>
        {isVisible && (
          <CardDescription className="text-xs">
            Create admin user for development
          </CardDescription>
        )}
      </CardHeader>
      {isVisible && (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="admin-email" className="text-xs">
                Email
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@Carlist360.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="h-8 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="admin-password" className="text-xs">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="h-8 text-xs pr-8"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="admin-key" className="text-xs">
                Admin Key
              </Label>
              <Input
                id="admin-key"
                type="password"
                placeholder="Set ADMIN_CREATION_KEY in env"
                value={formData.adminKey}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, adminKey: e.target.value }))
                }
                className="h-8 text-xs"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-8 text-xs"
              size="sm"
            >
              {loading ? "Creating..." : "Create Admin User"}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
};

export default AdminSetup;
