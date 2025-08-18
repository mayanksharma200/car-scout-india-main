// Updated CarListing component with fixed brand filtering
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useSearchParams, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import { carAPI } from "@/services/api";
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

const CarListing = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSearchResults, setHasSearchResults] = useState(false);
  const [searchInfo, setSearchInfo] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");
  const { toast } = useToast();

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
  });

  // Check for URL parameters and set up initial state
  useEffect(() => {
    console.log(
      "CarListing mounted, checking URL params:",
      searchParams.toString()
    );

    // Check for brand parameter from URL
    const brandParam = searchParams.get("brand");
    const modelParam = searchParams.get("model");
    const fuelParam = searchParams.get("fuelType");

    if (brandParam || modelParam || fuelParam) {
      console.log("Found URL parameters:", {
        brandParam,
        modelParam,
        fuelParam,
      });

      // Set filters from URL parameters
      setFilters((prev) => ({
        ...prev,
        brands: brandParam ? [brandParam] : [],
        fuelTypes: fuelParam ? [fuelParam] : [],
      }));

      // Set search state for UI
      setHasSearchResults(true);
      setSearchInfo({
        query: brandParam ? `Brand: ${brandParam}` : "Filtered Results",
        filters: {
          selectedBrand: brandParam,
          selectedModel: modelParam,
          selectedFuel: fuelParam,
        },
        error: null,
      });
    }

    // Check for search results from navigation state
    if (location.state?.searchResults) {
      console.log(
        "Using search results from navigation:",
        location.state.searchResults
      );
      handleSearchResults(location.state);
      return; // Don't load from DB if we have search results
    }

    // Load cars from database
    loadCarsFromDB();
  }, [searchParams.toString()]); // Watch for URL parameter changes

  const handleSearchResults = (navigationState: any) => {
    // Transform search results to match interface
    const transformedCars = navigationState.searchResults.map((car: any) => {
      let carImage = "/placeholder.svg";
      if (
        Array.isArray(car.images) &&
        car.images.length > 0 &&
        car.images[0] !== "/placeholder.svg"
      ) {
        carImage = car.images[0] as string;
      }

      return {
        ...car,
        price: car.price_min || car.price,
        onRoadPrice: car.price_max || car.onRoadPrice,
        fuelType: car.fuel_type || car.fuelType,
        bodyType: car.body_type || car.bodyType,
        seating: car.seating_capacity || car.seating,
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
    setLoading(false);

    // Clear navigation state
    window.history.replaceState({}, document.title);
  };

  const loadCarsFromDB = async () => {
    try {
      console.log("Loading cars from database...");
      setLoading(true);
      // DON'T clear hasSearchResults here - preserve URL-based search state

      let carsData = null;

      // Try API first
      try {
        const response = await carAPI.getAll({
          status: "active",
          limit: 500,
        });

        if (response.success && response.data) {
          console.log("✅ Cars loaded from API:", response.data.length, "cars");
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
          .order("brand", { ascending: true });

        if (supabaseError) {
          console.error("❌ Supabase error:", supabaseError);
          throw supabaseError;
        }

        carsData = supabaseData;
        console.log("✅ Cars loaded from Supabase:", carsData?.length, "cars");
      }

      if (carsData && carsData.length > 0) {
        // Transform cars to match interface
        const transformedCars = carsData.map((car) => {
          let carImage = "/placeholder.svg";
          if (
            Array.isArray(car.images) &&
            car.images.length > 0 &&
            car.images[0] !== "/placeholder.svg"
          ) {
            carImage = car.images[0] as string;
          }

          return {
            ...car,
            price: car.price_min || car.price,
            onRoadPrice: car.price_max || car.onRoadPrice,
            fuelType: car.fuel_type || car.fuelType,
            bodyType: car.body_type || car.bodyType,
            seating: car.seating_capacity || car.seating,
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

        console.log("Transformed cars:", transformedCars.length);

        // Debug: Log brand distribution
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
    } catch (error) {
      console.error("Error loading cars:", error);
      setCars([]);
      toast({
        title: "Error loading cars",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to clear search and show all cars
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
    });
    // Update URL to remove parameters
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
      filters.features.length
    );
  };

  // Filter and sort cars
  const getFilteredAndSortedCars = () => {
    console.log("Applying filters:", filters);
    console.log("Total cars before filtering:", cars.length);

    let filteredCars = cars.filter((car) => {
      // Search query filter
      const searchMatch =
        searchQuery === "" ||
        car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.variant.toLowerCase().includes(searchQuery.toLowerCase());

      // Price range filter
      const priceMatch =
        car.price >= filters.priceRange[0] &&
        car.price <= filters.priceRange[1];

      // Brand filter
      const brandMatch =
        filters.brands.length === 0 || filters.brands.includes(car.brand);

      // Debug brand filtering
      if (filters.brands.length > 0) {
        console.log(
          `Checking car brand "${car.brand}" against filters:`,
          filters.brands,
          "Match:",
          brandMatch
        );
      }

      // Fuel type filter
      const fuelMatch =
        filters.fuelTypes.length === 0 ||
        filters.fuelTypes.includes(car.fuelType);

      // Transmission filter
      const transmissionMatch =
        filters.transmissions.length === 0 ||
        filters.transmissions.includes(car.transmission);

      // Body type filter
      const bodyTypeMatch =
        filters.bodyTypes.length === 0 ||
        filters.bodyTypes.includes(car.bodyType);

      // Color filter
      const colorMatch =
        filters.colors.length === 0 || filters.colors.includes(car.color);

      // Year filter
      const yearMatch =
        car.year >= filters.yearRange[0] && car.year <= filters.yearRange[1];

      // Seating filter
      const seatingMatch =
        filters.seating.length === 0 ||
        filters.seating.includes(car.seating.toString());

      // Features filter
      const featuresMatch =
        filters.features.length === 0 ||
        filters.features.every((feature) => car.features.includes(feature));

      const overallMatch =
        searchMatch &&
        priceMatch &&
        brandMatch &&
        fuelMatch &&
        transmissionMatch &&
        bodyTypeMatch &&
        colorMatch &&
        yearMatch &&
        seatingMatch &&
        featuresMatch;

      return overallMatch;
    });

    console.log("Cars after filtering:", filteredCars.length);

    // Sort cars based on sort option
    switch (sortBy) {
      case "price-low":
        filteredCars.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filteredCars.sort((a, b) => b.price - a.price);
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
  };

  const filteredAndSortedCars = getFilteredAndSortedCars();

  // Extract filter options from available cars
  const brands = [...new Set(cars.map((car) => car.brand))].sort();
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Search Results Header */}
      {hasSearchResults && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-blue-900">
                  Search Results
                  {searchInfo?.query && (
                    <span className="ml-2 text-blue-600">
                      for "{searchInfo.query}"
                    </span>
                  )}
                </h2>
                <p className="text-blue-700">
                  Found {filteredAndSortedCars.length} car
                  {filteredAndSortedCars.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Button
                onClick={clearSearch}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Show All Cars
              </Button>
            </div>

            {/* Display active filters */}
            {searchInfo?.filters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {searchInfo.filters.selectedBrand && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    Brand: {searchInfo.filters.selectedBrand}
                  </Badge>
                )}
                {searchInfo.filters.carType && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    Type: {searchInfo.filters.carType}
                  </Badge>
                )}
                {searchInfo.filters.fuelTypes?.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
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
      <div className="bg-muted/30 py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <div className="space-y-4">
            {/* Search row */}
            <div className="flex gap-2 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search cars, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              <Select>
                <SelectTrigger className="w-28 sm:w-40 md:w-48">
                  <MapPin className="w-4 h-4 mr-1 sm:mr-2" />
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filters and view controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`text-xs sm:text-sm ${
                    getActiveFiltersCount() > 0
                      ? "border-primary bg-primary/10"
                      : ""
                  }`}
                >
                  <Filter className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Filters</span>
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-24 sm:w-32 md:w-40 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popular</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="mileage">Best Mileage</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none px-2 sm:px-3"
                  >
                    <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none border-l px-2 sm:px-3"
                  >
                    <List className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Active filters:</span>
              {filters.brands.map((brand) => (
                <Badge
                  key={brand}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("brands", brand, false)}
                >
                  {brand} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {filters.fuelTypes.map((fuel) => (
                <Badge
                  key={fuel}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("fuelTypes", fuel, false)}
                >
                  {fuel} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {filters.bodyTypes.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("bodyTypes", type, false)}
                >
                  {type} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {filters.colors.map((color) => (
                <Badge
                  key={color}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("colors", color, false)}
                >
                  {color} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All <X className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Advanced Filters Sidebar */}
          <div
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-80 space-y-6`}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Advanced Filters</h3>
                  {getActiveFiltersCount() > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" />
                    Price Range
                  </h4>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, priceRange: value }))
                    }
                    max={5000000}
                    min={0}
                    step={50000}
                    className="w-full mb-3"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>₹{(filters.priceRange[0] / 100000).toFixed(1)}L</span>
                    <span>₹{(filters.priceRange[1] / 100000).toFixed(1)}L</span>
                  </div>
                </div>

                {/* Brand */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Brand</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={brand}
                          checked={filters.brands.includes(brand)}
                          onCheckedChange={(checked) =>
                            handleFilterChange(
                              "brands",
                              brand,
                              checked as boolean
                            )
                          }
                        />
                        <label
                          htmlFor={brand}
                          className="text-sm cursor-pointer"
                        >
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Body Type */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <CarIcon className="w-4 h-4" />
                    Body Type
                  </h4>
                  <div className="space-y-2">
                    {bodyTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={filters.bodyTypes.includes(type)}
                          onCheckedChange={(checked) =>
                            handleFilterChange(
                              "bodyTypes",
                              type,
                              checked as boolean
                            )
                          }
                        />
                        <label
                          htmlFor={type}
                          className="text-sm cursor-pointer"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fuel Type */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Fuel Type
                  </h4>
                  <div className="space-y-2">
                    {fuelTypes.map((fuel) => (
                      <div key={fuel} className="flex items-center space-x-2">
                        <Checkbox
                          id={fuel}
                          checked={filters.fuelTypes.includes(fuel)}
                          onCheckedChange={(checked) =>
                            handleFilterChange(
                              "fuelTypes",
                              fuel,
                              checked as boolean
                            )
                          }
                        />
                        <label
                          htmlFor={fuel}
                          className="text-sm cursor-pointer"
                        >
                          {fuel}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rest of the filters remain the same... */}
              </CardContent>
            </Card>
          </div>

          {/* Car Listings */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">
                  {hasSearchResults ? "Search Results" : "New Cars"} (
                  {filteredAndSortedCars.length} Results)
                </h1>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
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
              <div className="text-center py-12">
                <CarIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No cars found</h3>
                <p className="text-muted-foreground mb-4">
                  {hasSearchResults
                    ? "Try adjusting your search criteria or browse all available cars."
                    : "Try adjusting your filters or search query"}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear All Filters
                  </Button>
                  {hasSearchResults && (
                    <Button onClick={clearSearch}>View All Cars</Button>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredAndSortedCars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}

            {/* Load More */}
            {filteredAndSortedCars.length > 0 && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Load More Cars
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CarListing;
