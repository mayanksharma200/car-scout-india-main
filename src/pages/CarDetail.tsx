import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Star, Share2, ArrowLeft, Phone, Mail, Calendar, Palette, Car as CarIcon, Zap, Gauge, Users, Fuel } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareModal from "@/components/ShareModal";
import CarImageGallery from "@/components/CarImageGallery";
import CarColorSelector from "@/components/CarColorSelector";
import GetBestPriceModal from "@/components/GetBestPriceModal";
import RequestQuoteModal from "@/components/RequestQuoteModal";
import AdBanner from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useToast } from "@/hooks/use-toast";
import { findCarBySlug, createCarSlug, getCarSlugFromCar } from "@/utils/carSlugUtils";
import { supabase } from "@/integrations/supabase/client";
import { addMissingMGHectorCars } from "@/utils/addMissingCars";

const CarDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [currentCarImages, setCurrentCarImages] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [isColorChanging, setIsColorChanging] = useState(false);

  const { isAuthenticated } = useUserAuth();
  const api = useAuthenticatedApi();
  const { toast } = useToast();

  useEffect(() => {
    loadCarBySlug();
  }, [slug]);

  useEffect(() => {
    if (car && isAuthenticated) {
      checkWishlistStatus();
    }
  }, [car, isAuthenticated]);

  const checkWishlistStatus = async () => {
    if (!car || !isAuthenticated) return;

    try {
      const response = await api.wishlist.check(car.id);
      if (response.success) {
        setIsWishlisted(response.data.inWishlist);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const toggleWishlist = async () => {
    if (!car || !isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save cars to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      setWishlistLoading(true);

      if (isWishlisted) {
        const response = await api.wishlist.remove(car.id);
        if (response.success) {
          setIsWishlisted(false);
          toast({
            title: "Removed from wishlist",
            description: "Car has been removed from your wishlist.",
          });
        }
      } else {
        const response = await api.wishlist.add(car.id);
        if (response.success) {
          setIsWishlisted(true);
          toast({
            title: "Added to wishlist",
            description: "Car has been saved to your wishlist.",
          });
        }
      }
    } catch (error: any) {
      console.error("Error toggling wishlist:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  const loadCarBySlug = async () => {
    try {
      console.log("🔍 Loading car by slug:", slug);
      setLoading(true);

      let carsData = null;

      // Try to get all cars from API first
      try {
        const response = await api.cars.getAll({ status: "active" });
        if (response.success && response.data) {
          carsData = response.data;
          console.log("✅ Data loaded from backend API");
        }
      } catch (apiError) {
        console.warn(
          "⚠️ Backend API not available, trying Supabase directly:",
          apiError.message
        );
      }

      // If API failed, try Supabase directly
      if (!carsData) {
        console.log("🔄 Falling back to Supabase direct access...");
        const { data: supabaseData, error: supabaseError } = await supabase
          .from("cars")
          .select("*")
          .eq("status", "active");

        if (supabaseError) {
          console.error("❌ Supabase error:", supabaseError);
          throw new Error("Failed to load cars from both API and Supabase");
        }

        carsData = supabaseData;
        console.log("✅ Data loaded from Supabase directly");
      }

      if (carsData) {
        console.log("All cars loaded:", carsData);

        // Transform cars to match existing interface while preserving key fields
        const transformedCars = carsData.map((dbCar) => {
          // Get the first image from the images array, or use placeholder
          let carImage = "/placeholder.svg";
          if (
            Array.isArray(dbCar.images) &&
            dbCar.images.length > 0 &&
            dbCar.images[0] !== "/placeholder.svg"
          ) {
            carImage = dbCar.images[0] as string;
          }

          return {
            ...dbCar, // Keep all original fields
            // Override specific fields with transformed values
            price: dbCar.price_min || dbCar.price || 0,
            onRoadPrice:
              dbCar.price_max || dbCar.onRoadPrice || dbCar.price_min || 0,
            fuelType: dbCar.fuel_type || dbCar.fuelType || "Petrol",
            bodyType: dbCar.body_type || dbCar.bodyType || "Hatchback",
            seating: dbCar.seating_capacity || dbCar.seating || 5,
            rating: dbCar.rating || 4.2 + Math.random() * 0.8,
            image: carImage,
            color: dbCar.color || "Pearl White",
            year: dbCar.year || 2024,
            features: dbCar.features || [],
            mileage: parseFloat(
              dbCar.mileage?.toString()?.replace(/[^\d.]/g, "") || "15"
            ),
            reviews: dbCar.reviews || Math.floor(Math.random() * 500) + 50,
            isPopular: dbCar.isPopular || Math.random() > 0.7,
            isBestSeller: dbCar.isBestSeller || Math.random() > 0.8,
            // Ensure these key fields are never empty for slug generation
            brand: dbCar.brand || "Unknown",
            model: dbCar.model || "Unknown",
            variant: dbCar.variant || "",
          };
        });

        // Debug: Log all available cars and their slugs
        console.log(
          "Available cars from API:",
          transformedCars.map((car) => ({
            id: car.id,
            brand: car.brand,
            model: car.model,
            variant: car.variant,
            slug: getCarSlugFromCar(car),
          }))
        );

        console.log("Looking for slug:", slug);

        // Find car by slug
        let foundCar = findCarBySlug(transformedCars, slug || "");

        // If not found, try some common redirects for missing cars
        if (!foundCar && slug) {
          const redirectMap = {
            "mg-hector-super": ["mg-astor-sharp", "mg-astor-super"],
            "mg-hector-style": ["mg-astor-style"],
            "mg-hector-smart": ["mg-astor-sharp"],
          };

          if (redirectMap[slug]) {
            for (const redirectSlug of redirectMap[slug]) {
              foundCar = findCarBySlug(transformedCars, redirectSlug);
              if (foundCar) {
                console.log(`🔀 Redirecting from ${slug} to ${redirectSlug}`);
                // Update URL without page reload
                window.history.replaceState({}, "", `/cars/${redirectSlug}`);
                break;
              }
            }
          }
        }

        if (foundCar) {
          console.log(
            "✅ Found car:",
            foundCar.brand,
            foundCar.model,
            foundCar.variant
          );
          console.log("🖼️ Car images data:", {
            images: foundCar.images,
            imagesType: typeof foundCar.images,
            imagesIsArray: Array.isArray(foundCar.images),
            imagesLength: foundCar.images?.length,
            firstImage: foundCar.images?.[0],
            image: foundCar.image,
          });
          setCar(foundCar);
        } else {
          console.error("❌ Car not found for slug:", slug);
          console.error(
            "Available slugs:",
            transformedCars.map((car) => getCarSlugFromCar(car))
          );

          // Try to find a similar car or suggest alternatives
          const suggestedCars = transformedCars.filter(
            (car) =>
              car.brand.toLowerCase().includes("mg") ||
              car.model.toLowerCase().includes("hector") ||
              getCarSlugFromCar(car).includes("mg")
          );

          if (suggestedCars.length > 0) {
            console.log(
              "🔍 Suggested similar cars:",
              suggestedCars.map((car) => ({
                brand: car.brand,
                model: car.model,
                variant: car.variant,
                slug: getCarSlugFromCar(car),
              }))
            );
          }

          // If looking for MG Hector and not found, try to add missing cars and retry
          if (slug?.includes("mg-hector")) {
            console.log("🔧 Attempting to add missing MG Hector cars...");
            addMissingMGHectorCars()
              .then((result) => {
                if (result.success && result.count && result.count > 0) {
                  console.log("🔄 MG Hector cars added, retrying...");
                  // Retry loading after adding cars
                  setTimeout(() => {
                    loadCarBySlug();
                  }, 1000);
                }
              })
              .catch((err) => {
                console.error("Failed to add MG Hector cars:", err);
              });
          }

          setCar(null);
        }
      } else {
        console.error("🔄 API response failed or no data");
        setCar(null);
      }
    } catch (error) {
      console.error("🔥 Error loading car by slug:", error.message || error);
      setCar(null);
      toast({
        title: "Error loading car",
        description: "Failed to load car details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic car images using the IMAGIN.studio API utility
  const generateCarImages = (
    car: any,
    paintId: string = "1",
    paintDescription: string = "white",
    actualApiPaintId?: string,
    actualApiDescription?: string
  ) => {
    if (!car) return [];

    // Handle both old array format and new angle-mapped object format
    if (car.images) {
      // If images is an object with angle keys (new format)
      if (typeof car.images === 'object' && !Array.isArray(car.images)) {
        const angleOrder = [
          'front_3_4', 'front_view', 'left_side', 'right_side',
          'rear_view', 'interior_dash', 'interior_cabin', 'interior_steering'
        ];
        const imageUrls = angleOrder
          .filter(angle => car.images[angle])
          .map(angle => car.images[angle]);
        
        if (imageUrls.length > 0) {
          return imageUrls;
        }
      }
      
      // If images is an array (old format)
      if (Array.isArray(car.images) && car.images.length > 0) {
        return car.images.map((url: string, index: number) => url);
      }
    }

    // Fallback to placeholder if no images
    return ["/placeholder.svg"];
  };

  // In your CarDetail component, update the color change handler:
  const handleColorChange = async (colorOption: any) => {
    console.log("🎨 Changing car color to:", colorOption);

    // Prevent multiple simultaneous color changes
    if (isColorChanging) return;

    setIsColorChanging(true);
    setSelectedColor(colorOption);

    if (car) {
      try {
        // Generate new images with the selected color, using actual API paint IDs if available
        const newImages = generateCarImages(
          car,
          colorOption.paintId,
          colorOption.paintDescription,
          colorOption.actualApiPaintId,
          colorOption.actualApiDescription
        );
        console.log("🖼️ New images with color:", newImages);
        console.log("🎨 Using actual API paint ID:", colorOption.actualApiPaintId || 'fallback to simple ID');

        // Small delay to prevent jarring transitions and allow DOM to stabilize
        await new Promise((resolve) => setTimeout(resolve, 300));

        setCurrentCarImages(newImages);

        // Update car color in state
        setCar((prev) => ({
          ...prev,
          color: colorOption.name,
        }));

        // Show toast notification
        toast({
          title: "Color Updated",
          description: `Car color changed to ${colorOption.name}`,
        });
      } catch (error) {
        console.error("Error changing color:", error);
        toast({
          title: "Error",
          description: "Failed to change car color. Please try again.",
          variant: "destructive",
        });
      } finally {
        // Delay to ensure smooth transition completion
        setTimeout(() => {
          setIsColorChanging(false);
        }, 500);
      }
    }
  };

  // Initialize car images when car loads
  useEffect(() => {
    if (car && !currentCarImages.length) {
      // If car has existing images, use them, otherwise generate new ones
      const initialImages =
        Array.isArray(car.images) && car.images.length > 0
          ? car.images
          : generateCarImages(car);

      setCurrentCarImages(initialImages);
      console.log("🚗 Initial car images set:", initialImages);
    }
  }, [car]);

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading car details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <CarIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Car not found</h3>
            <p className="text-muted-foreground mb-4">
              {slug?.includes("mg-hector")
                ? "The MG Hector variant you're looking for is not available. Try browsing our MG Astor collection instead."
                : "The car you're looking for doesn't exist."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              {slug?.includes("mg-hector") && (
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/cars?brand=MG")}
                >
                  Browse MG Cars
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdBanner placement="below_navigation" />

      <div className="container mx-auto px-4 py-4 md:py-6 lg:py-8 max-w-7xl overflow-hidden">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4 md:mb-6 text-sm max-w-full overflow-hidden">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-muted-foreground flex-shrink-0">/</span>
          <span className="text-muted-foreground flex-shrink-0">Cars</span>
          <span className="text-muted-foreground flex-shrink-0">/</span>
          <span className="font-medium truncate min-w-0">
            {car.brand} {car.model}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-full">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 lg:space-y-8 min-w-0 max-w-full overflow-hidden">
            {/* Car Header */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="font-medium">{car.rating.toFixed(2)}</span>
                  <span className="text-muted-foreground">
                    ({car.reviews} Reviews)
                  </span>
                </div>
                <Badge variant="secondary">Most Popular</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleWishlist}
                disabled={wishlistLoading}
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${
                    isWishlisted ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                {wishlistLoading
                  ? "Loading..."
                  : isWishlisted
                  ? "Saved"
                  : "Save"}
              </Button>
              <ShareModal
                title={`${car.brand} ${car.model} ${car.variant}`}
                description={`Check out this ${car.brand} ${
                  car.model
                } starting from ${formatPrice(car.price)}`}
                url={window.location.pathname}
                image={Array.isArray(car.images) ? car.images[0] : car.image}
              >
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </ShareModal>
            </div>

            {/* Image Gallery with Loading Overlay */}
            <div className="relative w-full max-w-full overflow-hidden">
              <CarImageGallery
                images={(() => {
                  // Use dynamic color images if available, otherwise fallback to original
                  const imageData =
                    currentCarImages.length > 0
                      ? currentCarImages
                      : Array.isArray(car.images)
                      ? car.images
                      : [car.image];

                  console.log("🎬 Passing to CarImageGallery:", {
                    currentCarImages: currentCarImages,
                    originalImages: car.images,
                    originalImage: car.image,
                    finalImageData: imageData,
                    imageDataLength: imageData?.length,
                    firstItem: imageData?.[0],
                    isColorChanging: isColorChanging,
                  });
                  return imageData;
                })()}
                carName={`${car.brand} ${car.model}`}
                isLoading={isColorChanging}
                show360View={true}
                car={{
                  brand: car.brand,
                  model: car.model,
                  variant: car.variant || car.body_type || 'suv',
                }}
                currentColor={(() => {
                  // Get current color information for 360° view
                  const getCurrentColorInfo = () => {
                    const colorMap = {
                      white: { paintId: "1", paintDescription: "white" },
                      black: { paintId: "2", paintDescription: "black" },
                      silver: { paintId: "3", paintDescription: "silver" },
                      red: { paintId: "4", paintDescription: "red" },
                      blue: { paintId: "5", paintDescription: "blue" },
                      grey: { paintId: "3", paintDescription: "silver" },
                      gray: { paintId: "3", paintDescription: "silver" },
                    };
                    
                    const currentColorName = (selectedColor?.paintDescription || car.color || "white").toLowerCase();
                    return colorMap[currentColorName] || colorMap["white"];
                  };
                  
                  return getCurrentColorInfo();
                })()}
              />

              {/* Color Change Loading Overlay */}
              {isColorChanging && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">
                      Updating color...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Color Selector - Show below image gallery on mobile only */}
            <div className="lg:hidden w-full max-w-full overflow-hidden">
              <div
                className={`transition-all duration-300 w-full max-w-full ${
                  isColorChanging ? "pointer-events-none opacity-75" : ""
                }`}
              >
                <CarColorSelector
                  currentColor={car.color}
                  onColorChange={handleColorChange}
                  car={{
                    brand: car.brand,
                    model: car.model,
                    variant: car.variant,
                    bodyType: car.bodyType,
                    year: car.year,
                  }}
                />
              </div>
            </div>

            {/* Car Details Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                <TabsTrigger value="overview" className="text-xs md:text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="specifications"
                  className="text-xs md:text-sm"
                >
                  Specs
                </TabsTrigger>
                <TabsTrigger value="features" className="text-xs md:text-sm">
                  Features
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs md:text-sm">
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      About {car.brand} {car.model}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {car.description ||
                        `The ${car.brand} ${car.model} ${
                          car.variant
                        } is a premium ${car.bodyType?.toLowerCase()} that combines style, performance, and comfort. With its ${
                          car.fuelType
                        } engine and ${
                          car.transmission
                        } transmission, it delivers an excellent driving experience for urban and highway conditions.`}
                    </p>
                  </CardContent>
                </Card>

                {/* Key Specifications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Fuel className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Fuel Type</p>
                            <p className="text-sm text-muted-foreground">
                              {car.fuelType || car.fuel_type || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Transmission</p>
                            <p className="text-sm text-muted-foreground">
                              {car.transmission || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Gauge className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Mileage (ARAI)</p>
                            <p className="text-sm text-muted-foreground">
                              {typeof car.mileage === 'string' ? car.mileage : car.mileage ? `${car.mileage} kmpl` : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Seating Capacity</p>
                            <p className="text-sm text-muted-foreground">
                              {car.seating || car.seating_capacity ? `${car.seating || car.seating_capacity} Seater` : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <CarIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Body Type</p>
                            <p className="text-sm text-muted-foreground">
                              {car.bodyType || car.body_type || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Model Year</p>
                            <p className="text-sm text-muted-foreground">
                              {car.year || "2024"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Other tabs content remains the same... */}
              <TabsContent value="specifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-3">
                          Engine & Performance
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">
                              Engine Capacity
                            </span>
                            <span className="font-medium">
                              {car.engine_capacity || car.specifications?.engine || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">
                              Fuel Type
                            </span>
                            <span className="font-medium">{car.fuelType || car.fuel_type || "N/A"}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">
                              Transmission
                            </span>
                            <span className="font-medium">
                              {car.transmission || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">
                              Mileage (ARAI)
                            </span>
                            <span className="font-medium">
                              {typeof car.mileage === 'string' ? car.mileage : car.mileage ? `${car.mileage} kmpl` : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-3">
                          Dimensions & Capacity
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">
                              Seating Capacity
                            </span>
                            <span className="font-medium">
                              {car.seating || car.seating_capacity || "N/A"} {(car.seating || car.seating_capacity) ? "Seater" : ""}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">
                              Body Type
                            </span>
                            <span className="font-medium">{car.bodyType || car.body_type || "N/A"}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">Color</span>
                            <span className="font-medium">{car.color || "N/A"}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">
                              Model Year
                            </span>
                            <span className="font-medium">{car.year || "2024"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Features & Equipment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {car.features && car.features.length > 0 ? (
                        car.features.map((feature: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span className="text-sm font-medium">
                              {feature}
                            </span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span className="text-sm font-medium">
                              Power Steering
                            </span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span className="text-sm font-medium">
                              Air Conditioning
                            </span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span className="text-sm font-medium">
                              Power Windows
                            </span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span className="text-sm font-medium">
                              Central Locking
                            </span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span className="text-sm font-medium">ABS</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span className="text-sm font-medium">Airbags</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-accent text-accent"
                              />
                            ))}
                          </div>
                          <span className="font-medium">Excellent Car!</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          "Amazing fuel efficiency and smooth driving
                          experience. Perfect for city commuting."
                        </p>
                        <p className="text-xs text-muted-foreground">
                          - Verified Buyer
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(4)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-accent text-accent"
                              />
                            ))}
                            <Star className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium">Great Value</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          "Good build quality and features for the price point.
                          Recommended!"
                        </p>
                        <p className="text-xs text-muted-foreground">
                          - Verified Buyer
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            {/* Price Card */}
            <Card className="top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {car.brand} {car.model}
                  </span>
                  <Badge variant="outline">{car.variant}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {formatPrice(car.price)}
                  </div>
                  {car.onRoadPrice && (
                    <p className="text-sm text-muted-foreground">
                      On-road price: {formatPrice(car.onRoadPrice)}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <GetBestPriceModal
                    carName={`${car.brand} ${car.model}`}
                    carId={car.id}
                  />
                  <RequestQuoteModal
                    carName={`${car.brand} ${car.model}`}
                    carId={car.id}
                  />
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Get on-road price & offers in your city
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* // Update the Mobile Color Selector section: */}
            {/* Mobile Color Selector - Show below image gallery on mobile only */}
            {/* <div className="lg:hidden">
              <CarColorSelector
                currentColor={car.color}
                onColorChange={handleColorChange}
                isChanging={isColorChanging}
                car={{
                  brand: car.brand,
                  model: car.model,
                  variant: car.variant,
                  bodyType: car.bodyType,
                  year: car.year,
                }}
              />
            </div> */}
            {/* // Update the Desktop Color Selector section: */}
            {/* Desktop Color Selector - Show in sidebar on desktop only */}
            <div className="hidden lg:block">
              <CarColorSelector
                currentColor={car.color}
                onColorChange={handleColorChange}
                isChanging={isColorChanging}
                car={{
                  brand: car.brand,
                  model: car.model,
                  variant: car.variant,
                  bodyType: car.bodyType,
                  year: car.year,
                }}
              />
            </div>
            <AdBanner placement="between_tiles" />
            {/* EMI Calculator */}
            <Card>
              <CardHeader>
                <CardTitle>EMI Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Loan Amount</span>
                    <span className="font-medium">
                      {formatPrice(car.price * 0.9)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Interest Rate</span>
                    <span className="font-medium">8.5% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tenure</span>
                    <span className="font-medium">5 years</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Monthly EMI</span>
                    <span className="text-primary">
                      ₹{Math.round((car.price * 0.9) / 60).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    asChild
                  >
                    <Link to="/emi-calculator">Calculate Detailed EMI</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <AdBanner placement="above_footer" />
      <Footer />
    </div>
  );
};

export default CarDetail;