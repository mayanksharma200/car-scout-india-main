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

const AnimatedCounter = ({ end, suffix = "", delay = 0 }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  // Intersection Observer to detect when element is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.5, // Trigger when 50% of the element is visible
        rootMargin: "0px 0px -100px 0px", // Start animation slightly before fully visible
      }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, [isVisible]);

  // Start counting after visibility is detected and delay
  useEffect(() => {
    if (!isVisible) return;

    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [isVisible, delay]);

  // Counting animation
  useEffect(() => {
    if (!hasStarted) return;

    const duration = 2000; // 2 seconds for counting animation
    const steps = 60; // 60 steps for smooth animation
    const increment = end / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const currentValue = Math.min(Math.round(increment * currentStep), end);
      setCount(currentValue);

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [hasStarted, end]);

  return (
    <span ref={counterRef}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState([5, 50]);
  const [mileageRange, setMileageRange] = useState([10, 30]);

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
  };

  const getActiveFiltersCount = () => {
    return (
      fuelTypes.length +
      transmissions.length +
      bodyTypes.length +
      seatingOptions.length +
      brands.length
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
    "Surat",
    "Jaipur",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Indore",
    "Thane",
    "Bhopal",
    "Visakhapatnam",
    "Pimpri-Chinchwad",
    "Patna",
    "Vadodara",
    "Ghaziabad",
    "Ludhiana",
    "Agra",
    "Nashik",
    "Faridabad",
    "Meerut",
    "Rajkot",
    "Kalyan-Dombivli",
    "Vasai-Virar",
    "Varanasi",
    "Srinagar",
    "Aurangabad",
    "Dhanbad",
    "Amritsar",
    "Navi Mumbai",
    "Allahabad",
    "Ranchi",
    "Howrah",
    "Coimbatore",
    "Jabalpur",
    "Gwalior",
    "Vijayawada",
    "Jodhpur",
    "Madurai",
    "Raipur",
    "Kota",
    "Guwahati",
    "Chandigarh",
    "Solapur",
    "Hubballi-Dharwad",
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

  const carBrands = [
    "Maruti Suzuki",
    "Hyundai",
    "Tata",
    "Mahindra",
    "Honda",
    "Toyota",
    "BMW",
    "Mercedes-Benz",
    "Audi",
    "Volkswagen",
    "Skoda",
    "Nissan",
    "Renault",
    "Ford",
    "Kia",
    "MG",
    "Jeep",
    "Volvo",
    "Jaguar",
    "Land Rover",
  ];

  const filterOptions = {
    fuelTypes: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"],
    transmissions: ["Manual", "Automatic", "CVT"],
    bodyTypes: ["Hatchback", "Sedan", "SUV", "Coupe", "Convertible"],
    seatingOptions: ["2", "4", "5", "7", "8+"],
    brands: [
      "Maruti",
      "Hyundai",
      "Tata",
      "Mahindra",
      "Honda",
      "Toyota",
      "BMW",
      "Mercedes",
      "Audi",
    ],
  };

  // Build search query based on selected filters
  const buildSearchQuery = () => {
    const searchTerms = [];

    if (selectedBrand) {
      searchTerms.push(selectedBrand);
    }

    if (carType === "new") {
      searchTerms.push("new");
    } else if (carType === "certified") {
      searchTerms.push("certified");
    } else if (carType === "premium") {
      searchTerms.push("premium");
    }

    // Add advanced filter brands
    if (brands.length > 0) {
      searchTerms.push(...brands);
    }

    // Add fuel types
    if (fuelTypes.length > 0) {
      searchTerms.push(...fuelTypes);
    }

    // Add body types
    if (bodyTypes.length > 0) {
      searchTerms.push(...bodyTypes);
    }

    return searchTerms.join(" ");
  };

  // Build filter parameters for API call
  const buildFilterParams = () => {
    const params = new URLSearchParams();

    // Add basic filters
    if (selectedBrand) {
      params.append("brand", selectedBrand);
    }

    // Add price range (convert from lakh to actual price)
    if (priceRange[0] > 5 || priceRange[1] < 50) {
      params.append("minPrice", (priceRange[0] * 100000).toString());
      params.append("maxPrice", (priceRange[1] * 100000).toString());
    }

    // Add advanced filters as query terms
    const query = buildSearchQuery();
    if (query.trim()) {
      params.append("q", query.trim());
    }

    return params;
  };

  // API call to search cars
  const searchCars = async () => {
    setIsSearching(true);
    try {
      const query = buildSearchQuery();
      const filterParams = buildFilterParams();

      let apiUrl = "";

      if (query.trim()) {
        // Use search endpoint if there's a search query
        apiUrl = `/api/cars/search?${filterParams.toString()}`;
      } else {
        // Use general cars endpoint with filters
        apiUrl = `/api/cars?${filterParams.toString()}`;
      }

      console.log("Searching with URL:", apiUrl);

      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.success) {
        setSearchResults(result.data);

        // Navigate to cars page with results
        navigate("/cars", {
          state: {
            searchResults: result.data,
            searchQuery: query,
            filters: {
              carType,
              selectedCity,
              selectedBudget,
              selectedBrand,
              fuelTypes,
              transmissions,
              bodyTypes,
              seatingOptions,
              brands,
              priceRange,
              mileageRange,
            },
          },
        });
      } else {
        console.error("Search failed:", result.error);
        // Still navigate but with empty results
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
              fuelTypes,
              transmissions,
              bodyTypes,
              seatingOptions,
              brands,
              priceRange,
              mileageRange,
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
            fuelTypes,
            transmissions,
            bodyTypes,
            seatingOptions,
            brands,
            priceRange,
            mileageRange,
          },
        },
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
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

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent opacity-0 translate-x-[-100px] animate-[slideInLeft_1.2s_ease-out_0.5s_forwards]">
                Find Your Perfect
              </span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent opacity-0 translate-x-[100px] animate-[slideInRight_1.2s_ease-out_0.8s_forwards]">
                Dream Car
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-200 max-w-2xl mx-auto leading-relaxed px-4 opacity-0 translate-y-8 animate-[fadeInUp_1s_ease-out_1.1s_forwards]">
              Discover, compare, and buy from thousands of verified cars with
              complete transparency and trust.
            </p>
          </div>

          {/* Search card */}
          <Card
            className="max-w-3xl mx-auto rounded-2xl overflow-hidden 
  opacity-0 translate-y-12 scale-95 animate-[fadeInScale_1.2s_ease-out_1.4s_forwards]
  transition-all duration-500
  bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg
  hover:bg-white/95 hover:backdrop-blur-2xl hover:shadow-2xl"
          >
            <CardContent className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
              {/* Quick filters */}
              <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
                <button
                  className={`px-3 py-2 md:px-4 cursor-pointer transition-colors text-xs md:text-sm rounded-md border ${
                    carType === "new"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-primary hover:text-primary-foreground"
                  }`}
                  onClick={() => setCarType(carType === "new" ? "" : "new")}
                >
                  <Car className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 inline" />
                  New Cars
                </button>
                <button
                  className={`px-3 py-2 md:px-4 cursor-pointer transition-colors text-xs md:text-sm rounded-md border ${
                    carType === "certified"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-primary hover:text-primary-foreground"
                  }`}
                  onClick={() =>
                    setCarType(carType === "certified" ? "" : "certified")
                  }
                >
                  <Shield className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 inline" />
                  Certified Used
                </button>
                <button
                  className={`px-3 py-2 md:px-4 cursor-pointer transition-colors text-xs md:text-sm rounded-md border ${
                    carType === "premium"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-primary hover:text-primary-foreground"
                  }`}
                  onClick={() =>
                    setCarType(carType === "premium" ? "" : "premium")
                  }
                >
                  <Award className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 inline" />
                  Premium Cars
                </button>
              </div>

              {/* Main search inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="relative">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="h-12 md:h-14 text-sm md:text-lg bg-background/80 border border-border/50 
          focus:border-primary w-full rounded-lg px-4 pl-12 appearance-none cursor-pointer 
          transition-all duration-300"
                  >
                    <option value="">Select City</option>
                    {indianCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                </div>

                <div className="relative">
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="h-12 md:h-14 text-sm md:text-lg bg-background/80 border border-border/50 
          focus:border-primary w-full rounded-lg px-4 pl-12 appearance-none cursor-pointer 
          transition-all duration-300"
                  >
                    <option value="">Budget Range</option>
                    {budgetRanges.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                  <IndianRupee className="w-4 h-4 md:w-5 md:h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                </div>

                <div className="relative">
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="h-12 md:h-14 text-sm md:text-lg bg-background/80 border border-border/50 
          focus:border-primary w-full rounded-lg px-4 pl-12 appearance-none cursor-pointer 
          transition-all duration-300"
                  >
                    <option value="">Select Brand</option>
                    {carBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                  <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Advanced filters */}
              <div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-primary hover:text-primary/80 font-medium flex items-center"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Advanced Filters
                    {getActiveFiltersCount() > 0 && (
                      <span className="ml-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                        {getActiveFiltersCount()}
                      </span>
                    )}
                  </button>

                  {getActiveFiltersCount() > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear All
                    </button>
                  )}
                </div>

                <div
                  className={`space-y-6 mt-6 ${
                    showAdvanced ? "block" : "hidden"
                  }`}
                >
                  {/* Sliders */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">
                        Price Range: ₹{priceRange[0]} - ₹{priceRange[1]} Lakh
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([
                            priceRange[0],
                            parseInt(e.target.value),
                          ])
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">
                        Mileage: {mileageRange[0]} - {mileageRange[1]} km/l
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="40"
                        value={mileageRange[1]}
                        onChange={(e) =>
                          setMileageRange([
                            mileageRange[0],
                            parseInt(e.target.value),
                          ])
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                    </div>
                  </div>

                  {/* Filter categories */}
                  <div className="space-y-4">
                    {Object.entries(filterOptions).map(([key, options]) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium text-foreground capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {options.map((option) => {
                            const isSelected = (() => {
                              switch (key) {
                                case "fuelTypes":
                                  return fuelTypes.includes(option);
                                case "transmissions":
                                  return transmissions.includes(option);
                                case "bodyTypes":
                                  return bodyTypes.includes(option);
                                case "seatingOptions":
                                  return seatingOptions.includes(option);
                                case "brands":
                                  return brands.includes(option);
                                default:
                                  return false;
                              }
                            })();

                            return (
                              <button
                                key={option}
                                className={`cursor-pointer transition-all hover:scale-105 px-3 py-1 rounded-md text-sm border ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background border-border hover:bg-primary hover:text-primary-foreground"
                                }`}
                                onClick={() => {
                                  switch (key) {
                                    case "fuelTypes":
                                      toggleFilter(
                                        option,
                                        fuelTypes,
                                        setFuelTypes
                                      );
                                      break;
                                    case "transmissions":
                                      toggleFilter(
                                        option,
                                        transmissions,
                                        setTransmissions
                                      );
                                      break;
                                    case "bodyTypes":
                                      toggleFilter(
                                        option,
                                        bodyTypes,
                                        setBodyTypes
                                      );
                                      break;
                                    case "seatingOptions":
                                      toggleFilter(
                                        option,
                                        seatingOptions,
                                        setSeatingOptions
                                      );
                                      break;
                                    case "brands":
                                      toggleFilter(option, brands, setBrands);
                                      break;
                                  }
                                }}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="flex-1 h-12 md:h-14 text-base md:text-lg font-semibold 
        bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white 
        rounded-xl shadow-lg hover:opacity-90 transition-all duration-300 
        group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 inline border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 inline" />
                      Search Cars
                    </>
                  )}
                </button>

                <button
                  onClick={handleEmiCalculator}
                  className="h-12 md:h-14 px-4 md:px-8 text-base md:text-lg font-medium 
        bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl 
        shadow-lg hover:shadow-2xl border-2 border-orange-400/50 hover:border-orange-300 
        transition-all duration-500 transform hover:scale-110 hover:rotate-1 
        relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-orange-300/30 to-red-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                  <div
                    className="absolute bottom-2 left-2 w-1 h-1 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <span className="relative z-10">EMI Calculator</span>
                  <div className="absolute inset-0 rounded-xl border-2 border-white/30 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-700"></div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Premium stats section with scroll-triggered counting animations */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mt-8 md:mt-16">
            <div className="text-center space-y-1 md:space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 opacity-0 translate-y-8 animate-[fadeInUp_0.8s_ease-out_1.8s_forwards]">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                <AnimatedCounter end={50000} suffix="+" delay={0} />
              </div>
              <div className="text-xs sm:text-sm text-slate-300">
                Car Models
              </div>
            </div>
            <div className="text-center space-y-1 md:space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 opacity-0 translate-y-8 animate-[fadeInUp_0.8s_ease-out_2.0s_forwards]">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                <AnimatedCounter end={200} suffix="+" delay={200} />
              </div>
              <div className="text-xs sm:text-sm text-slate-300">Brands</div>
            </div>
            <div className="text-center space-y-1 md:space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 opacity-0 translate-y-8 animate-[fadeInUp_0.8s_ease-out_2.2s_forwards]">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                <AnimatedCounter end={100} suffix="+" delay={400} />
              </div>
              <div className="text-xs sm:text-sm text-slate-300">Cities</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
