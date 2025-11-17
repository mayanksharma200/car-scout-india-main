import React, { useState, useEffect } from "react";
import {
  Car,
  Plus,
  ArrowRight,
  Star,
  X,
  Search,
  Check,
  Users,
  Fuel,
  Settings,
  Zap,
  Gauge,
  Shield,
  Heart,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { carAPI } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";

// Car Selector Modal Component using your existing API pattern
const CarSelectorModal = ({
  isOpen,
  onClose,
  onSelectCar,
  title = "Select a Car",
  excludeCarIds = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use the same pattern as your CarListing component
  const loadCarsFromDB = async () => {
    try {
      console.log("Loading cars for comparison modal...");
      setLoading(true);
      setError(null);

      let carsData = null;

      // Try API first - same pattern as your CarListing
      try {
        const response = await carAPI.getAll({
          status: "active",
          limit: 500, // Load more cars for comparison
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

      // If API failed, try Supabase directly - same fallback pattern
      if (!carsData) {
        console.log("🔄 Falling back to Supabase direct access...");
        const { data: supabaseData, error: supabaseError } = await supabase
          .from("cars")
          .select("*")
          .eq("status", "active")
          .order("brand", { ascending: true })
          .limit(500);

        if (supabaseError) {
          console.error("❌ Supabase error:", supabaseError);
          throw supabaseError;
        }

        carsData = supabaseData;
        console.log("✅ Cars loaded from Supabase:", carsData?.length, "cars");
      }

      if (carsData && carsData.length > 0) {
        // Transform cars to match interface - same pattern as your CarListing
        const transformedCars = carsData.map((car) => {
          let carImage = "/placeholder.svg";
          if (
            Array.isArray(car.images) &&
            car.images.length > 0 &&
            car.images[0] !== "/placeholder.svg"
          ) {
            carImage = car.images[0];
          }

          return {
            ...car, // Keep all original fields
            // Override specific fields with transformed values
            price: car.price_min || car.price,
            onRoadPrice: car.price_max || car.onRoadPrice,
            fuelType: car.fuel_type || car.fuelType,
            bodyType: car.body_type || car.bodyType,
            seating: car.seating_capacity || car.seating,
            rating: car.rating || 4.2 + Math.random() * 0.8,
            image: carImage,
            color: car.color || "Pearl White",
            year: car.year || 2024,
            features: car.features || [],
            mileage: parseFloat(
              car.mileage?.toString()?.replace(/[^\d.]/g, "") || "15"
            ),
            isPopular: car.isPopular || Math.random() > 0.7,
            isBestSeller: car.isBestSeller || Math.random() > 0.8,
          };
        });

        console.log("Transformed cars for comparison:", transformedCars.length);
        setCars(transformedCars.filter((car) => !excludeCarIds.includes(car.id)));
      } else {
        console.log("No cars found in database");
        setCars([]);
      }
    } catch (error) {
      console.error("Error loading cars:", error);
      setError("Failed to load cars. Please try again.");
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  // Load cars when modal opens or when excluded cars change
  useEffect(() => {
    if (isOpen) {
      loadCarsFromDB();
    }
  }, [isOpen, excludeCarIds]);

  // Filter cars based on search and brand - same logic as your CarListing
  const filteredCars = cars.filter((car) => {
    const searchMatch =
      searchQuery === "" ||
      car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.variant.toLowerCase().includes(searchQuery.toLowerCase());

    const brandMatch = selectedBrand === "" || car.brand === selectedBrand;

    return searchMatch && brandMatch;
  });

  // Get unique brands for filtering - same as your CarListing
  const brands = [...new Set(cars.map((car) => car.brand))].sort();

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Price not available';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString()}`;
  };

  const handleSelectCar = (car) => {
    onSelectCar(car);
    onClose();
    setSearchQuery("");
    setSelectedBrand("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Search and Filters - same as your CarListing */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by brand, model, or variant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Car List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-gray-500">Loading cars...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <Car className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-500 mb-2">{error}</p>
                <Button size="sm" onClick={loadCarsFromDB} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-8">
                <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No cars available</p>
                <Button
                  size="sm"
                  onClick={loadCarsFromDB}
                  variant="outline"
                  className="mt-2"
                >
                  Refresh
                </Button>
              </div>
            ) : filteredCars.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No cars match your search</p>
                <Button
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedBrand("");
                  }}
                  variant="outline"
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredCars.map((car) => (
                <div
                  key={car.id}
                  onClick={() => handleSelectCar(car)}
                  className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group"
                >
                  <img
                    src={car.image}
                    alt={`${car.brand} ${car.model}`}
                    className="w-16 h-12 object-cover rounded bg-gray-100"
                    
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {car.brand} {car.model}
                    </h3>
                    <p className="text-sm text-gray-600">{car.variant}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {car.fuelType}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        ★ {car.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      {formatPrice(car.price)}
                    </p>
                    <p className="text-xs text-gray-500">onwards</p>
                  </div>

                  <Check className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Compare Section using your existing data
const CompareSection = () => {
  const [selectedCar1, setSelectedCar1] = useState(null);
  const [selectedCar2, setSelectedCar2] = useState(null);
  const [showCarSelector, setShowCarSelector] = useState(false);
  const [selectorFor, setSelectorFor] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [popularCars, setPopularCars] = useState([]);

  // Load popular cars for quick comparisons
  useEffect(() => {
    loadPopularCars();
  }, []);

  const loadPopularCars = async () => {
    try {
      const response = await carAPI.getAll({
        status: "active",
        limit: 20, // Get some popular cars
      });

      if (response.success && response.data) {
        setPopularCars(response.data);
      }
    } catch (error) {
      console.warn("Could not load popular cars for comparisons");
    }
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Price not available';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString()}`;
  };

  const handleChooseCar = (carPosition) => {
    setSelectorFor(carPosition);
    setShowCarSelector(true);
  };

  const handleCarSelect = (car) => {
    if (selectorFor === "car1") {
      setSelectedCar1(car);
    } else {
      setSelectedCar2(car);
    }
    setShowCarSelector(false);
    setSelectorFor(null);
  };

  const handleStartComparison = () => {
    if (selectedCar1 && selectedCar2) {
      setShowComparison(true);
    }
  };

  const handleClearCar = (carPosition) => {
    if (carPosition === "car1") {
      setSelectedCar1(null);
    } else {
      setSelectedCar2(null);
    }
  };

  // Generate popular comparisons from your actual car data
  const generatePopularComparisons = () => {
    if (popularCars.length < 6) return [];

    const popularPairs = [
      { brands: ["Maruti Suzuki"], models: ["Swift"] },
      { brands: ["Hyundai"], models: ["i20", "Venue"] },
      { brands: ["Tata"], models: ["Nexon", "Harrier"] },
      { brands: ["Mahindra"], models: ["XUV700"] },
    ];

    const comparisons = [];

    for (let i = 0; i < popularPairs.length && comparisons.length < 3; i++) {
      const pair1 = popularPairs[i];
      const pair2 = popularPairs[(i + 1) % popularPairs.length];

      const car1 = popularCars.find(
        (car) =>
          pair1.brands.includes(car.brand) &&
          pair1.models.some((model) =>
            car.model.toLowerCase().includes(model.toLowerCase())
          )
      );

      const car2 = popularCars.find(
        (car) =>
          car.id !== car1?.id &&
          pair2.brands.includes(car.brand) &&
          pair2.models.some((model) =>
            car.model.toLowerCase().includes(model.toLowerCase())
          )
      );

      if (car1 && car2) {
        comparisons.push({
          id: i + 1,
          car1: {
            ...car1,
            price: formatPrice(car1.price_min || car1.price || 0),
            rating: car1.rating || 4.0 + Math.random() * 1.0,
          },
          car2: {
            ...car2,
            price: formatPrice(car2.price_min || car2.price || 0),
            rating: car2.rating || 4.0 + Math.random() * 1.0,
          },
          comparisons: `${(Math.random() * 10 + 5).toFixed(1)}k comparisons`,
        });
      }
    }

    return comparisons;
  };

  const popularComparisons = generatePopularComparisons();

  const handleQuickCompare = (comparison) => {
    // Transform API data to comparison format
    const car1 = {
      ...comparison.car1,
      price: comparison.car1.price_min || comparison.car1.price || 0,
      fuelType:
        comparison.car1.fuel_type || comparison.car1.fuelType || "Petrol",
      image:
        Array.isArray(comparison.car1.images) &&
        comparison.car1.images.length > 0
          ? comparison.car1.images[0]
          : "/placeholder.svg",
    };

    const car2 = {
      ...comparison.car2,
      price: comparison.car2.price_min || comparison.car2.price || 0,
      fuelType:
        comparison.car2.fuel_type || comparison.car2.fuelType || "Petrol",
      image:
        Array.isArray(comparison.car2.images) &&
        comparison.car2.images.length > 0
          ? comparison.car2.images[0]
          : "/placeholder.svg",
    };

    setSelectedCar1(car1);
    setSelectedCar2(car2);
    setShowComparison(true);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 animate-fade-in">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Compare Cars Side by Side
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Make informed decisions with detailed car comparisons. Compare
            specifications, features, prices, and more to find the perfect car
            for your needs.
          </p>
        </div>

        {/* Comparison Builder */}
        <Card className="mb-12 shadow-lg border-border">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Car className="w-6 h-6 text-blue-600" />
              Build Your Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 items-center">
              {/* Car selectors and comparison UI */}
              <div className="text-center">
                {selectedCar1 ? (
                  <div className="relative">
                    <div className="w-full p-4 bg-gray-50 rounded-lg border-2 border-blue-200 mb-4">
                      <button
                        onClick={() => handleClearCar("car1")}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <img
                        src={selectedCar1.image}
                        alt={`${selectedCar1.brand} ${selectedCar1.model}`}
                        className="w-full h-20 object-contain rounded mb-2 bg-gray-200"
                        
                      />
                      <h4 className="font-bold text-sm">
                        {selectedCar1.brand} {selectedCar1.model}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {selectedCar1.variant}
                      </p>
                      <p className="text-blue-600 font-semibold">
                        {formatPrice(selectedCar1.price)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4 hover:border-blue-500 transition-colors cursor-pointer group"
                    onClick={() => handleChooseCar("car1")}
                  >
                    <div className="text-center group-hover:text-blue-600 transition-colors">
                      <Plus className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Select First Car</p>
                    </div>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleChooseCar("car1")}
                >
                  {selectedCar1 ? "Change Car" : "Choose Car"}
                </Button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-white">VS</span>
                </div>
              </div>

              <div className="text-center">
                {selectedCar2 ? (
                  <div className="relative">
                    <div className="w-full p-4 bg-gray-50 rounded-lg border-2 border-orange-200 mb-4">
                      <button
                        onClick={() => handleClearCar("car2")}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <img
                        src={selectedCar2.image}
                        alt={`${selectedCar2.brand} ${selectedCar2.model}`}
                        className="w-full h-20 object-contain rounded mb-2 bg-gray-200"
                        
                      />
                      <h4 className="font-bold text-sm">
                        {selectedCar2.brand} {selectedCar2.model}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {selectedCar2.variant}
                      </p>
                      <p className="text-orange-600 font-semibold">
                        {formatPrice(selectedCar2.price)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4 hover:border-orange-500 transition-colors cursor-pointer group"
                    onClick={() => handleChooseCar("car2")}
                  >
                    <div className="text-center group-hover:text-orange-600 transition-colors">
                      <Plus className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Select Second Car</p>
                    </div>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleChooseCar("car2")}
                >
                  {selectedCar2 ? "Change Car" : "Choose Car"}
                </Button>
              </div>
            </div>

            <div className="text-center mt-6">
              <Button
                className="bg-gradient-to-r from-blue-500 to-orange-500 hover:opacity-90 shadow-lg disabled:opacity-50 text-white"
                disabled={!selectedCar1 || !selectedCar2}
                onClick={handleStartComparison}
              >
                {selectedCar1 && selectedCar2
                  ? "Start Comparison"
                  : "Select Both Cars to Compare"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Show Advanced Tabbed Comparison Results */}
        {showComparison && selectedCar1 && selectedCar2 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Advanced Car Comparison</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowComparison(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hide
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Car Headers */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="text-center p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
                  <img
                    src={selectedCar1.image}
                    alt={`${selectedCar1.brand} ${selectedCar1.model}`}
                    className="w-full h-40 object-contain rounded-lg mb-4 bg-white"
                    
                  />
                  <h3 className="font-bold text-2xl text-blue-800">
                    {selectedCar1.brand} {selectedCar1.model}
                  </h3>
                  <p className="text-gray-600 mb-2">{selectedCar1.variant}</p>
                  <p className="text-blue-600 font-bold text-2xl">
                    {formatPrice(selectedCar1.price)}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {selectedCar1.rating?.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="text-center p-6 border-2 border-orange-200 rounded-lg bg-orange-50">
                  <img
                    src={selectedCar2.image}
                    alt={`${selectedCar2.brand} ${selectedCar2.model}`}
                    className="w-full h-40 object-contain rounded-lg mb-4 bg-white"
                    
                  />
                  <h3 className="font-bold text-2xl text-orange-800">
                    {selectedCar2.brand} {selectedCar2.model}
                  </h3>
                  <p className="text-gray-600 mb-2">{selectedCar2.variant}</p>
                  <p className="text-orange-600 font-bold text-2xl">
                    {formatPrice(selectedCar2.price)}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {selectedCar2.rating?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile-Responsive Tabbed Comparison */}
              <Tabs defaultValue="overview" className="w-full">
                {/* Scrollable tabs for mobile, grid for desktop */}
                <div className="w-full mb-8">
                  <div className="overflow-x-auto">
                    <TabsList className="inline-flex w-full min-w-max md:grid md:grid-cols-5 h-auto p-1">
                      <TabsTrigger
                        value="overview"
                        className="flex-shrink-0 px-3 py-2 text-sm md:px-4 md:py-3"
                      >
                        <span className="hidden sm:inline">Overview</span>
                        <span className="sm:hidden">Info</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="specs"
                        className="flex-shrink-0 px-3 py-2 text-sm md:px-4 md:py-3"
                      >
                        <span className="hidden sm:inline">Specifications</span>
                        <span className="sm:hidden">Specs</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="features"
                        className="flex-shrink-0 px-3 py-2 text-sm md:px-4 md:py-3"
                      >
                        <span className="hidden sm:inline">Features</span>
                        <span className="sm:hidden">Features</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="performance"
                        className="flex-shrink-0 px-3 py-2 text-sm md:px-4 md:py-3"
                      >
                        <span className="hidden sm:inline">Performance</span>
                        <span className="sm:hidden">Power</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="verdict"
                        className="flex-shrink-0 px-3 py-2 text-sm md:px-4 md:py-3"
                      >
                        <span className="hidden sm:inline">Verdict</span>
                        <span className="sm:hidden">Result</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <TabsContent
                  value="overview"
                  className="space-y-4 md:space-y-6"
                >
                  {/* Quick Comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg md:text-xl">
                        Quick Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-3 md:space-y-4">
                          <h5 className="font-semibold text-blue-600 text-base md:text-lg">
                            {selectedCar1.brand} {selectedCar1.model}
                          </h5>
                          {[
                            {
                              label: "Price",
                              value: formatPrice(selectedCar1.price),
                              icon: "₹",
                            },
                            {
                              label: "Fuel Type",
                              value: selectedCar1.fuelType || "Petrol",
                              icon: Fuel,
                            },
                            {
                              label: "Mileage",
                              value: selectedCar1.mileage
                                ? `${selectedCar1.mileage} kmpl`
                                : "20 kmpl",
                              icon: Gauge,
                            },
                            {
                              label: "Seating",
                              value: `${selectedCar1.seating || 5} Seater`,
                              icon: Users,
                            },
                            {
                              label: "Body Type",
                              value: selectedCar1.bodyType || "Hatchback",
                              icon: Car,
                            },
                            {
                              label: "Rating",
                              value: selectedCar1.rating?.toFixed(1) || "4.2",
                              icon: Star,
                            },
                          ].map((spec, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 md:p-3 bg-blue-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                {typeof spec.icon === "string" ? (
                                  <span className="text-blue-600 font-bold text-sm">
                                    {spec.icon}
                                  </span>
                                ) : (
                                  <spec.icon className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                                )}
                                <span className="font-medium text-sm md:text-base">
                                  {spec.label}
                                </span>
                              </div>
                              <span className="font-semibold text-blue-600 text-sm md:text-base">
                                {spec.value}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-3 md:space-y-4">
                          <h5 className="font-semibold text-orange-600 text-base md:text-lg">
                            {selectedCar2.brand} {selectedCar2.model}
                          </h5>
                          {[
                            {
                              label: "Price",
                              value: formatPrice(selectedCar2.price),
                              icon: "₹",
                            },
                            {
                              label: "Fuel Type",
                              value: selectedCar2.fuelType || "Petrol",
                              icon: Fuel,
                            },
                            {
                              label: "Mileage",
                              value: selectedCar2.mileage
                                ? `${selectedCar2.mileage} kmpl`
                                : "18 kmpl",
                              icon: Gauge,
                            },
                            {
                              label: "Seating",
                              value: `${selectedCar2.seating || 5} Seater`,
                              icon: Users,
                            },
                            {
                              label: "Body Type",
                              value: selectedCar2.bodyType || "Sedan",
                              icon: Car,
                            },
                            {
                              label: "Rating",
                              value: selectedCar2.rating?.toFixed(1) || "4.5",
                              icon: Star,
                            },
                          ].map((spec, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 md:p-3 bg-orange-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                {typeof spec.icon === "string" ? (
                                  <span className="text-orange-600 font-bold text-sm">
                                    {spec.icon}
                                  </span>
                                ) : (
                                  <spec.icon className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
                                )}
                                <span className="font-medium text-sm md:text-base">
                                  {spec.label}
                                </span>
                              </div>
                              <span className="font-semibold text-orange-600 text-sm md:text-base">
                                {spec.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="specs" className="space-y-4 md:space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg md:text-xl">
                        Detailed Specifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2 md:space-y-3">
                          <h5 className="font-semibold text-blue-600 text-base md:text-lg">
                            {selectedCar1.brand} {selectedCar1.model}
                          </h5>
                          {[
                            {
                              label: "Engine Capacity",
                              value: selectedCar1.engine_capacity || "1197 cc",
                            },
                            { label: "Max Power", value: "89 bhp @ 6000 rpm" },
                            { label: "Max Torque", value: "113 Nm @ 4200 rpm" },
                            {
                              label: "Transmission",
                              value:
                                selectedCar1.transmission || "5-Speed Manual",
                            },
                            { label: "Length", value: "3845 mm" },
                            { label: "Width", value: "1735 mm" },
                            { label: "Height", value: "1530 mm" },
                            { label: "Wheelbase", value: "2450 mm" },
                            { label: "Ground Clearance", value: "165 mm" },
                            { label: "Boot Space", value: "268 Litres" },
                            { label: "Fuel Tank", value: "37 Litres" },
                            { label: "Kerb Weight", value: "1050 kg" },
                          ].map((spec, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 border-b border-blue-100"
                            >
                              <span className="text-gray-700 text-sm md:text-base">
                                {spec.label}
                              </span>
                              <span className="font-semibold text-blue-600 text-sm md:text-base">
                                {spec.value}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2 md:space-y-3">
                          <h5 className="font-semibold text-orange-600 text-base md:text-lg">
                            {selectedCar2.brand} {selectedCar2.model}
                          </h5>
                          {[
                            {
                              label: "Engine Capacity",
                              value: selectedCar2.engine_capacity || "999 cc",
                            },
                            { label: "Max Power", value: "95 bhp @ 5500 rpm" },
                            { label: "Max Torque", value: "120 Nm @ 3500 rpm" },
                            {
                              label: "Transmission",
                              value:
                                selectedCar2.transmission || "6-Speed Manual",
                            },
                            { label: "Length", value: "4561 mm" },
                            { label: "Width", value: "1752 mm" },
                            { label: "Height", value: "1507 mm" },
                            { label: "Wheelbase", value: "2651 mm" },
                            { label: "Ground Clearance", value: "179 mm" },
                            { label: "Boot Space", value: "521 Litres" },
                            { label: "Fuel Tank", value: "45 Litres" },
                            { label: "Kerb Weight", value: "1180 kg" },
                          ].map((spec, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 border-b border-orange-100"
                            >
                              <span className="text-gray-700 text-sm md:text-base">
                                {spec.label}
                              </span>
                              <span className="font-semibold text-orange-600 text-sm md:text-base">
                                {spec.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent
                  value="features"
                  className="space-y-4 md:space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg md:text-xl">
                        Features & Equipment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <h5 className="font-semibold text-blue-600 text-base md:text-lg mb-3 md:mb-4">
                            {selectedCar1.brand} {selectedCar1.model}
                          </h5>

                          <div className="space-y-3 md:space-y-4">
                            <div>
                              <h6 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm md:text-base">
                                <Shield className="w-3 h-3 md:w-4 md:h-4" />
                                Safety Features
                              </h6>
                              <div className="space-y-1">
                                {[
                                  "Dual Airbags",
                                  "ABS with EBD",
                                  "Central Locking",
                                  "Immobilizer",
                                  "Speed Alert",
                                ].map((feature, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 text-xs md:text-sm"
                                  >
                                    <Check className="w-2 h-2 md:w-3 md:h-3 text-green-600 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h6 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm md:text-base">
                                <Settings className="w-3 h-3 md:w-4 md:h-4" />
                                Comfort Features
                              </h6>
                              <div className="space-y-1">
                                {(selectedCar1.features &&
                                selectedCar1.features.length > 0
                                  ? selectedCar1.features.slice(0, 5)
                                  : [
                                      "Power Steering",
                                      "Air Conditioning",
                                      "Power Windows",
                                      "Adjustable Seats",
                                      "Digital Odometer",
                                    ]
                                ).map((feature, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 text-xs md:text-sm"
                                  >
                                    <Check className="w-2 h-2 md:w-3 md:h-3 text-green-600 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h6 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm md:text-base">
                                <Smartphone className="w-3 h-3 md:w-4 md:h-4" />
                                Entertainment
                              </h6>
                              <div className="space-y-1">
                                {[
                                  "Bluetooth",
                                  "USB & AUX",
                                  "Steering Controls",
                                  "Digital Display",
                                ].map((feature, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 text-xs md:text-sm"
                                  >
                                    <Check className="w-2 h-2 md:w-3 md:h-3 text-green-600 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold text-orange-600 text-base md:text-lg mb-3 md:mb-4">
                            {selectedCar2.brand} {selectedCar2.model}
                          </h5>

                          <div className="space-y-3 md:space-y-4">
                            <div>
                              <h6 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm md:text-base">
                                <Shield className="w-3 h-3 md:w-4 md:h-4" />
                                Safety Features
                              </h6>
                              <div className="space-y-1">
                                {[
                                  "6 Airbags",
                                  "ABS with EBD",
                                  "ESP",
                                  "Hill Hold Control",
                                  "ISOFIX",
                                ].map((feature, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 text-xs md:text-sm"
                                  >
                                    <Check className="w-2 h-2 md:w-3 md:h-3 text-green-600 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h6 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm md:text-base">
                                <Settings className="w-3 h-3 md:w-4 md:h-4" />
                                Comfort Features
                              </h6>
                              <div className="space-y-1">
                                {(selectedCar2.features &&
                                selectedCar2.features.length > 0
                                  ? selectedCar2.features.slice(0, 5)
                                  : [
                                      "Climate Control",
                                      "Leather Seats",
                                      "Sunroof",
                                      "Cruise Control",
                                      "Auto Lights",
                                    ]
                                ).map((feature, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 text-xs md:text-sm"
                                  >
                                    <Check className="w-2 h-2 md:w-3 md:h-3 text-green-600 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h6 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm md:text-base">
                                <Smartphone className="w-3 h-3 md:w-4 md:h-4" />
                                Entertainment
                              </h6>
                              <div className="space-y-1">
                                {[
                                  "Touchscreen",
                                  "Android Auto",
                                  "Apple CarPlay",
                                  "Premium Audio",
                                  "Wireless Charging",
                                ].map((feature, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 text-xs md:text-sm"
                                  >
                                    <Check className="w-2 h-2 md:w-3 md:h-3 text-green-600 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h5 className="font-semibold text-blue-600 text-lg">
                            {selectedCar1.brand} {selectedCar1.model}
                          </h5>
                          {[
                            {
                              label: "Top Speed",
                              value: "165 kmph",
                              icon: Gauge,
                            },
                            {
                              label: "Acceleration (0-100)",
                              value: "12.1 seconds",
                              icon: Zap,
                            },
                            {
                              label: "Fuel Efficiency",
                              value: selectedCar1.mileage
                                ? `${selectedCar1.mileage} kmpl`
                                : "23.2 kmpl",
                              icon: Fuel,
                            },
                            {
                              label: "Emission Standard",
                              value: "BS6",
                              icon: Settings,
                            },
                            { label: "Drive Type", value: "FWD", icon: Car },
                            {
                              label: "Gearbox",
                              value:
                                selectedCar1.transmission || "5-Speed Manual",
                              icon: Settings,
                            },
                          ].map((spec, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <spec.icon className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">
                                  {spec.label}
                                </span>
                              </div>
                              <span className="font-semibold text-blue-600">
                                {spec.value}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <h5 className="font-semibold text-orange-600 text-lg">
                            {selectedCar2.brand} {selectedCar2.model}
                          </h5>
                          {[
                            {
                              label: "Top Speed",
                              value: "190 kmph",
                              icon: Gauge,
                            },
                            {
                              label: "Acceleration (0-100)",
                              value: "10.6 seconds",
                              icon: Zap,
                            },
                            {
                              label: "Fuel Efficiency",
                              value: selectedCar2.mileage
                                ? `${selectedCar2.mileage} kmpl`
                                : "18.1 kmpl",
                              icon: Fuel,
                            },
                            {
                              label: "Emission Standard",
                              value: "BS6",
                              icon: Settings,
                            },
                            { label: "Drive Type", value: "FWD", icon: Car },
                            {
                              label: "Gearbox",
                              value:
                                selectedCar2.transmission ||
                                "6-Speed Automatic",
                              icon: Settings,
                            },
                          ].map((spec, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <spec.icon className="w-4 h-4 text-orange-600" />
                                <span className="font-medium">
                                  {spec.label}
                                </span>
                              </div>
                              <span className="font-semibold text-orange-600">
                                {spec.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="verdict" className="space-y-6">
                  {/* Final Verdict */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Final Verdict</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                          <h5 className="font-semibold text-green-700 mb-2">
                            💰 Best Value
                          </h5>
                          <p className="font-bold text-lg">
                            {selectedCar1.price < selectedCar2.price
                              ? `${selectedCar1.brand} ${selectedCar1.model}`
                              : `${selectedCar2.brand} ${selectedCar2.model}`}
                          </p>
                          <p className="text-sm text-green-600">
                            ₹
                            {Math.abs(
                              selectedCar1.price - selectedCar2.price
                            ).toLocaleString()}{" "}
                            cheaper
                          </p>
                        </div>

                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h5 className="font-semibold text-blue-700 mb-2">
                            ⭐ Higher Rated
                          </h5>
                          <p className="font-bold text-lg">
                            {selectedCar1.rating > selectedCar2.rating
                              ? `${selectedCar1.brand} ${selectedCar1.model}`
                              : `${selectedCar2.brand} ${selectedCar2.model}`}
                          </p>
                          <p className="text-sm text-blue-600">
                            {Math.max(
                              selectedCar1.rating,
                              selectedCar2.rating
                            ).toFixed(1)}
                            /5 rating
                          </p>
                        </div>

                        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <h5 className="font-semibold text-purple-700 mb-2">
                            🏆 Recommended
                          </h5>
                          <p className="font-bold text-lg">
                            {selectedCar1.rating > selectedCar2.rating
                              ? `${selectedCar1.brand} ${selectedCar1.model}`
                              : `${selectedCar2.brand} ${selectedCar2.model}`}
                          </p>
                          <p className="text-sm text-purple-600">
                            Overall better choice
                          </p>
                        </div>
                      </div>

                      {/* Pros & Cons */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h5 className="font-semibold text-blue-600 text-lg">
                            {selectedCar1.brand} {selectedCar1.model}
                          </h5>
                          <div>
                            <h6 className="font-semibold text-green-600 mb-2">
                              ✅ Pros
                            </h6>
                            <div className="space-y-1">
                              {[
                                "Excellent fuel efficiency",
                                "Reliable brand reputation",
                                "Good resale value",
                                "Lower maintenance costs",
                              ].map((pro, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span>{pro}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h6 className="font-semibold text-red-600 mb-2">
                              ❌ Cons
                            </h6>
                            <div className="space-y-1">
                              {[
                                "Limited rear space",
                                "Basic interior features",
                                "Road noise at highway speeds",
                              ].map((con, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span>{con}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h5 className="font-semibold text-orange-600 text-lg">
                            {selectedCar2.brand} {selectedCar2.model}
                          </h5>
                          <div>
                            <h6 className="font-semibold text-green-600 mb-2">
                              ✅ Pros
                            </h6>
                            <div className="space-y-1">
                              {[
                                "Spacious cabin and boot",
                                "Premium interior quality",
                                "Advanced safety features",
                                "Smooth and refined engine",
                              ].map((pro, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span>{pro}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h6 className="font-semibold text-red-600 mb-2">
                              ❌ Cons
                            </h6>
                            <div className="space-y-1">
                              {[
                                "Higher purchase price",
                                "More expensive maintenance",
                                "Lower fuel efficiency",
                              ].map((con, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span>{con}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Popular Comparisons */}
        {/* <div>
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
            Popular Comparisons
          </h3>

          {popularComparisons.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Loading popular comparisons...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {popularComparisons.map((comparison, index) => (
                <Card
                  key={comparison.id}
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center flex-1">
                        <h4 className="font-bold text-lg">
                          {comparison.car1.brand} {comparison.car1.model}
                        </h4>
                        <p className="text-orange-600 font-semibold">
                          {comparison.car1.price}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">
                            {comparison.car1.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <div className="mx-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            VS
                          </span>
                        </div>
                      </div>

                      <div className="text-center flex-1">
                        <h4 className="font-bold text-lg">
                          {comparison.car2.brand} {comparison.car2.model}
                        </h4>
                        <p className="text-orange-600 font-semibold">
                          {comparison.car2.price}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">
                            {comparison.car2.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">
                        {comparison.comparisons}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="group-hover:bg-blue-600 group-hover:text-white transition-colors"
                        onClick={() => handleQuickCompare(comparison)}
                      >
                        View Comparison
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div> */}
{/* 
        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
          >
            View All Comparisons
          </Button>
        </div> */}

        <CarSelectorModal
          isOpen={showCarSelector}
          onClose={() => {
            setShowCarSelector(false);
            setSelectorFor(null);
          }}
          onSelectCar={handleCarSelect}
          title={
            selectorFor === "car1" ? "Select First Car" : "Select Second Car"
          }
          excludeCarIds={[selectedCar1?.id, selectedCar2?.id].filter(Boolean)}
        />
      </div>
    </section>
  );
};

export default CompareSection;
