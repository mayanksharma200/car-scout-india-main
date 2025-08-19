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

const ProfileModal = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
  });
  const { user, logout } = useUserAuth();
  const { toast } = useToast();

  // Debug: Log user data to see what's coming from Google
  useEffect(() => {
    console.log("ProfileModal - User data:", user);
  }, [user]);

  useEffect(() => {
    if (user && open) {
      // Handle Google users who might have different data structure
      const googleFirstName =
        user.firstName || user.given_name || user.name?.split(" ")[0] || "";
      const googleLastName =
        user.lastName || user.family_name || user.name?.split(" ")[1] || "";

      setProfile({
        firstName: googleFirstName,
        lastName: googleLastName,
        phone: user.phone || "",
        city: user.city || "",
      });
    }
  }, [user, open]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API call to update profile
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });

      setOpen(false);
    } catch (error: any) {
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
    } catch (error: any) {
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
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.name) {
      return user.name;
    }
    if (user.given_name && user.family_name) {
      return `${user.given_name} ${user.family_name}`;
    }
    return user.email?.split("@")[0] || "User";
  };

  const getFirstName = () => {
    return user.firstName || user.given_name || user.name?.split(" ")[0] || "";
  };

  const getLastName = () => {
    return user.lastName || user.family_name || user.name?.split(" ")[1] || "";
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
      <DialogContent className="sm:max-w-md">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  placeholder="Enter last name"
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
