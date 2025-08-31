import React, { useState, useEffect } from "react";
import {
  Heart,
  Trash2,
  Share2,
  Calculator,
  GitCompare,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/Header";
import ShareModal from "@/components/ShareModal";
import IMAGINImage from "@/components/IMAGINImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { useToast } from "@/hooks/use-toast";
import { getCarSlugFromCar } from "@/utils/carSlugUtils";

interface WishlistCar {
  id: string;
  savedDate: string;
  priceAlert: boolean;
  car: {
    id: string;
    brand: string;
    model: string;
    variant: string;
    price: number;
    onRoadPrice: number;
    fuelType: string;
    transmission: string;
    mileage: number;
    seating: number;
    rating: number;
    image: string;
  };
}

// Debug component for development
const DebugAuthInfo = () => {
  const { user, tokens, isAuthenticated, loading, getAuthHeaders } =
    useUserAuth();

  const debugInfo = {
    isAuthenticated,
    isAuthenticatedType: typeof isAuthenticated,
    loading,
    user: user
      ? {
          id: user.id,
          email: user.email,
          provider: user.provider,
        }
      : null,
    tokens: tokens
      ? {
          hasAccessToken: !!tokens.accessToken,
          tokenType: tokens.tokenType,
          expiresAt: tokens.expiresAt,
          isExpired: tokens.expiresAt
            ? Date.now() >= tokens.expiresAt
            : "unknown",
          timeUntilExpiry: tokens.expiresAt
            ? Math.floor((tokens.expiresAt - Date.now()) / 1000)
            : "unknown",
        }
      : null,
    authHeaders: getAuthHeaders(),
    cookies: document.cookie,
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">🐛 Auth Debug Info</h3>
      <pre className="text-xs text-yellow-700 overflow-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};

const Wishlist = () => {
  const [savedCars, setSavedCars] = useState<WishlistCar[]>([]);
  const [selectedCars, setSelectedCars] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { user, isAuthenticated, loading: authLoading } = useUserAuth();
  const api = useAuthenticatedApi();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Enhanced authentication redirect - wait for auth loading to complete
  useEffect(() => {
    console.log("Auth state check:", {
      isAuthenticated,
      authLoading,
      user: user ? "exists" : "null",
      timestamp: new Date().toISOString(),
    });

    // Only redirect if authentication check is complete AND user is not authenticated
    if (!authLoading && isAuthenticated === false) {
      console.log("Auth complete - user not authenticated, redirecting...");
      navigate("/login", {
        state: { from: { pathname: "/wishlist" } },
        replace: true,
      });
    }
  }, [isAuthenticated, authLoading, navigate, user]);

  // Fetch wishlist data only when authenticated
  useEffect(() => {
    const fetchWishlist = async () => {
      // Don't fetch if auth is still loading or user is not authenticated
      if (authLoading || isAuthenticated !== true) {
        setLoading(false);
        return;
      }

      try {
        console.log("📋 Fetching user wishlist...");
        setLoading(true);
        setError(null);

        const response = await api.wishlist.getAll();

        if (response.success) {
          setSavedCars(response.data || []);
          console.log(
            `✅ Loaded ${response.data?.length || 0} cars from wishlist`
          );
        } else {
          throw new Error(response.error || "Failed to fetch wishlist");
        }
      } catch (err: any) {
        console.error("❌ Error fetching wishlist:", err);
        setError(err.message || "Failed to fetch wishlist");

        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your wishlist. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated, authLoading, api, toast]);

  const handleRemoveCar = async (carId: string) => {
    try {
      setActionLoading(`remove-${carId}`);
      console.log(`🗑️ Removing car ${carId} from wishlist...`);

      const response = await api.wishlist.remove(carId);

      if (response.success) {
        setSavedCars((prev) => prev.filter((item) => item.car.id !== carId));
        setSelectedCars((prev) => prev.filter((id) => id !== carId));

        toast({
          title: "Removed from wishlist",
          description: "Car has been removed from your wishlist.",
        });

        console.log("✅ Car removed from wishlist successfully");
      } else {
        throw new Error(response.error || "Failed to remove car");
      }
    } catch (err: any) {
      console.error("❌ Error removing car:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove car from wishlist. Please try again.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMultiple = async () => {
    if (selectedCars.length === 0) return;

    try {
      setActionLoading("bulk-remove");
      console.log(`🗑️ Removing ${selectedCars.length} cars from wishlist...`);

      const response = await api.wishlist.removeMultiple(selectedCars);

      if (response.success) {
        setSavedCars((prev) =>
          prev.filter((item) => !selectedCars.includes(item.car.id))
        );
        setSelectedCars([]);

        toast({
          title: "Removed from wishlist",
          description: `${response.data.removedCount} cars removed from your wishlist.`,
        });

        console.log("✅ Multiple cars removed from wishlist successfully");
      } else {
        throw new Error(response.error || "Failed to remove cars");
      }
    } catch (err: any) {
      console.error("❌ Error removing multiple cars:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove cars from wishlist. Please try again.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePriceAlert = async (
    carId: string,
    currentValue: boolean
  ) => {
    try {
      setActionLoading(`alert-${carId}`);
      console.log(
        `🔔 ${
          !currentValue ? "Enabling" : "Disabling"
        } price alert for car ${carId}...`
      );

      const response = await api.wishlist.togglePriceAlert(
        carId,
        !currentValue
      );

      if (response.success) {
        setSavedCars((prev) =>
          prev.map((item) =>
            item.car.id === carId
              ? { ...item, priceAlert: !currentValue }
              : item
          )
        );

        toast({
          title: `Price alert ${!currentValue ? "enabled" : "disabled"}`,
          description: `You will ${
            !currentValue ? "now" : "no longer"
          } receive price updates for this car.`,
        });

        console.log(
          `✅ Price alert ${
            !currentValue ? "enabled" : "disabled"
          } successfully`
        );
      } else {
        throw new Error(response.error || "Failed to toggle price alert");
      }
    } catch (err: any) {
      console.error("❌ Error toggling price alert:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update price alert. Please try again.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelectCar = (carId: string) => {
    setSelectedCars((prev) =>
      prev.includes(carId)
        ? prev.filter((id) => id !== carId)
        : [...prev, carId]
    );
  };

  const handleViewDetails = (car: WishlistCar["car"]) => {
    const slug = getCarSlugFromCar(car);
    navigate(`/cars/${slug}`);
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} Lakh`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                Checking authentication...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show unauthenticated state (backup - redirect should handle this)
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign in required</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Please sign in to view and manage your wishlist.
              </p>
              <Link to="/login">
                <Button className="bg-gradient-primary hover:opacity-90">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Show loading while fetching wishlist data (user is authenticated)
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading your wishlist...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Debug info for development */}
        {process.env.NODE_ENV === "development" && <DebugAuthInfo />}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Wishlist
            </h1>
            <p className="text-muted-foreground">
              {savedCars.length} cars saved • Keep track of your favorite cars
            </p>
          </div>

          {/* Bulk Actions */}
          {selectedCars.length > 0 && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{selectedCars.length} selected</Badge>
              <div className="flex gap-2">
                <Link to={`/compare?cars=${selectedCars.join(",")}`}>
                  <Button variant="outline" size="sm">
                    <GitCompare className="w-4 h-4 mr-2" />
                    Compare
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveMultiple}
                  disabled={actionLoading === "bulk-remove"}
                >
                  {actionLoading === "bulk-remove" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Remove
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                className="ml-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {savedCars.length === 0 ? (
          // Empty State
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start browsing cars and save your favorites to keep track of
                them easily.
              </p>
              <Link to="/cars">
                <Button className="bg-gradient-primary hover:opacity-90">
                  Browse Cars
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <h3 className="font-medium">Quick Actions:</h3>
                    <div className="flex gap-2">
                      <Link
                        to={`/compare?cars=${savedCars
                          .map((item) => item.car.id)
                          .join(",")}`}
                      >
                        <Button variant="outline" size="sm">
                          <GitCompare className="w-4 h-4 mr-2" />
                          Compare All
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate EMI
                      </Button>
                      <ShareModal
                        title="My Car Wishlist"
                        description={`Check out my saved cars on AutoPulses India - ${
                          savedCars.length
                        } cars including ${savedCars
                          .map((item) => `${item.car.brand} ${item.car.model}`)
                          .join(", ")}`}
                        url="/wishlist"
                      >
                        <Button variant="outline" size="sm">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Wishlist
                        </Button>
                      </ShareModal>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Price alerts active:{" "}
                    {savedCars.filter((item) => item.priceAlert).length} cars
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saved Cars Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCars.map((item) => (
                <div key={item.id} className="relative">
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 right-3 z-10">
                    <input
                      type="checkbox"
                      checked={selectedCars.includes(item.car.id)}
                      onChange={() => handleSelectCar(item.car.id)}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                    />
                  </div>

                  {/* Car Card */}
                  <Card className="group hover:shadow-auto-lg transition-all duration-300 hover:-translate-y-1 border-border overflow-hidden bg-gradient-card">
                    <div className="relative">
                      {/* Saved Date Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <Badge variant="secondary" className="text-xs">
                          Saved {formatDate(item.savedDate)}
                        </Badge>
                      </div>

                      {/* Price Alert Badge */}
                      {item.priceAlert && (
                        <div className="absolute top-10 left-3 z-10">
                          <Badge className="bg-success text-success-foreground text-xs">
                            Price Alert ON
                          </Badge>
                        </div>
                      )}

                      {/* Remove Button */}
                      <div className="absolute top-3 right-10 z-10">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-8 h-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveCar(item.car.id)}
                          disabled={actionLoading === `remove-${item.car.id}`}
                        >
                          {actionLoading === `remove-${item.car.id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {/* Car Image */}
                      <div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                        <IMAGINImage
                          src={item.car.images?.[0] || item.car.image || "/placeholder.svg"}
                          alt={`${item.car.brand} ${item.car.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          fallback="/placeholder.svg"
                        />
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Car Details */}
                      <div className="mb-3">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {item.car.brand} {item.car.model}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.car.variant}
                        </p>
                      </div>

                      {/* Specifications */}
                      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Fuel:</span>
                          <span className="font-medium">
                            {item.car.fuelType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">
                            Mileage:
                          </span>
                          <span className="font-medium">
                            {item.car.mileage} km/l
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">
                            Seating:
                          </span>
                          <span className="font-medium">
                            {item.car.seating}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-medium">
                            {item.car.transmission}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-foreground">
                          {formatPrice(item.car.price)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          On-road: {formatPrice(item.car.onRoadPrice)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                            onClick={() => handleViewDetails(item.car)}
                          >
                            View Details
                          </Button>
                          <Link to="/loan-application" className="flex-1">
                            <Button className="w-full bg-gradient-accent hover:opacity-90">
                              Get Offers
                            </Button>
                          </Link>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() =>
                            handleTogglePriceAlert(item.car.id, item.priceAlert)
                          }
                          disabled={actionLoading === `alert-${item.car.id}`}
                        >
                          {actionLoading === `alert-${item.car.id}` ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            `${
                              item.priceAlert ? "Disable" : "Enable"
                            } Price Alerts`
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
