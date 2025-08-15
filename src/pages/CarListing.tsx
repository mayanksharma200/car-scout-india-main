import { useState, useEffect } from "react";
import { Search, Filter, Grid, List, MapPin, IndianRupee, X, Calendar, Palette, Car as CarIcon, Zap, Upload } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import { carAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const CarListing = () => {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingImages, setUpdatingImages] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    priceRange: [0, 5000000],
    brands: [] as string[],
    fuelTypes: [] as string[],
    transmissions: [] as string[],
    bodyTypes: [] as string[],
    colors: [] as string[],
    yearRange: [2020, 2025],
    seating: [] as string[],
    features: [] as string[]
  });

  useEffect(() => {
    loadCarsFromDB();
  }, []);

  useEffect(() => {
    // Handle URL brand parameter
    const brandParam = searchParams.get('brand');
    if (brandParam) {
      setFilters(prev => ({
        ...prev,
        brands: [brandParam]
      }));
    }
  }, [searchParams]);

  const loadCarsFromDB = async () => {
    try {
      console.log('Loading cars from database...');
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'active')
        .order('brand', { ascending: true });

      if (error) {
        console.error('Error loading cars:', error);
        return;
      }

      console.log('Raw cars from database:', data);
      
      // Transform database cars to match existing interface
      const transformedCars = data.map(car => {
        // Get the first image from the images array, or use placeholder
        let carImage = "/placeholder.svg";
        if (Array.isArray(car.images) && car.images.length > 0 && car.images[0] !== "/placeholder.svg") {
          carImage = car.images[0] as string;
        }

        return {
          ...car,
          price: car.price_min,
          onRoadPrice: car.price_max,
          fuelType: car.fuel_type,
          bodyType: car.body_type,
          seating: car.seating_capacity,
          rating: 4.2 + Math.random() * 0.8,
          image: carImage,
          color: "Pearl White",
          year: 2024,
          features: car.features || [],
          mileage: parseFloat(car.mileage?.toString()?.replace(/[^\d.]/g, '') || '15'),
          isPopular: Math.random() > 0.7,
          isBestSeller: Math.random() > 0.8
        };
      });

      console.log('Transformed cars:', transformedCars);
      setCars(transformedCars);
    } catch (error) {
      console.error('Error loading cars from DB:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCarImages = async () => {
    setUpdatingImages(true);
    try {
      toast({
        title: "Updating Car Images...",
        description: "Adding real car images to database",
      });

      const { data, error } = await supabase.functions.invoke('update-car-images');

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: `Updated images for ${data.updatedCount} car models!`,
      });

      // Refresh the car data to show updated images
      loadCarsFromDB();

    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update car images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingImages(false);
    }
  };

  const handleFilterChange = (filterType: string, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked 
        ? [...(prev[filterType as keyof typeof prev] as string[]), value]
        : (prev[filterType as keyof typeof prev] as string[]).filter(item => item !== value)
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
      features: []
    });
  };

  const getActiveFiltersCount = () => {
    return filters.brands.length + 
           filters.fuelTypes.length + 
           filters.transmissions.length + 
           filters.bodyTypes.length + 
           filters.colors.length + 
           filters.seating.length + 
           filters.features.length;
  };

  // Filter and sort cars based on search query, filters, and sort option
  const getFilteredAndSortedCars = () => {
    let filteredCars = cars.filter(car => {
      // Search query filter
      const searchMatch = searchQuery === "" || 
        car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.variant.toLowerCase().includes(searchQuery.toLowerCase());

      // Price range filter
      const priceMatch = car.price >= filters.priceRange[0] && car.price <= filters.priceRange[1];

      // Brand filter
      const brandMatch = filters.brands.length === 0 || filters.brands.includes(car.brand);

      // Fuel type filter
      const fuelMatch = filters.fuelTypes.length === 0 || filters.fuelTypes.includes(car.fuelType);

      // Transmission filter
      const transmissionMatch = filters.transmissions.length === 0 || filters.transmissions.includes(car.transmission);

      // Body type filter
      const bodyTypeMatch = filters.bodyTypes.length === 0 || filters.bodyTypes.includes(car.bodyType);

      // Color filter
      const colorMatch = filters.colors.length === 0 || filters.colors.includes(car.color);

      // Year filter
      const yearMatch = car.year >= filters.yearRange[0] && car.year <= filters.yearRange[1];

      // Seating filter
      const seatingMatch = filters.seating.length === 0 || filters.seating.includes(car.seating.toString());

      // Features filter
      const featuresMatch = filters.features.length === 0 || 
        filters.features.every(feature => car.features.includes(feature));

      return searchMatch && priceMatch && brandMatch && fuelMatch && 
             transmissionMatch && bodyTypeMatch && colorMatch && 
             yearMatch && seatingMatch && featuresMatch;
    });

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
        // Sort by popular/bestseller first, then by rating
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

  // Filter options extracted from database data
  const brands = [...new Set(cars.map(car => car.brand))].sort();
  const bodyTypes = [...new Set(cars.map(car => car.bodyType).filter(Boolean))].sort();
  const fuelTypes = [...new Set(cars.map(car => car.fuelType).filter(Boolean))].sort();
  const transmissions = [...new Set(cars.map(car => car.transmission).filter(Boolean))].sort();
  const colors = ["Pearl White", "Metallic Blue", "Midnight Black", "Silver", "Red", "Grey", "Brown"];
  const seatingOptions = ["2", "4", "5", "7", "8"];
  const popularFeatures = ["Power Steering", "Air Conditioning", "Power Windows", "Central Locking", "ABS", "Airbags", "Bluetooth", "USB Port"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Search & Filter Bar */}
      <div className="bg-muted/30 py-4 sm:py-6">
        <div className="container mx-auto px-4">
          {/* Mobile-first layout */}
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
                  className={`text-xs sm:text-sm ${getActiveFiltersCount() > 0 ? "border-primary bg-primary/10" : ""}`}
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
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
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
              {filters.brands.map(brand => (
                <Badge key={brand} variant="secondary" className="cursor-pointer" onClick={() => handleFilterChange('brands', brand, false)}>
                  {brand} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {filters.fuelTypes.map(fuel => (
                <Badge key={fuel} variant="secondary" className="cursor-pointer" onClick={() => handleFilterChange('fuelTypes', fuel, false)}>
                  {fuel} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {filters.bodyTypes.map(type => (
                <Badge key={type} variant="secondary" className="cursor-pointer" onClick={() => handleFilterChange('bodyTypes', type, false)}>
                  {type} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {filters.colors.map(color => (
                <Badge key={color} variant="secondary" className="cursor-pointer" onClick={() => handleFilterChange('colors', color, false)}>
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
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 space-y-6`}>
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
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
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
                          onCheckedChange={(checked) => handleFilterChange('brands', brand, checked as boolean)}
                        />
                        <label htmlFor={brand} className="text-sm cursor-pointer">{brand}</label>
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
                          onCheckedChange={(checked) => handleFilterChange('bodyTypes', type, checked as boolean)}
                        />
                        <label htmlFor={type} className="text-sm cursor-pointer">{type}</label>
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
                          onCheckedChange={(checked) => handleFilterChange('fuelTypes', fuel, checked as boolean)}
                        />
                        <label htmlFor={fuel} className="text-sm cursor-pointer">{fuel}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transmission */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Transmission</h4>
                  <div className="space-y-2">
                    {transmissions.map((trans) => (
                      <div key={trans} className="flex items-center space-x-2">
                        <Checkbox 
                          id={trans} 
                          checked={filters.transmissions.includes(trans)}
                          onCheckedChange={(checked) => handleFilterChange('transmissions', trans, checked as boolean)}
                        />
                        <label htmlFor={trans} className="text-sm cursor-pointer">{trans}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Color
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {colors.map((color) => (
                      <div key={color} className="flex items-center space-x-2">
                        <Checkbox 
                          id={color} 
                          checked={filters.colors.includes(color)}
                          onCheckedChange={(checked) => handleFilterChange('colors', color, checked as boolean)}
                        />
                        <label htmlFor={color} className="text-sm cursor-pointer">{color}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Year Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Model Year
                  </h4>
                  <Slider
                    value={filters.yearRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, yearRange: value }))}
                    max={2025}
                    min={2015}
                    step={1}
                    className="w-full mb-3"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{filters.yearRange[0]}</span>
                    <span>{filters.yearRange[1]}</span>
                  </div>
                </div>

                {/* Seating */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Seating Capacity</h4>
                  <div className="flex flex-wrap gap-2">
                    {seatingOptions.map((seats) => (
                      <Button
                        key={seats}
                        variant={filters.seating.includes(seats) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('seating', seats, !filters.seating.includes(seats))}
                        className="text-xs"
                      >
                        {seats} Seater
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Key Features</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {popularFeatures.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox 
                          id={feature} 
                          checked={filters.features.includes(feature)}
                          onCheckedChange={(checked) => handleFilterChange('features', feature, checked as boolean)}
                        />
                        <label htmlFor={feature} className="text-sm cursor-pointer">{feature}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Car Listings */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">New Cars ({filteredAndSortedCars.length} Results)</h1>
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

            {filteredAndSortedCars.length === 0 ? (
              <div className="text-center py-12">
                <CarIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No cars found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
                <Button onClick={clearAllFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {filteredAndSortedCars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Load More Cars
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarListing;
