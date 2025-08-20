// src/components/FeaturedCars.tsx
import { useState, useEffect } from "react";
import { carAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { getCarSlugFromCar } from "@/utils/carSlugUtils";
import { supabase } from "@/integrations/supabase/client";
import WishlistButton from "@/components/WishlistButton";
import { Share2 } from "lucide-react";
import { useMultipleWishlistStatus } from "@/services/wishlistService";
import { useUserAuth } from "@/contexts/UserAuthContext";

const FeaturedCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useUserAuth();

  // Extract car IDs for wishlist checking
  const carIds = cars.map((car) => car.id);
  const { statuses: wishlistStatuses, loading: wishlistLoading } =
    useMultipleWishlistStatus(
      user ? carIds : [] // Only check wishlist if user is logged in
    );

  // Mock data fallback (same as before)
  const mockCars = [
    {
      id: "mock-1",
      brand: "Maruti Suzuki",
      model: "Swift",
      variant: "ZXI+ AMT",
      price_min: 849000,
      price_max: 967000,
      images: ["/placeholder.svg"],
      fuel_type: "Petrol",
      transmission: "AMT",
      mileage: "23.2 kmpl",
      seating_capacity: 5,
      rating: 4.2,
      isPopular: true,
    },
    // ... other mock cars
  ];

  useEffect(() => {
    const fetchCars = async () => {
      try {
        console.log("🔍 Fetching cars...");
        setLoading(true);
        setError(null);

        let carsData = null;

        // Try API first
        try {
          const response = await carAPI.getFeatured();
          console.log("📊 API response:", response);

          if (response.success && response.data && response.data.length > 0) {
            console.log("✅ Successfully fetched cars from API");
            carsData = response.data;
          }
        } catch (apiError) {
          console.warn(
            "⚠️ API not available, trying Supabase directly:",
            apiError.message
          );
        }

        // If API failed, try Supabase directly
        if (!carsData) {
          console.log("🔄 Falling back to Supabase direct access...");
          const { data: supabaseData, error: supabaseError } = await supabase
            .from("cars")
            .select("*")
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(8);

          if (supabaseError) {
            console.warn("⚠️ Supabase error, using mock data:", supabaseError);
            setCars(mockCars);
          } else if (supabaseData && supabaseData.length > 0) {
            console.log("✅ Successfully fetched cars from Supabase");
            carsData = supabaseData;
          } else {
            console.log("📝 No cars found in Supabase, using mock data");
            setCars(mockCars);
          }
        }

        if (carsData) {
          setCars(carsData);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error("❌ Error fetching cars:", errorMessage);
        setCars(mockCars);
        setError(null); // Don't show error, just use mock data
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const formatPrice = (price) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lakh`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const handleViewDetails = (car) => {
    const slug = getCarSlugFromCar(car);
    navigate(`/cars/${slug}`);
  };

  const handleShare = (car) => {
    const slug = getCarSlugFromCar(car);
    const url = `${window.location.origin}/cars/${slug}`;

    if (navigator.share) {
      navigator.share({
        title: `${car.brand} ${car.model} - AutoScope India`,
        text: `Check out this ${car.brand} ${car.model} on AutoScope India`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 animate-fade-in">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Featured Cars
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Discover the most popular and best-selling cars in India.
              Hand-picked selections based on customer reviews, sales data, and
              expert ratings.
            </p>
          </div>
          <Link to="/cars">
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground hidden lg:block"
            >
              View All Cars
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg border border-border p-4 animate-pulse"
                >
                  <div className="h-40 bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))
            : cars.map((car, index) => {
                // Transform API data to match CarCard interface
                const transformedCar = {
                  id: car.id,
                  brand: car.brand || "Unknown",
                  model: car.model || "Unknown",
                  variant: car.variant || "",
                  price: car.price_min || 0,
                  onRoadPrice: car.price_max || car.price_min || 0,
                  fuelType: car.fuel_type || "Petrol",
                  transmission: car.transmission || "Manual",
                  mileage: parseFloat(
                    car.mileage?.toString().replace(/[^\d.]/g, "") || "0"
                  ),
                  seating: car.seating_capacity || 5,
                  rating: car.rating || 4.2 + Math.random() * 0.8,
                  image:
                    Array.isArray(car.images) && car.images.length > 0
                      ? typeof car.images[0] === "string"
                        ? car.images[0]
                        : "/placeholder.svg"
                      : "/placeholder.svg",
                  isPopular: car.isPopular || Math.random() > 0.5,
                  isBestSeller: car.isBestSeller || Math.random() > 0.7,
                  // Additional fields for navigation
                  bodyType: car.body_type || "Hatchback",
                  color: "Pearl White",
                  year: 2024,
                  features: car.features || [],
                };

                // Get wishlist status for this car
                const wishlistStatus = wishlistStatuses[car.id] || {
                  inWishlist: false,
                  addedAt: null,
                };

                return (
                  <div
                    key={car.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 animate-fade-in hover-scale"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Image with badges */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      <img
                        src={transformedCar.image}
                        alt={`${transformedCar.brand} ${transformedCar.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3">
                        {transformedCar.isBestSeller && (
                          <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <span className="w-1 h-1 bg-white rounded-full"></span>
                            Best Seller
                          </span>
                        )}
                        {transformedCar.isPopular &&
                          !transformedCar.isBestSeller && (
                            <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                              <span className="w-1 h-1 bg-white rounded-full"></span>
                              Popular
                            </span>
                          )}
                      </div>

                      {/* Action icons */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        {/* Pass wishlist status to avoid additional API calls */}
                        <WishlistButton
                          carId={car.id}
                          variant="icon"
                          className="shadow-sm hover:shadow-md"
                          initialStatus={wishlistStatus} // Add this prop to your WishlistButton
                        />
                        <button
                          className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all border"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(transformedCar);
                          }}
                        >
                          <Share2 className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Rest of the component remains the same */}
                    <div className="p-4">
                      {/* Title and Rating */}
                      <div className="mb-3">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {transformedCar.brand} {transformedCar.model}
                        </h3>
                        {transformedCar.variant && (
                          <p className="text-gray-600 text-sm mb-2">
                            {transformedCar.variant}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <span className="text-orange-400 text-sm">★</span>
                            <span className="text-sm font-medium text-gray-900 ml-1">
                              {transformedCar.rating.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-gray-400 text-sm">
                            | 142 Reviews
                          </span>
                        </div>
                      </div>

                      {/* Specifications grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19 7h-1V6a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1v5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5h1a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM8 6h8v1H8V6zm8 12H8v-4h8v4zm2-6h-1V8H7v4H6V9h12v3z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Fuel</p>
                            <p className="text-sm font-medium text-gray-900">
                              {transformedCar.fuelType}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Mileage</p>
                            <p className="text-sm font-medium text-gray-900">
                              {transformedCar.mileage} km/l
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Seating</p>
                            <p className="text-sm font-medium text-gray-900">
                              {transformedCar.seating} Seater
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Type</p>
                            <p className="text-sm font-medium text-gray-900">
                              {transformedCar.transmission}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-blue-600">
                            ₹{(transformedCar.price / 100000).toFixed(2)} L
                          </span>
                          <span className="text-sm text-gray-500">onwards</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          On-road price: ₹
                          {(transformedCar.onRoadPrice / 100000).toFixed(2)} L
                        </p>
                      </div>

                      {/* Action button */}
                      <button
                        onClick={() => handleViewDetails(transformedCar)}
                        className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-orange-600 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        View Details
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Mobile View All button */}
        <div className="text-center mt-8 lg:hidden">
          <Link to="/cars">
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              View All Cars
            </Button>
          </Link>
        </div>

        {/* Error message (if any) */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center mt-6">
            <p className="text-amber-800">Using sample data. {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-amber-900 underline hover:no-underline"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCars;
