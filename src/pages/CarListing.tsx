import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Grid,
  List,
  MapPin,
  IndianRupee,
  X,
  Calendar,
  Palette,
  Car as CarIcon,
  Zap,
  Upload,
  Heart,
} from "lucide-react";
import { useSearchParams, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useUserAuth } from "@/contexts/UserAuthContext";
import AdBanner from "@/components/AdBanner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const CarListing = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearchResults, setHasSearchResults] = useState(false);
  const [searchInfo, setSearchInfo] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");
  const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>(
    {}
  );
  const [wishlistLoading, setWishlistLoading] = useState<
    Record<string, boolean>
  >({});
  const [wishlistBatchLoading, setWishlistBatchLoading] = useState(false);

  // Infinite scroll states
  const [displayedCars, setDisplayedCars] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const CARS_PER_PAGE = 12;

  const api = useAuthenticatedApi();
  const { toast } = useToast();
  const { isAuthenticated } = useUserAuth();

  const [filters, setFilters] = useState({
    priceRange: [0, 5000000],
    brands: [] as string[],
    fuelTypes: [] as string[],
    transmissions: [] as string[],
    bodyTypes: [] as string[],
    colors: [] as string[],
    yearRange: [2020, 2025],
    seating: [] as string[],
    features: [] as string[],
    city: "" as string,
  });

  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);

  // Load initial cars from database
  useEffect(() => {
    console.log("CarListing mounted, loading initial cars");
    let isMounted = true;

    // Always load all cars from database to ensure filters work correctly
    // We rely on URL parameters to apply initial filters
    if (isMounted) {
      loadCarsFromDB();
      fetchStats();
    }

    // Cleanup function
    return () => {
      isMounted = false;
      console.log("CarListing unmounting, cleaning up...");
    };
  }, []);

  // Handle URL parameter changes separately
  useEffect(() => {
    const brandParam = searchParams.get("brand");
    const modelParam = searchParams.get("model");
    const fuelParam = searchParams.get("fuelType");
    const cityParam = searchParams.get("city");

    // New params from HeroSection
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const fuelTypesParam = searchParams.get("fuelTypes");
    const transmissionsParam = searchParams.get("transmissions");
    const bodyTypesParam = searchParams.get("bodyTypes");
    const seatingOptionsParam = searchParams.get("seatingOptions");
    const filterBrandsParam = searchParams.get("filterBrands");

    if (
      brandParam ||
      modelParam ||
      fuelParam ||
      cityParam ||
      minPriceParam ||
      maxPriceParam ||
      fuelTypesParam ||
      transmissionsParam ||
      bodyTypesParam ||
      seatingOptionsParam ||
      filterBrandsParam
    ) {
      console.log("Found URL parameters:", {
        brandParam,
        modelParam,
        fuelParam,
        cityParam,
        minPriceParam,
        maxPriceParam,
        fuelTypesParam,
        transmissionsParam,
        bodyTypesParam,
        seatingOptionsParam,
        filterBrandsParam
      });

      setFilters((prev) => {
        const newFilters = { ...prev };
        console.log("Previous filters:", prev);

        if (brandParam) newFilters.brands = [brandParam];
        if (filterBrandsParam) newFilters.brands = filterBrandsParam.split(",");

        if (fuelParam) newFilters.fuelTypes = [fuelParam];
        if (fuelTypesParam) newFilters.fuelTypes = fuelTypesParam.split(",");

        if (cityParam) newFilters.city = cityParam;

        if (minPriceParam || maxPriceParam) {
          newFilters.priceRange = [
            minPriceParam ? parseInt(minPriceParam) : 0,
            maxPriceParam ? parseInt(maxPriceParam) : 5000000
          ];
        }

        if (transmissionsParam) newFilters.transmissions = transmissionsParam.split(",");
        if (bodyTypesParam) newFilters.bodyTypes = bodyTypesParam.split(",");
        if (seatingOptionsParam) newFilters.seating = seatingOptionsParam.split(",");

        console.log("New filters calculated from URL:", newFilters);
        return newFilters;
      });

      setHasSearchResults(true);
      setSearchInfo({
        query: brandParam ? `Brand: ${brandParam}` : "Filtered Results",
        filters: {
          selectedBrand: brandParam || filterBrandsParam,
          selectedModel: modelParam,
          selectedFuel: fuelParam || fuelTypesParam,
          selectedCity: cityParam,
        },
        error: null,
      });
    }
  }, [searchParams]);

  // UPDATED: Batch check wishlist status when authenticated and cars change
  useEffect(() => {
    if (isAuthenticated && cars.length > 0) {
      checkWishlistStatusBatch();
    }
  }, [isAuthenticated, cars]);

  // NEW: Batch wishlist status check function
  // NEW: Batch wishlist status check function with chunking
  const checkWishlistStatusBatch = async () => {
    if (!isAuthenticated || cars.length === 0) return;

    try {
      setWishlistBatchLoading(true);
      console.log(`Batch checking wishlist status for ${cars.length} cars...`);

      // Extract car IDs
      const carIds = cars.map((car) => car.id).filter(Boolean);

      if (carIds.length === 0) {
        console.log("No valid car IDs found");
        return;
      }

      // Chunk car IDs into batches of 100
      const BATCH_SIZE = 100;
      const chunks = [];
      for (let i = 0; i < carIds.length; i += BATCH_SIZE) {
        chunks.push(carIds.slice(i, i + BATCH_SIZE));
      }

      console.log(
        `Processing ${chunks.length} chunks of up to ${BATCH_SIZE} cars each`
      );

      // Process all chunks in parallel
      const chunkPromises = chunks.map(async (chunk, index) => {
        console.log(
          `Processing chunk ${index + 1}/${chunks.length} with ${chunk.length
          } cars`
        );
        return api.wishlist.checkMultiple(chunk);
      });

      const results = await Promise.all(chunkPromises);

      // Combine results from all chunks
      const combinedStatusMap: Record<string, boolean> = {};

      results.forEach((response, index) => {
        if (response.success && response.data) {
          Object.keys(response.data).forEach((carId) => {
            combinedStatusMap[carId] = response.data[carId].inWishlist;
          });
        } else {
          console.error(`Chunk ${index + 1} failed:`, response.error);
          // Set failed chunk cars to false
          chunks[index].forEach((carId) => {
            combinedStatusMap[carId] = false;
          });
        }
      });

      setWishlistStatus(combinedStatusMap);
      console.log(`Batch wishlist check complete for ${carIds.length} cars`);
    } catch (error) {
      console.error("Error in batch wishlist check:", error);
      // Fallback: set all to false
      const fallbackStatus: Record<string, boolean> = {};
      cars.forEach((car) => {
        if (car.id) fallbackStatus[car.id] = false;
      });
      setWishlistStatus(fallbackStatus);
    } finally {
      setWishlistBatchLoading(false);
    }
  };

  // UPDATED: Individual wishlist toggle function
  const toggleWishlist = async (carId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save cars to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      setWishlistLoading((prev) => ({ ...prev, [carId]: true }));

      const isCurrentlyWishlisted = wishlistStatus[carId] || false;

      if (isCurrentlyWishlisted) {
        const response = await api.wishlist.remove(carId);
        if (response.success) {
          setWishlistStatus((prev) => ({ ...prev, [carId]: false }));
          toast({
            title: "Removed from wishlist",
            description: "Car has been removed from your wishlist.",
          });
        } else {
          throw new Error(response.error || "Failed to remove from wishlist");
        }
      } else {
        const response = await api.wishlist.add(carId);
        if (response.success) {
          setWishlistStatus((prev) => ({ ...prev, [carId]: true }));
          toast({
            title: "Added to wishlist",
            description: "Car has been saved to your wishlist.",
          });
        } else {
          throw new Error(response.error || "Failed to add to wishlist");
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
      setWishlistLoading((prev) => ({ ...prev, [carId]: false }));
    }
  };

  const handleSearchResults = (navigationState: any) => {
    const transformedCars = navigationState.searchResults.map((car: any) => {
      let carImage = "/placeholder.svg";

      // Handle images - prioritize new color_variant_images, then legacy formats
      if (car.color_variant_images && Object.keys(car.color_variant_images).length > 0) {
        const firstColor = Object.keys(car.color_variant_images)[0];
        const imagesObj = car.color_variant_images[firstColor]?.images;
        if (imagesObj) {
          carImage = imagesObj.front_3_4 ||
            imagesObj.front_view ||
            imagesObj.left_side ||
            imagesObj.right_side ||
            Object.values(imagesObj)[0] as string ||
            "/placeholder.svg";
        }
      } else if (car.images) {
        // If images is an object
        if (typeof car.images === 'object' && !Array.isArray(car.images)) {
          // Case A: It's a map of Color Name -> Image Array (The format user provided)
          const firstKey = Object.keys(car.images)[0];
          if (firstKey && Array.isArray(car.images[firstKey])) {
            // Try to find 'default' or use first color
            const defaultImages = car.images.default;
            if (defaultImages && Array.isArray(defaultImages) && defaultImages.length > 0 && defaultImages[0]) {
              carImage = defaultImages[0];
            } else {
              // Find first color with valid images
              for (const key of Object.keys(car.images)) {
                const imgs = car.images[key];
                if (Array.isArray(imgs) && imgs.length > 0 && imgs[0]) {
                  carImage = imgs[0];
                  break;
                }
              }
            }
          } else {
            // Case B: It's a flat object with angle keys (Legacy format)
            carImage = car.images.front_3_4 ||
              car.images.front_view ||
              car.images.left_side ||
              car.images.right_side ||
              car.images.rear_view ||
              car.images.interior_dash ||
              car.images.interior_cabin ||
              car.images.interior_steering ||
              "/placeholder.svg";
          }
        }
        // Case C: If images is an array (old format)
        else if (Array.isArray(car.images) && car.images.length > 0 && car.images[0] !== "/placeholder.svg") {
          carImage = car.images[0] as string;
        }
      }

      // Handle null/undefined prices - set a default price if null
      const carPrice = car.price_min || car.price || 500000; // Default to 5 lakhs if null
      const carOnRoadPrice = car.price_max || car.onRoadPrice || carPrice + 50000; // Default on-road price

      return {
        ...car,
        price: carPrice,
        exactPrice: car.exact_price || null,  // Base price from Excel
        onRoadPrice: carOnRoadPrice,
        delhiPrice: car.delhi_price || null,  // On-road price Delhi
        fuelType: car.fuel_type || car.fuelType || "Petrol",
        bodyType: car.body_type || car.bodyType || "Sedan",
        seating: car.seating_capacity || car.seating || 5,
        rating: 4.2 + Math.random() * 0.8,
        image: carImage,
        color: "Pearl White",
        year: 2024,
        features: car.features || [],
        mileage: parseFloat(
          car.mileage?.toString()?.replace(/[^\d.]/g, "") || "15"
        ),
        isPopular: Math.random() > 0.7,
        isBestSeller: Math.random() > 0.8,
      };
    });

    setCars(transformedCars);
    setHasSearchResults(true);
    setSearchInfo({
      query: navigationState.searchQuery,
      filters: navigationState.filters,
      error: navigationState.error,
    });

    // Set city filter if present in navigation state
    if (navigationState.filters?.selectedCity) {
      setFilters(prev => ({
        ...prev,
        city: navigationState.filters.selectedCity
      }));
    }
    setLoading(false);

    window.history.replaceState({}, document.title);
  };

  const loadCarsFromDB = async () => {
    // Use AbortController for cleanup
    const abortController = new AbortController();

    try {
      console.log("Loading cars from database...");
      setLoading(true);
      setError(null);

      let carsData = null;

      try {
        console.log("Attempting to load cars from API...");
        const response = await api.cars.getAll({
          status: "active",
          limit: 500,
        });

        console.log("API Response:", response);

        if (response.success && response.data) {
          console.log("Cars loaded from API:", response.data.length, "cars");
          carsData = response.data;
        } else {
          console.log("API response unsuccessful or no data:", response);
        }
      } catch (apiError: any) {
        console.warn(
          "API not available, trying Supabase directly:",
          apiError?.message || apiError
        );
      }

      if (!carsData) {
        console.log("Falling back to Supabase direct access...");
        const { data: supabaseData, error: supabaseError, count } = await supabase
          .from("cars")
          .select("*", { count: "exact" })
          .eq("status", "active")
          .order("brand", { ascending: true });

        if (supabaseError) {
          console.error("Supabase error:", supabaseError);
          throw supabaseError;
        }

        console.log("Supabase total count:", count);
        console.log("Supabase data length:", supabaseData?.length);

        // Log first few cars to debug
        if (supabaseData && supabaseData.length > 0) {
          console.log("Sample cars from Supabase:", supabaseData.slice(0, 3).map(car => ({
            id: car.id,
            brand: car.brand,
            model: car.model,
            status: car.status,
            price_min: car.price_min,
            price_max: car.price_max,
            exact_price: (car as any).exact_price,
            delhi_price: (car as any).delhi_price
          })));
        }

        carsData = supabaseData;
        console.log("Cars loaded from Supabase:", carsData?.length, "cars");
      }

      if (carsData && carsData.length > 0) {
        const transformedCars = carsData.map((car, index) => {
          let carImage = "/placeholder.svg";

          // Handle images - prioritize new color_variant_images, then legacy formats
          if (car.color_variant_images && Object.keys(car.color_variant_images).length > 0) {
            const firstColor = Object.keys(car.color_variant_images)[0];
            const imagesObj = car.color_variant_images[firstColor]?.images;
            if (imagesObj) {
              carImage = imagesObj.front_3_4 ||
                imagesObj.front_view ||
                imagesObj.left_side ||
                imagesObj.right_side ||
                Object.values(imagesObj)[0] as string ||
                "/placeholder.svg";
            }
          } else if (car.images) {
            // If images is an object
            if (typeof car.images === 'object' && !Array.isArray(car.images)) {
              // Case A: It's a map of Color Name -> Image Array (The format user provided)
              const firstKey = Object.keys(car.images)[0];
              if (firstKey && Array.isArray(car.images[firstKey])) {
                // Try to find 'default' or use first color
                const defaultImages = car.images.default;
                if (defaultImages && Array.isArray(defaultImages) && defaultImages.length > 0 && defaultImages[0]) {
                  carImage = defaultImages[0];
                } else {
                  // Find first color with valid images
                  for (const key of Object.keys(car.images)) {
                    const imgs = car.images[key];
                    if (Array.isArray(imgs) && imgs.length > 0 && imgs[0]) {
                      carImage = imgs[0];
                      break;
                    }
                  }
                }
              } else {
                // Case B: It's a flat object with angle keys (Legacy format)
                carImage = car.images.front_3_4 ||
                  car.images.front_view ||
                  car.images.left_side ||
                  car.images.right_side ||
                  car.images.rear_view ||
                  car.images.interior_dash ||
                  car.images.interior_cabin ||
                  car.images.interior_steering ||
                  "/placeholder.svg";
              }
            }
            // Case C: If images is an array (old format)
            else if (Array.isArray(car.images) && car.images.length > 0 && car.images[0] !== "/placeholder.svg") {
              carImage = car.images[0] as string;
            }
          }

          // Handle null/undefined prices - set a default price if null
          const carPrice = car.price_min || car.price || 0; // Default to 0 if null
          const carOnRoadPrice = car.price_max || car.onRoadPrice || carPrice + 50000; // Default on-road price

          // Debug logging for first few cars
          if (index < 3) {
            console.log(`🚗 Transforming car ${index}:`, {
              brand: car.brand,
              model: car.model,
              variant: car.variant,
              'RAW exact_price from DB': car.exact_price,
              'RAW delhi_price from DB': car.delhi_price,
              'typeof exact_price': typeof car.exact_price,
              'typeof delhi_price': typeof car.delhi_price
            });
          }

          const transformed = {
            ...car,
            price: carPrice,
            exactPrice: (car as any).exact_price || null,  // Base price from Excel
            onRoadPrice: carOnRoadPrice,
            delhiPrice: (car as any).delhi_price || null,  // On-road price Delhi
            fuelType: car.fuel_type || car.fuelType || "Petrol",
            bodyType: car.body_type || car.bodyType || "Sedan",
            seating: car.seating_capacity || car.seating || 5,
            rating: 4.2 + Math.random() * 0.8,
            image: carImage,
            color: "Pearl White",
            year: 2024,
            features: car.features || [],
            mileage: parseFloat(
              car.mileage?.toString()?.replace(/[^\d.]/g, "") || "15"
            ),
            isPopular: Math.random() > 0.7,
            isBestSeller: Math.random() > 0.8,
          };

          if (index < 3) {
            console.log(`✅ Transformed car ${index}:`, {
              brand: transformed.brand,
              model: transformed.model,
              exactPrice: transformed.exactPrice,
              delhiPrice: transformed.delhiPrice
            });
          }

          return transformed;
        });

        console.log("Transformed cars:", transformedCars.length);

        const brandCounts = {};
        transformedCars.forEach((car) => {
          brandCounts[car.brand] = (brandCounts[car.brand] || 0) + 1;
        });
        console.log("Brand distribution:", brandCounts);

        setCars(transformedCars);
      } else {
        console.log("No cars found in database");
        setCars([]);
      }
    } catch (error: any) {
      console.error("Error loading cars:", error);
      setError(error?.message || "Failed to load cars");
      setCars([]);
      toast({
        title: "Error loading cars",
        description: error?.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      // Always ensure loading is set to false
      setLoading(false);
      console.log("Loading state set to false");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const result = await response.json();
      if (result.success) {
        if (result.data.cities && Array.isArray(result.data.cities)) {
          setAvailableCities(result.data.cities);
        }
        if (result.data.brands && Array.isArray(result.data.brands)) {
          setAvailableBrands(result.data.brands);
        }
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const clearSearch = () => {
    console.log("Clearing search, showing all cars");
    setHasSearchResults(false);
    setSearchInfo(null);
    setFilters({
      priceRange: [0, 5000000],
      brands: [],
      fuelTypes: [],
      transmissions: [],
      bodyTypes: [],
      colors: [],
      yearRange: [2020, 2025],
      seating: [],
      features: [],
      city: "",
    });
    window.history.pushState({}, "", "/cars");
  };

  const handleFilterChange = (
    filterType: string,
    value: string,
    checked: boolean
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: checked
        ? [...(prev[filterType as keyof typeof prev] as string[]), value]
        : (prev[filterType as keyof typeof prev] as string[]).filter(
          (item) => item !== value
        ),
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 5000000],
      brands: [],
      fuelTypes: [],
      transmissions: [],
      bodyTypes: [],
      colors: [],
      yearRange: [2020, 2025],
      seating: [],
      features: [],
      city: "",
    });
  };

  const getActiveFiltersCount = () => {
    return (
      filters.brands.length +
      filters.fuelTypes.length +
      filters.transmissions.length +
      filters.bodyTypes.length +
      filters.colors.length +
      filters.seating.length +
      filters.features.length +
      (filters.city ? 1 : 0)
    );
  };

  // Memoize filtered and sorted cars to prevent unnecessary re-computation
  const filteredAndSortedCars = React.useMemo(() => {
    console.log("Applying filters:", filters);
    console.log("Total cars before filtering:", cars.length);

    // Debug: Check if cars have valid data
    if (cars.length > 0) {
      console.log("Sample car data before filtering:", cars.slice(0, 2).map(car => ({
        id: car.id,
        brand: car.brand,
        model: car.model,
        price: car.price,
        price_min: car.price_min,
        price_max: car.price_max,
        fuelType: car.fuelType,
        fuel_type: car.fuel_type,
        year: car.year,
        bodyType: car.bodyType,
        body_type: car.body_type
      })));
    }

    let filteredCars = cars.filter((car, index) => {
      const searchMatch =
        searchQuery === "" ||
        car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.variant.toLowerCase().includes(searchQuery.toLowerCase());

      // Use price_min for filtering if available, otherwise fallback to price
      const effectivePrice = car.price_min || car.price || 0;
      const priceMatch =
        effectivePrice >= filters.priceRange[0] &&
        effectivePrice <= filters.priceRange[1];

      const brandMatch =
        filters.brands.length === 0 || filters.brands.includes(car.brand);

      const fuelMatch =
        filters.fuelTypes.length === 0 ||
        filters.fuelTypes.includes(car.fuelType);

      const transmissionMatch =
        filters.transmissions.length === 0 ||
        filters.transmissions.includes(car.transmission);

      const bodyTypeMatch =
        filters.bodyTypes.length === 0 ||
        filters.bodyTypes.includes(car.bodyType);

      const colorMatch =
        filters.colors.length === 0 || filters.colors.includes(car.color);

      const yearMatch =
        car.year >= filters.yearRange[0] && car.year <= filters.yearRange[1];

      const seatingMatch =
        filters.seating.length === 0 ||
        filters.seating.includes(car.seating.toString());

      const featuresMatch =
        filters.features.length === 0 ||
        filters.features.every((feature) => car.features.includes(feature));

      const cityMatch =
        !filters.city ||
        (car[`${filters.city.toLowerCase()}_price`] !== null &&
          car[`${filters.city.toLowerCase()}_price`] !== undefined &&
          car[`${filters.city.toLowerCase()}_price`] !== "");

      // Debug first few cars that fail filtering
      if (index < 5 && !(
        searchMatch &&
        priceMatch &&
        brandMatch &&
        fuelMatch &&
        transmissionMatch &&
        bodyTypeMatch &&
        colorMatch &&
        yearMatch &&
        seatingMatch &&
        featuresMatch &&
        cityMatch
      )) {
        console.log(`Car ${index} filtered out:`, {
          id: car.id,
          brand: car.brand,
          model: car.model,
          searchMatch,
          priceMatch,
          brandMatch,
          fuelMatch,
          transmissionMatch,
          bodyTypeMatch,
          colorMatch,
          yearMatch,
          seatingMatch,
          featuresMatch,
          price: car.price,
          priceRange: filters.priceRange,
          fuelType: car.fuelType,
          fuelTypes: filters.fuelTypes
        });
      }

      return (
        searchMatch &&
        priceMatch &&
        brandMatch &&
        fuelMatch &&
        transmissionMatch &&
        bodyTypeMatch &&
        colorMatch &&
        yearMatch &&
        seatingMatch &&
        yearMatch &&
        seatingMatch &&
        featuresMatch &&
        cityMatch
      );
    });

    // console.log("Cars after filtering:", filteredCars.length);

    switch (sortBy) {
      case "price-low":
        filteredCars.sort((a, b) => {
          // Debug logging for price sorting
          // console.log(`Comparing ${a.model} (${a.price}) vs ${b.model} (${b.price})`);

          // Treat null/undefined/NaN as invalid (<= 0 check covers 0 and negative)
          const priceA = typeof a.price === 'number' && !isNaN(a.price) ? a.price : 0;
          const priceB = typeof b.price === 'number' && !isNaN(b.price) ? b.price : 0;

          // Push invalid prices (<= 0) to the bottom
          if (priceA <= 0 && priceB > 0) return 1;
          if (priceA > 0 && priceB <= 0) return -1;
          if (priceA <= 0 && priceB <= 0) return 0;
          return priceA - priceB;
        });
        break;
      case "price-high":
        filteredCars.sort((a, b) => {
          const priceA = typeof a.price === 'number' && !isNaN(a.price) ? a.price : 0;
          const priceB = typeof b.price === 'number' && !isNaN(b.price) ? b.price : 0;

          // Push invalid prices (<= 0) to the bottom
          if (priceA <= 0 && priceB > 0) return 1;
          if (priceA > 0 && priceB <= 0) return -1;
          if (priceA <= 0 && priceB <= 0) return 0;
          return priceB - priceA;
        });
        break;
      case "rating":
        filteredCars.sort((a, b) => b.rating - a.rating);
        break;
      case "mileage":
        filteredCars.sort((a, b) => b.mileage - a.mileage);
        break;
      case "year":
        filteredCars.sort((a, b) => b.year - a.year);
        break;
      case "popularity":
      default:
        filteredCars.sort((a, b) => {
          const aPopular = a.isPopular || a.isBestSeller ? 1 : 0;
          const bPopular = b.isPopular || b.isBestSeller ? 1 : 0;
          if (aPopular !== bPopular) return bPopular - aPopular;
          return b.rating - a.rating;
        });
        break;
    }

    return filteredCars;
  }, [cars, filters, searchQuery, sortBy]);

  // Update displayed cars when filtered cars or page changes
  useEffect(() => {
    const endIndex = page * CARS_PER_PAGE;
    setDisplayedCars(filteredAndSortedCars.slice(0, endIndex));
  }, [filteredAndSortedCars, page]);

  // Manual load more handler
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Add a small delay for better UX
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 300);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, sortBy, searchQuery]);

  // All brands from BrandGrid - always show these in the filter
  const allBrands = [
    "Maruti Suzuki",
    "Hyundai",
    "Tata",
    "Mahindra",
    "Kia",
    "Honda",
    "Toyota",
    "Renault",
    "Audi",
    "BMW",
    "MG",
    "Nissan",
    "Skoda",
    "Volkswagen",
  ].sort();

  // Use availableBrands from API, or fallback to derived brands
  const brands = React.useMemo(() => {
    if (availableBrands.length > 0) {
      return availableBrands;
    }
    const derivedBrands = [...new Set(cars.map((car) => car.brand).filter(Boolean))];
    return derivedBrands.sort();
  }, [cars, availableBrands]);
  const bodyTypes = [
    ...new Set(cars.map((car) => car.bodyType).filter(Boolean)),
  ].sort();
  const fuelTypes = [
    ...new Set(cars.map((car) => car.fuelType).filter(Boolean)),
  ].sort();
  const transmissions = [
    ...new Set(cars.map((car) => car.transmission).filter(Boolean)),
  ].sort();
  const colors = [
    "Pearl White",
    "Metallic Blue",
    "Midnight Black",
    "Silver",
    "Red",
    "Grey",
    "Brown",
  ];
  const seatingOptions = ["2", "4", "5", "7", "8"];
  const popularFeatures = [
    "Power Steering",
    "Air Conditioning",
    "Power Windows",
    "Central Locking",
    "ABS",
    "Airbags",
    "Bluetooth",
    "USB Port",
  ];

  // Filters Component for reuse in mobile sheet and desktop sidebar
  const FiltersContent = () => (
    <div className="space-y-4 lg:space-y-6">
      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2 text-sm lg:text-base">
          <IndianRupee className="w-4 h-4" />
          Price Range
        </h4>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => {
            console.log("Price range slider changed:", value);
            setFilters((prev) => ({ ...prev, priceRange: value }));
          }}
          max={5000000}
          min={0}
          step={50000}
          className="w-full mb-3 pointer-events-auto"
        />
        <div className="flex justify-between text-xs lg:text-sm text-muted-foreground">
          <span>₹{(filters.priceRange[0] / 100000).toFixed(1)}L</span>
          <span>₹{(filters.priceRange[1] / 100000).toFixed(1)}L</span>
        </div>
      </div>

      {/* Brand */}
      <div>
        <h4 className="font-medium mb-3 text-sm lg:text-base">Brand</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2 pointer-events-auto">
              <Checkbox
                id={`${brand}-filter`}
                checked={filters.brands.includes(brand)}
                onCheckedChange={(checked) => {
                  console.log(`Brand ${brand} checkbox changed:`, checked);
                  handleFilterChange("brands", brand, checked as boolean);
                }}
              />
              <label
                htmlFor={`${brand}-filter`}
                className="text-xs lg:text-sm cursor-pointer select-none"
              >
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Body Type */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2 text-sm lg:text-base">
          <CarIcon className="w-4 h-4" />
          Body Type
        </h4>
        <div className="space-y-2">
          {bodyTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2 pointer-events-auto">
              <Checkbox
                id={`${type}-filter`}
                checked={filters.bodyTypes.includes(type)}
                onCheckedChange={(checked) => {
                  console.log(`Body type ${type} checkbox changed:`, checked);
                  handleFilterChange("bodyTypes", type, checked as boolean);
                }}
              />
              <label
                htmlFor={`${type}-filter`}
                className="text-xs lg:text-sm cursor-pointer select-none"
              >
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Fuel Type */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2 text-sm lg:text-base">
          <Zap className="w-4 h-4" />
          Fuel Type
        </h4>
        <div className="space-y-2">
          {fuelTypes.map((fuel) => (
            <div key={fuel} className="flex items-center space-x-2 pointer-events-auto">
              <Checkbox
                id={`${fuel}-filter`}
                checked={filters.fuelTypes.includes(fuel)}
                onCheckedChange={(checked) => {
                  console.log(`Fuel type ${fuel} checkbox changed:`, checked);
                  handleFilterChange("fuelTypes", fuel, checked as boolean);
                }}
              />
              <label
                htmlFor={`${fuel}-filter`}
                className="text-xs lg:text-sm cursor-pointer select-none"
              >
                {fuel}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <h4 className="font-medium mb-3 text-sm lg:text-base">Transmission</h4>
        <div className="space-y-2">
          {transmissions.map((transmission) => (
            <div key={transmission} className="flex items-center space-x-2 pointer-events-auto">
              <Checkbox
                id={`${transmission}-filter`}
                checked={filters.transmissions.includes(transmission)}
                onCheckedChange={(checked) => {
                  console.log(`Transmission ${transmission} checkbox changed:`, checked);
                  handleFilterChange(
                    "transmissions",
                    transmission,
                    checked as boolean
                  );
                }}
              />
              <label
                htmlFor={`${transmission}-filter`}
                className="text-xs lg:text-sm cursor-pointer select-none"
              >
                {transmission}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Seating Capacity */}
      <div>
        <h4 className="font-medium mb-3 text-sm lg:text-base">Seating</h4>
        <div className="space-y-2">
          {seatingOptions.map((seating) => (
            <div key={seating} className="flex items-center space-x-2 pointer-events-auto">
              <Checkbox
                id={`seating-${seating}-filter`}
                checked={filters.seating.includes(seating)}
                onCheckedChange={(checked) => {
                  console.log(`Seating ${seating} checkbox changed:`, checked);
                  handleFilterChange("seating", seating, checked as boolean);
                }}
              />
              <label
                htmlFor={`seating-${seating}-filter`}
                className="text-xs lg:text-sm cursor-pointer select-none"
              >
                {seating} Seater
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading cars...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Failed to Load Cars</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                loadCarsFromDB();
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Ad Banner - Visible on all devices */}
      <div className="relative z-0">
        <AdBanner placement="below_navigation" />
      </div>

      {/* Search Results Header */}
      {hasSearchResults && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-4 py-3 lg:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-base lg:text-lg font-semibold text-blue-900">
                  Search Results
                  {searchInfo?.query && (
                    <span className="block sm:inline sm:ml-2 text-blue-600 text-sm lg:text-base">
                      for "{searchInfo.query}"
                    </span>
                  )}
                </h2>
                <p className="text-blue-700 text-sm">
                  Found {filteredAndSortedCars.length} car
                  {filteredAndSortedCars.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Button
                onClick={clearSearch}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100 w-full sm:w-auto"
                size="sm"
              >
                Show All Cars
              </Button>
            </div>

            {searchInfo?.filters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {searchInfo.filters.selectedBrand && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 text-xs"
                  >
                    Brand: {searchInfo.filters.selectedBrand}
                  </Badge>
                )}
                {searchInfo.filters.carType && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 text-xs"
                  >
                    Type: {searchInfo.filters.carType}
                  </Badge>
                )}
                {searchInfo.filters.fuelTypes?.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 text-xs"
                  >
                    Fuel: {searchInfo.filters.fuelTypes.join(", ")}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-muted/30 py-3 lg:py-6 sticky top-0 z-40 lg:relative">
        <div className="container mx-auto px-4">
          <div className="space-y-3 lg:space-y-4">
            {/* Search Row */}
            <div className="flex gap-2 lg:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search cars, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm h-9 lg:h-10"
                />
              </div>
              <Select
                value={filters.city}
                onValueChange={(value) => setFilters(prev => ({ ...prev, city: value === "all" ? "" : value }))}
              >
                <SelectTrigger className="w-20 sm:w-24 lg:w-32 h-9 lg:h-10">
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs lg:text-sm truncate">
                    {filters.city || "City"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* Mobile Filter Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`lg:hidden ${getActiveFiltersCount() > 0
                        ? "border-primary bg-primary/10"
                        : ""
                        }`}
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      <span className="text-xs">Filters</span>
                      {getActiveFiltersCount() > 0 && (
                        <Badge variant="secondary" className="ml-1 h-4 text-xs">
                          {getActiveFiltersCount()}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-80 sm:w-96 overflow-y-auto"
                  >
                    <SheetHeader>
                      <SheetTitle>Filter Cars</SheetTitle>
                      <SheetDescription>
                        Refine your search results
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-sm">Filters</h3>
                        {getActiveFiltersCount() > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
                      <FiltersContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Desktop Filter Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`hidden lg:flex ${getActiveFiltersCount() > 0
                    ? "border-primary bg-primary/10"
                    : ""
                    }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Right Side Controls */}
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-20 sm:w-28 lg:w-40 text-xs lg:text-sm h-9 lg:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[60]" style={{ zIndex: 1001 }}>
                    <SelectItem value="popularity">Popular</SelectItem>
                    <SelectItem value="price-low">Low Price</SelectItem>
                    <SelectItem value="price-high">High Price</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="mileage">Best Mileage</SelectItem>
                    <SelectItem value="year">Newest</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none px-2 lg:px-3 h-9 lg:h-10"
                  >
                    <Grid className="w-3 h-3 lg:w-4 lg:h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none border-l px-2 lg:px-3 h-9 lg:h-10"
                  >
                    <List className="w-3 h-3 lg:w-4 lg:h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {getActiveFiltersCount() > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs lg:text-sm font-medium">
                  Active filters:
                </span>
                {filters.brands.map((brand) => (
                  <Badge
                    key={brand}
                    variant="secondary"
                    className="cursor-pointer text-xs"
                    onClick={() => handleFilterChange("brands", brand, false)}
                  >
                    {brand} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {filters.fuelTypes.map((fuel) => (
                  <Badge
                    key={fuel}
                    variant="secondary"
                    className="cursor-pointer text-xs"
                    onClick={() => handleFilterChange("fuelTypes", fuel, false)}
                  >
                    {fuel} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {filters.bodyTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="cursor-pointer text-xs"
                    onClick={() => handleFilterChange("bodyTypes", type, false)}
                  >
                    {type} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs h-6 lg:h-8"
                >
                  Clear All <X className="w-3 h-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 lg:py-8">
        <div className="flex gap-4 lg:gap-8">
          {/* Desktop Sidebar Filters */}
          <div
            className={`${showFilters ? "block" : "hidden"
              } lg:block w-72 xl:w-80 space-y-4 lg:space-y-6 hidden lg:block`}
          >
            {/* Desktop Ad in Sidebar */}
            <div className="hidden xl:block">
              <AdBanner placement="left_sidebar" />
            </div>

            <Card className="relative z-10 pointer-events-auto">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm lg:text-base">
                    Advanced Filters
                  </h3>
                  {getActiveFiltersCount() > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      Clear All
                    </Button>
                  )}
                </div>
                <FiltersContent />
              </CardContent>
            </Card>
          </div>

          {/* Car Listings */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 gap-3 lg:gap-4">
              <div className="flex items-center gap-2 lg:gap-4">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {hasSearchResults ? "Search Results" : "New Cars"} (
                  {filteredAndSortedCars.length})
                </h1>
                {wishlistBatchLoading && (
                  <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-b-2 border-primary"></div>
                    <span className="hidden sm:inline">
                      Checking wishlist...
                    </span>
                  </div>
                )}
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-44 lg:w-48 text-xs lg:text-sm relative z-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="popularity">Sort by Popularity</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="mileage">Best Mileage</SelectItem>
                  <SelectItem value="year">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results */}
            {filteredAndSortedCars.length === 0 ? (
              <div className="text-center py-8 lg:py-12">
                <CarIcon className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg lg:text-xl font-semibold mb-2">
                  No cars found
                </h3>
                <p className="text-muted-foreground mb-4 text-sm lg:text-base px-4">
                  {hasSearchResults
                    ? "Try adjusting your search criteria or browse all available cars."
                    : "Try adjusting your filters or search query"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={clearAllFilters} variant="outline" size="sm">
                    Clear All Filters
                  </Button>
                  {hasSearchResults && (
                    <Button onClick={clearSearch} size="sm">
                      View All Cars
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6"
                      : "space-y-4"
                  }
                >
                  {displayedCars.map((car, index) => (
                    <React.Fragment key={car.id}>
                      <CarCard
                        car={car}
                        isWishlisted={wishlistStatus[car.id] || false}
                        onToggleWishlist={() => toggleWishlist(car.id)}
                        wishlistLoading={wishlistLoading[car.id] || false}
                      />
                      {/* Insert ads every 6 cars in grid view, every 4 in mobile */}
                      {(index + 1) % (viewMode === "grid" ? 6 : 4) === 0 && (
                        <div
                          className={viewMode === "grid" ? "col-span-full" : ""}
                        >
                          <div className="my-4">
                            <AdBanner placement="below_results" />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Load More Button */}
                {displayedCars.length < filteredAndSortedCars.length && (
                  <div className="flex justify-center py-8">
                    {isLoadingMore ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3 text-muted-foreground">
                          Loading more cars...
                        </span>
                      </div>
                    ) : (
                      <Button
                        onClick={handleLoadMore}
                        variant="outline"
                        size="lg"
                        className="min-w-[200px]"
                      >
                        Load More
                      </Button>
                    )}
                  </div>
                )}

                {/* End of results indicator */}
                {displayedCars.length >= filteredAndSortedCars.length && filteredAndSortedCars.length > CARS_PER_PAGE && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You've reached the end of the results ({filteredAndSortedCars.length} cars total)</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AdBanner placement="above_footer" />
      <Footer />
    </div>
  );
};

export default CarListing;
