import { useState, useEffect, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  IndianRupee,
  Fuel,
  Car,
  Users,
  X,
  Zap,
  Shield,
  Award,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const AnimatedCounter = ({ end, suffix = "", delay = 0 }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5, rootMargin: "0px 0px -100px 0px" }
    );
    if (counterRef.current) observer.observe(counterRef.current);
    return () => { if (counterRef.current) observer.unobserve(counterRef.current); };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const startTimer = setTimeout(() => setHasStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [isVisible, delay]);

  useEffect(() => {
    if (!hasStarted) return;
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const currentValue = Math.min(Math.round(increment * currentStep), end);
      setCount(currentValue);
      if (currentStep >= steps) clearInterval(timer);
    }, stepDuration);
    return () => clearInterval(timer);
  }, [hasStarted, end]);

  return <span ref={counterRef}>{count.toLocaleString()}{suffix}</span>;
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState([5, 50]);
  const [mileageRange, setMileageRange] = useState([10, 30]);

  const [stats, setStats] = useState({
    totalCars: 0,
    totalBrands: 0,
    totalCities: 0,
  });

  const [carBrands, setCarBrands] = useState<string[]>([]);

  useEffect(() => {
    // alert("HeroSection Mounted!"); // visual proof
    console.error("HeroSection useEffect running - ERROR LEVEL"); // error level to bypass filters
    const fetchStats = async () => {
      try {
        console.error("Fetching stats from Supabase... - ERROR LEVEL");
        const { data: cars, error } = await supabase.from('cars').select('brand');
        if (error) throw error;
        if (cars) {
          const uniqueBrands = [...new Set(cars.map(c => c.brand))]
            .filter((b): b is string => typeof b === 'string')
            .sort();
          console.error("Fetched brands:", uniqueBrands);
          setCarBrands(uniqueBrands);
          setStats({
            totalCars: cars.length,
            totalBrands: uniqueBrands.length,
            totalCities: 8,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, []);



  // Main search states
  const [carType, setCarType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  // Filter states
  const [fuelTypes, setFuelTypes] = useState([]);
  const [transmissions, setTransmissions] = useState([]);
  const [bodyTypes, setBodyTypes] = useState([]);
  const [seatingOptions, setSeatingOptions] = useState([]);
  const [brands, setBrands] = useState([]);

  const toggleFilter = (value, currentArray, setter) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    setter(newArray);
  };

  const clearAllFilters = () => {
    setFuelTypes([]);
    setTransmissions([]);
    setBodyTypes([]);
    setSeatingOptions([]);
    setBrands([]);
    setPriceRange([5, 50]);
    setMileageRange([10, 30]);
    setCarType("");
    setSelectedCity("");
    setSelectedBudget("");
    setSelectedBrand("");
  };

  const getActiveFiltersCount = () => {
    return (
      fuelTypes.length +
      transmissions.length +
      bodyTypes.length +
      seatingOptions.length +
      brands.length +
      (carType ? 1 : 0) +
      (selectedCity ? 1 : 0) +
      (selectedBudget ? 1 : 0) +
      (selectedBrand ? 1 : 0) +
      (priceRange[0] !== 5 || priceRange[1] !== 50 ? 1 : 0) +
      (mileageRange[0] !== 10 || mileageRange[1] !== 30 ? 1 : 0)
    );
  };

  // Data options
  const indianCities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Ahmedabad",
  ];

  const budgetRanges = [
    "Under ₹5 Lakh",
    "₹5-10 Lakh",
    "₹10-15 Lakh",
    "₹15-20 Lakh",
    "₹20-30 Lakh",
    "₹30-50 Lakh",
    "₹50 Lakh - ₹1 Crore",
    "Above ₹1 Crore",
  ];

  // carBrands is now a state variable fetched from API

  const filterOptions = {
    fuelTypes: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"],
    transmissions: ["Manual", "Automatic", "CVT", "AMT"],
    bodyTypes: ["Hatchback", "Sedan", "SUV", "Coupe", "Convertible", "MPV"],
    seatingOptions: ["2", "4", "5", "7", "8+"],
    brands: carBrands.length > 0 ? carBrands : [
      "Maruti Suzuki",
      "Hyundai",
      "Tata",
      "Mahindra",
      "Honda",
      "Toyota",
      "BMW",
      "Mercedes-Benz",
      "Audi",
    ],
  };

  // Enhanced build search query - only include brand/model search terms, not filter values
  const buildSearchQuery = () => {
    const searchTerms = [];

    // Add car type filters - these can be searched in text
    if (carType === "new") {
      searchTerms.push("new");
    } else if (carType === "certified") {
      searchTerms.push("certified");
    } else if (carType === "premium") {
      searchTerms.push("premium");
    }

    // Add main brand selection - brands can be searched in text
    if (selectedBrand) {
      searchTerms.push(selectedBrand);
    }

    // Add advanced filter brands - these can be searched in text
    if (brands.length > 0) {
      brands.forEach((brand) => {
        if (!searchTerms.includes(brand)) {
          searchTerms.push(brand);
        }
      });
    }

    // DON'T add fuel types, transmissions, body types, seating to text search
    // These should only be filtered via their respective database columns
    // This prevents conflicts between text search and column filtering

    return searchTerms.join(" ");
  };

  // Enhanced build filter parameters for comprehensive API call
  const buildFilterParams = () => {
    const params = new URLSearchParams();

    // Basic filters
    if (selectedBrand) {
      params.append("brand", selectedBrand);
    }

    if (selectedCity) {
      params.append("city", selectedCity);
    }

    if (carType) {
      params.append("carType", carType);
    }

    // Budget range filter
    if (selectedBudget) {
      params.append("budget", selectedBudget);
    }

    // Price range (convert from lakh to actual price)
    if (priceRange[0] > 5 || priceRange[1] < 50) {
      params.append("minPrice", (priceRange[0] * 100000).toString());
      params.append("maxPrice", (priceRange[1] * 100000).toString());
    }

    // Mileage range
    if (mileageRange[0] > 10 || mileageRange[1] < 30) {
      params.append("minMileage", mileageRange[0].toString());
      params.append("maxMileage", mileageRange[1].toString());
    }

    // Fuel types
    if (fuelTypes.length > 0) {
      params.append("fuelTypes", fuelTypes.join(","));
    }

    // Transmission types
    if (transmissions.length > 0) {
      params.append("transmissions", transmissions.join(","));
    }

    // Body types
    if (bodyTypes.length > 0) {
      params.append("bodyTypes", bodyTypes.join(","));
    }

    // Seating options
    if (seatingOptions.length > 0) {
      params.append("seatingOptions", seatingOptions.join(","));
    }

    // Advanced filter brands
    if (brands.length > 0) {
      params.append("filterBrands", brands.join(","));
    }

    // Add search query if there are any search terms
    const query = buildSearchQuery();
    if (query.trim()) {
      params.append("q", query.trim());
    }

    return params;
  };

  // Enhanced API call to search cars with all filters
  const searchCars = async () => {
    setIsSearching(true);
    try {
      const filterParams = buildFilterParams();
      const query = buildSearchQuery();

      // Check if any filters are applied
      const hasAnyFilter =
        carType ||
        selectedCity ||
        selectedBudget ||
        selectedBrand ||
        fuelTypes.length > 0 ||
        transmissions.length > 0 ||
        bodyTypes.length > 0 ||
        seatingOptions.length > 0 ||
        brands.length > 0 ||
        priceRange[0] !== 5 || priceRange[1] !== 50 ||
        mileageRange[0] !== 10 || mileageRange[1] !== 30;

      // Choose the appropriate endpoint based on whether we have search terms
      let apiUrl = "";
      if (query.trim() || hasAnyFilter) {
        // Use search endpoint for text-based searches or any filters
        apiUrl = `/api/cars/search?${filterParams.toString()}`;
      } else {
        // Use general cars endpoint with filters
        apiUrl = `/api/cars?${filterParams.toString()}`;
      }

      console.log("🔍 Searching with URL:", apiUrl);
      console.log("📊 Applied filters:", {
        carType,
        selectedCity,
        selectedBudget,
        selectedBrand,
        priceRange,
        mileageRange,
        fuelTypes,
        transmissions,
        bodyTypes,
        seatingOptions,
        brands,
        searchQuery: query,
        hasAnyFilter,
      });
      console.log("🌐 Filter params string:", filterParams.toString());

      const response = await fetch(apiUrl);
      const result = await response.json();

      console.log("📥 API Response:", {
        success: result.success,
        dataLength: result.data ? result.data.length : 0,
        error: result.error,
        sampleData: result.data && result.data.length > 0 ? result.data.slice(0, 2) : null
      });

      if (result.success) {
        setSearchResults(result.data);

        // Navigate to cars page with comprehensive filter data
        navigate("/cars", {
          state: {
            searchResults: result.data,
            searchQuery: query,
            filters: {
              // Main filters
              carType,
              selectedCity,
              selectedBudget,
              selectedBrand,

              // Price and mileage ranges
              priceRange,
              mileageRange,

              // Advanced filters
              fuelTypes,
              transmissions,
              bodyTypes,
              seatingOptions,
              brands,

              // Additional metadata
              totalFiltersApplied: getActiveFiltersCount(),
              hasAdvancedFilters: showAdvanced,
            },
            searchMetadata: {
              timestamp: new Date().toISOString(),
              resultsCount: result.data.length,
              searchType: query.trim() ? "search" : "filter",
            },
          },
        });
      } else {
        console.error("Search failed:", result.error);
        // Still navigate but with empty results and error info
        navigate("/cars", {
          state: {
            searchResults: [],
            searchQuery: query,
            error: result.error,
            filters: {
              carType,
              selectedCity,
              selectedBudget,
              selectedBrand,
              priceRange,
              mileageRange,
              fuelTypes,
              transmissions,
              bodyTypes,
              seatingOptions,
              brands,
              totalFiltersApplied: getActiveFiltersCount(),
              hasAdvancedFilters: showAdvanced,
            },
          },
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      // Navigate with error state
      navigate("/cars", {
        state: {
          searchResults: [],
          error: "Failed to search cars. Please try again.",
          filters: {
            carType,
            selectedCity,
            selectedBudget,
            selectedBrand,
            priceRange,
            mileageRange,
            fuelTypes,
            transmissions,
            bodyTypes,
            seatingOptions,
            brands,
            totalFiltersApplied: getActiveFiltersCount(),
            hasAdvancedFilters: showAdvanced,
          },
        },
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    // Allow search even if only some filters are selected
    searchCars();
  };

  const handleEmiCalculator = () => {
    navigate("/emi-calculator");
  };

  return (
    <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Custom keyframe animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Custom slider styling for premium look */
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #06b6d4);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #06b6d4);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
      `}</style>
      {/* BMW car background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`,
        }}
      ></div>

      {/* Lighter premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700/80 via-blue-800/75 to-purple-800/80"></div>

      {/* Subtle floating elements for premium feel */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-full blur-2xl"></div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
          {/* Hero content with premium entrance animations */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="px-6 py-2 text-sm font-medium bg-white/10 backdrop-blur-sm border border-blue-300/30 text-blue-200 rounded-full shadow-lg opacity-0 translate-y-10 animate-[fadeInUp_1s_ease-out_0.2s_forwards]">
                <Zap className="w-4 h-4 mr-2 inline text-blue-400 animate-pulse" />
                India's #1 Car Marketplace
              </div>
            </div>

          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-200 max-w-2xl mx-auto leading-relaxed px-4 opacity-0 translate-y-8 animate-[fadeInUp_1s_ease-out_1.1s_forwards]">
            Discover, compare, and buy from thousands of verified cars with
            complete transparency and trust.
          </p>
        </div>

        {/* Search card placeholder */}
        <div className="p-4 bg-white/20">
          Placeholder
        </div>

        {/* Premium stats section with scroll-triggered counting animations */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mt-8 md:mt-16">
          <div className="text-center space-y-1 md:space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 opacity-0 translate-y-8 animate-[fadeInUp_0.8s_ease-out_1.8s_forwards]">
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              <AnimatedCounter end={stats.totalCars || 50000} suffix="+" delay={0} />
            </div>
            <div className="text-xs sm:text-sm text-slate-300">
              Car Models
            </div>
          </div>
          <div className="text-center space-y-1 md:space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 opacity-0 translate-y-8 animate-[fadeInUp_0.8s_ease-out_2.0s_forwards]">
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              <AnimatedCounter end={stats.totalBrands || 200} suffix="+" delay={200} />
            </div>
            <div className="text-xs sm:text-sm text-slate-300">Brands</div>
          </div>
          <div className="text-center space-y-1 md:space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 opacity-0 translate-y-8 animate-[fadeInUp_0.8s_ease-out_2.2s_forwards]">
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              <AnimatedCounter end={stats.totalCities || 100} suffix="+" delay={400} />
            </div>
            <div className="text-xs sm:text-sm text-slate-300">Cities</div>
          </div>
        </div>
      </div>
    </div>
  </section >
  );
};

export default HeroSection;
