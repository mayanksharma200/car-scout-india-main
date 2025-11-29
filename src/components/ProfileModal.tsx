import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { User, LogOut, Settings, Heart, Car, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";

const ProfileModal = () => {
  const api = useAuthenticatedApi();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    city: "",
  });
  const { user, logout, updateUser } = useUserAuth(); // Add updateUser method
  const { toast } = useToast();

  // Debug: Log user data to see what's coming from Google
  useEffect(() => {
    console.log("ProfileModal - User data:", user);
    console.log("ProfileModal - User provider:", user?.provider);
    console.log("ProfileModal - User metadata:", user?.user_metadata);
  }, [user]);

  useEffect(() => {
    if (user && open) {
      // Handle both regular and Google OAuth users
      // Google users might have different field names or missing data
      const fullName = user.name || user.full_name ||
        (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "") ||
        user.given_name ||
        user.email?.split("@")[0] || "";

      setProfile({
        full_name: fullName,
        phone: user.phone || "",
        city: user.city || "",
      });

      // Debug: Log the profile data being set
      console.log("ProfileModal - Setting profile state:", {
        full_name: fullName,
        phone: user.phone || "",
        city: user.city || "",
        originalUser: user
      });
    }
  }, [user, open]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("ProfileModal - Updating profile with data:", profile);
      const result = await api.user.updateProfile(profile);

      if (!result.success) {
        throw new Error(result.error || "Failed to update profile");
      }

      // After updating profile, fetch the complete user data again
      const userResponse = await api.user.getProfile();
      console.log("ProfileModal - Profile update response:", userResponse);

      if (userResponse.success && userResponse.data) {
        // Handle different response structures
        const userData = userResponse.data.user || userResponse.data.profile || userResponse.data;

        if (userData) {
          // Update the user context with the complete data
          updateUser(userData);
          console.log("ProfileModal - Updated user context with:", userData);
        }
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setOpen(false);
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign out",
      });
    }
  };

  // Add this check to handle Google users properly
  if (!user) return null;

  // Get display name for Google users
  const getDisplayName = () => {
    // Try multiple field name combinations for Google OAuth users
    const firstName = user.firstName || user.given_name || user.user_metadata?.given_name || user.name?.split(" ")[0] || user.email?.split("@")[0] || "";
    const lastName = user.lastName || user.family_name || user.user_metadata?.family_name || user.name?.split(" ").slice(1).join(" ") || "";

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    return user.email?.split("@")[0] || "User";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium">{getDisplayName()}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            My Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info Display */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-medium">{getDisplayName()}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {user.email}
              </div>
              <div className="text-xs text-primary mt-1">
                {user.emailVerified
                  ? "✓ Email Verified"
                  : "⚠ Email not verified"}
              </div>
              {user.role && (
                <div className="text-xs text-muted-foreground mt-1">
                  Role: {user.role}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Link to="/wishlist" onClick={() => setOpen(false)}>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Heart className="w-4 h-4 mr-2" />
                Wishlist
              </Button>
            </Link>
            <Link to="/cars" onClick={() => setOpen(false)}>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Car className="w-4 h-4 mr-2" />
                Browse Cars
              </Button>
            </Link>
          </div>

          {/* Profile Update Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="Your phone number"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="Your city"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
                size="sm"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </div>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Update Profile
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSignOut}
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </form>

          {/* Google User Notice */}
          {user.provider === "google" && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Google Account:</strong> Some profile information is
                managed through your Google account.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
