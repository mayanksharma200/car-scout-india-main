import { useState } from "react";
import AnimatedCounter from "./AnimatedCounter";
import { Search, SlidersHorizontal, MapPin, IndianRupee, Fuel, Car, Users, X, Zap, Shield, Award, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import heroCarImage from "@/assets/hero-car.jpg";

const HeroSection = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState([5, 50]);
  const [mileageRange, setMileageRange] = useState([10, 30]);
  
  // Main search states
  const [carType, setCarType] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedBudget, setSelectedBudget] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  
  // Filter states
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [bodyTypes, setBodyTypes] = useState<string[]>([]);
  const [seatingOptions, setSeatingOptions] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  const toggleFilter = (value: string, currentArray: string[], setter: (arr: string[]) => void) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
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
    return fuelTypes.length + transmissions.length + bodyTypes.length + seatingOptions.length + brands.length;
  };

  // Data options
  const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
    'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi',
    'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur',
    'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubballi-Dharwad'
  ];

  const budgetRanges = [
    'Under ₹5 Lakh', '₹5-10 Lakh', '₹10-15 Lakh', '₹15-20 Lakh', 
    '₹20-30 Lakh', '₹30-50 Lakh', '₹50 Lakh - ₹1 Crore', 'Above ₹1 Crore'
  ];

  const carBrands = [
    'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota', 'BMW', 'Mercedes-Benz', 'Audi',
    'Volkswagen', 'Skoda', 'Nissan', 'Renault', 'Ford', 'Kia', 'MG', 'Jeep', 'Volvo', 'Jaguar', 'Land Rover'
  ];

  const filterOptions = {
    fuelTypes: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
    transmissions: ['Manual', 'Automatic', 'CVT'],
    bodyTypes: ['Hatchback', 'Sedan', 'SUV', 'Coupe', 'Convertible'],
    seatingOptions: ['2', '4', '5', '7', '8+'],
    brands: ['Maruti', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota', 'BMW', 'Mercedes', 'Audi']
  };

  return (
    <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background with modern gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/10"></div>
      
      {/* Hero image with modern blur effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroCarImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80"></div>
      </div>

      {/* Floating elements for visual interest */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-primary/5 rounded-full blur-2xl animate-bounce-gentle"></div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 animate-fade-in">
          
          {/* Modern hero text */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <Badge variant="secondary" className="px-6 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                <Zap className="w-4 h-4 mr-2" />
                India's #1 Car Marketplace
              </Badge>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight animate-slide-up">
              Find Your Perfect
              <span className="block text-primary animate-slide-right" style={{ animationDelay: '0.2s' }}>Dream Car</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Discover, compare, and buy from thousands of verified cars with complete transparency and trust.
            </p>
          </div>

          {/* Modern search card with glass morphism effect */}
          <Card className="bg-background/80 backdrop-blur-xl border-border/50 shadow-2xl max-w-3xl mx-auto animate-scale-in hover-scale">
            <CardContent className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
              
              {/* Quick filters */}
              <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
                <Badge 
                  variant={carType === "new" ? "default" : "outline"} 
                  className="px-3 py-2 md:px-4 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs md:text-sm"
                  onClick={() => setCarType(carType === "new" ? "" : "new")}
                >
                  <Car className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  New Cars
                </Badge>
                <Badge 
                  variant={carType === "certified" ? "default" : "outline"} 
                  className="px-3 py-2 md:px-4 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs md:text-sm"
                  onClick={() => setCarType(carType === "certified" ? "" : "certified")}
                >
                  <Shield className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Certified Used
                </Badge>
                <Badge 
                  variant={carType === "premium" ? "default" : "outline"} 
                  className="px-3 py-2 md:px-4 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs md:text-sm"
                  onClick={() => setCarType(carType === "premium" ? "" : "premium")}
                >
                  <Award className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Premium Cars
                </Badge>
              </div>

              {/* Main search inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="relative">
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="h-12 md:h-14 text-sm md:text-lg bg-background/80 border-border/50 focus:border-primary">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-muted-foreground" />
                        <SelectValue placeholder="Select City" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-sm border-border z-50">
                      {indianCities.map((city) => (
                        <SelectItem key={city} value={city} className="text-sm md:text-lg">
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="relative">
                  <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                    <SelectTrigger className="h-12 md:h-14 text-sm md:text-lg bg-background/80 border-border/50 focus:border-primary">
                      <div className="flex items-center">
                        <IndianRupee className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-muted-foreground" />
                        <SelectValue placeholder="Budget Range" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-sm border-border z-50">
                      {budgetRanges.map((range) => (
                        <SelectItem key={range} value={range} className="text-sm md:text-lg">
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="relative">
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger className="h-12 md:h-14 text-sm md:text-lg bg-background/80 border-border/50 focus:border-primary">
                      <div className="flex items-center">
                        <Search className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-muted-foreground" />
                        <SelectValue placeholder="Select Brand" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-sm border-border z-50">
                      {carBrands.map((brand) => (
                        <SelectItem key={brand} value={brand} className="text-sm md:text-lg">
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced filters */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="text-primary hover:text-primary/80">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Advanced Filters
                      {getActiveFiltersCount() > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                          {getActiveFiltersCount()}
                        </Badge>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  {getActiveFiltersCount() > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>

                <CollapsibleContent className="space-y-6 mt-6">
                  {/* Price and Mileage Sliders */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">
                        Price Range: ₹{priceRange[0]} - ₹{priceRange[1]} Lakh
                      </label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={1}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">
                        Mileage: {mileageRange[0]} - {mileageRange[1]} km/l
                      </label>
                      <Slider
                        value={mileageRange}
                        onValueChange={setMileageRange}
                        min={5}
                        max={40}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Filter categories */}
                  <div className="space-y-4">
                    {Object.entries(filterOptions).map(([key, options]) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium text-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {options.map((option) => {
                            const isSelected = (() => {
                              switch(key) {
                                case 'fuelTypes': return fuelTypes.includes(option);
                                case 'transmissions': return transmissions.includes(option);
                                case 'bodyTypes': return bodyTypes.includes(option);
                                case 'seatingOptions': return seatingOptions.includes(option);
                                case 'brands': return brands.includes(option);
                                default: return false;
                              }
                            })();
                            
                            return (
                              <Badge
                                key={option}
                                variant={isSelected ? "default" : "outline"}
                                className="cursor-pointer transition-all hover:scale-105"
                                onClick={() => {
                                  switch(key) {
                                    case 'fuelTypes': toggleFilter(option, fuelTypes, setFuelTypes); break;
                                    case 'transmissions': toggleFilter(option, transmissions, setTransmissions); break;
                                    case 'bodyTypes': toggleFilter(option, bodyTypes, setBodyTypes); break;
                                    case 'seatingOptions': toggleFilter(option, seatingOptions, setSeatingOptions); break;
                                    case 'brands': toggleFilter(option, brands, setBrands); break;
                                  }
                                }}
                              >
                                {option}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Link to="/cars" className="flex-1">
                  <Button className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-lg group animate-pulse-glow relative overflow-hidden">
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 animate-shimmer"></div>
                    <Search className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                    Search Cars
                  </Button>
                </Link>
                
                <Link to="/emi-calculator">
                  <Button variant="outline" className="h-12 md:h-14 px-4 md:px-8 text-base md:text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    EMI Calculator
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced stats section */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mt-8 md:mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="text-center space-y-1 md:space-y-2">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
                <AnimatedCounter end={50000} suffix="+" />
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Car Models</div>
            </div>
            <div className="text-center space-y-1 md:space-y-2">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
                <AnimatedCounter end={200} suffix="+" />
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Brands</div>
            </div>
            <div className="text-center space-y-1 md:space-y-2">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
                <AnimatedCounter end={100} suffix="+" />
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Cities</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;