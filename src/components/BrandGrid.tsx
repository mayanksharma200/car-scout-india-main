import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Import brand logos
import marutiLogo from "@/assets/brands/maruti-suzuki-logo.png";
import hyundaiLogo from "@/assets/brands/hyundai-logo.png";
import tataLogo from "@/assets/brands/tata-logo.png";
import mahindraLogo from "@/assets/brands/mahindra-logo.png";
import kiaLogo from "@/assets/brands/kia-logo.png";
import hondaLogo from "@/assets/brands/honda-logo.png";
import toyotaLogo from "@/assets/brands/toyota-logo.png";
import renaultLogo from "@/assets/brands/renault-logo.png";
import audiLogo from "@/assets/brands/audi-logo.png";
import bmwLogo from "@/assets/brands/bmw-logo.png";
import mgLogo from "@/assets/brands/mg-logo.png";
import nissanLogo from "@/assets/brands/nissan-logo.png";
import skodaLogo from "@/assets/brands/skoda-logo.png";
import volkswagenLogo from "@/assets/brands/volkswagen-logo.png";
import chevroletLogo from "@/assets/brands/cherverolet-logo.png";

const allBrands = [
  {
    name: "Maruti Suzuki",
    logo: marutiLogo,
    models: "15+ Models",
    rating: 4.5,
    popular: true,
  },
  {
    name: "Hyundai",
    logo: hyundaiLogo,
    models: "12+ Models",
    rating: 4.4,
    popular: true,
  },
  {
    name: "Tata",
    logo: tataLogo,
    models: "10+ Models",
    rating: 4.3,
    popular: false,
  },
  {
    name: "Mahindra",
    logo: mahindraLogo,
    models: "8+ Models",
    rating: 4.2,
    popular: false,
  },
  {
    name: "Kia",
    logo: kiaLogo,
    models: "6+ Models",
    rating: 4.6,
    popular: false,
  },
  {
    name: "Honda",
    logo: hondaLogo,
    models: "7+ Models",
    rating: 4.5,
    popular: true,
  },
  {
    name: "Toyota",
    logo: toyotaLogo,
    models: "9+ Models",
    rating: 4.7,
    popular: true,
  },
  {
    name: "Renault",
    logo: renaultLogo,
    models: "5+ Models",
    rating: 4.1,
    popular: false,
  },
  // Additional brands
  {
    name: "Audi",
    logo: audiLogo,
    models: "8+ Models",
    rating: 4.8,
    popular: true,
  },
  {
    name: "BMW",
    logo: bmwLogo,
    models: "10+ Models",
    rating: 4.7,
    popular: true,
  },
  {
    name: "MG",
    logo: mgLogo,
    models: "4+ Models",
    rating: 4.3,
    popular: false,
  },
  {
    name: "Nissan",
    logo: nissanLogo,
    models: "6+ Models",
    rating: 4.2,
    popular: false,
  },
  {
    name: "Skoda",
    logo: skodaLogo,
    models: "7+ Models",
    rating: 4.4,
    popular: false,
  },
  {
    name: "Volkswagen",
    logo: volkswagenLogo,
    models: "5+ Models",
    rating: 4.5,
    popular: false,
  },
  {
    name: "Chevrolet",
    logo: chevroletLogo,
    models: "5+ Models",
    rating: 4.2,
    popular: false,
  },
];

const BrandGrid = () => {
  const navigate = useNavigate();
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrandCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('brand')
          .eq('status', 'active');

        if (error) {
          console.error('Error fetching brands:', error);
          return;
        }

        // Count cars per brand
        const counts: Record<string, number> = {};
        data.forEach(item => {
          const brand = item.brand;
          counts[brand] = (counts[brand] || 0) + 1;
        });

        console.log('Brand counts from DB:', counts);
        setBrandCounts(counts);
      } catch (err) {
        console.error('Failed to fetch brands:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandCounts();
  }, []);

  // Filter allBrands to only include those present in brandCounts
  // We compare case-insensitively to be safe
  const filteredBrands = allBrands
    .filter(brand =>
      Object.keys(brandCounts).some(available =>
        available.toLowerCase() === brand.name.toLowerCase()
      )
    )
    .map(brand => {
      // Find the matching brand name from database (case-insensitive)
      const dbBrandName = Object.keys(brandCounts).find(
        available => available.toLowerCase() === brand.name.toLowerCase()
      );
      const count = dbBrandName ? brandCounts[dbBrandName] : 0;

      return {
        ...brand,
        models: `${count} Model${count !== 1 ? 's' : ''}`,
        count // Store the count for potential sorting
      };
    });

  // Show first 8 brands initially, all brands when expanded
  const brandsToShow = showAllBrands ? filteredBrands : filteredBrands.slice(0, 8);
  const hasMoreBrands = filteredBrands.length > 8;

  const handleBrandClick = (brandName: string) => {
    // Format brand name: First letter capital, rest lowercase (e.g., "BMW" -> "Bmw")
    // Handles multi-word brands like "Maruti Suzuki" -> "Maruti Suzuki"
    const formattedBrand = brandName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    navigate(`/cars?brand=${encodeURIComponent(formattedBrand)}`);
  };

  const handleToggleBrands = () => {
    setShowAllBrands(!showAllBrands);
  };


  // Dynamic grid columns based on number of items
  const getGridClassName = (count: number) => {
    if (count === 1) return "grid-cols-1 max-w-sm mx-auto";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto";
    if (count === 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto";
    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Animated background with glass morphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/2 to-accent/3">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,107,107,0.05),transparent_50%)]"></div>
      </div>

      {/* Floating animated elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-l from-accent/10 to-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-[pulse_3s_ease-in-out_infinite_1.5s]"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Ultra-modern header with staggered animations */}
        <div className="text-center mb-20 space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-background/80 backdrop-blur-xl border border-border/50 rounded-full px-6 py-3 shadow-lg">
            <Star className="w-5 h-5 text-primary animate-[spin_3s_linear_infinite]" />
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Premium Automotive Brands
            </span>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight animate-scale-in">
            Explore Cars by
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Brand
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed opacity-80">
            Discover exceptional vehicles from India's most prestigious
            automotive manufacturers. Experience luxury, performance, and
            innovation across our curated brand portfolio.
          </p>
        </div>

        {/* Ultra-modern brand grid with dynamic columns */}
        <div className={`grid ${getGridClassName(brandsToShow.length)} gap-4 sm:gap-6 md:gap-8 mb-16`}>
          {brandsToShow.map((brand, index) => (
            <div
              key={brand.name}
              className="group relative animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card
                className="relative overflow-hidden border-0 bg-background/40 backdrop-blur-xl hover:bg-background/60 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-3 cursor-pointer"
                onClick={() => handleBrandClick(brand.name)}
              >
                {/* Animated border gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-[1px] bg-background/90 backdrop-blur-xl rounded-lg"></div>

                {/* Popular badge with glow effect */}
                {brand.popular && (
                  <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-gradient-to-r from-accent to-primary text-white border-0 shadow-lg shadow-accent/30 animate-pulse">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Popular
                    </Badge>
                  </div>
                )}

                <CardContent className="relative z-10 p-6 sm:p-8 md:p-10 text-center">
                  {/* Enhanced logo container with bigger size */}
                  <div className="relative mb-6 sm:mb-8 md:mb-10">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 mx-auto">
                      {/* Animated ring */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-[spin_8s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Logo container with bigger padding */}
                      <div className="relative w-full h-full bg-background/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl flex items-center justify-center p-4 sm:p-6 md:p-8 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <img
                          src={brand.logo}
                          alt={`${brand.name} logo`}
                          className="w-full h-full object-contain filter group-hover:brightness-110 transition-all duration-500"
                        />
                      </div>

                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                    </div>
                  </div>

                  {/* Enhanced brand info */}
                  <div className="space-y-3 sm:space-y-4 md:space-y-5">
                    <h3 className="font-bold text-base sm:text-lg md:text-2xl text-foreground group-hover:text-primary transition-all duration-300 group-hover:scale-105">
                      {brand.name}
                    </h3>

                    {/* Animated rating */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${i < Math.floor(brand.rating)
                              ? "text-yellow-400 fill-yellow-400 scale-100"
                              : "text-muted-foreground scale-75"
                              }`}
                            style={{
                              animationDelay: `${i * 0.1}s`,
                              animation:
                                brand.rating > i
                                  ? "scale-in 0.3s ease-out"
                                  : "none",
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-sm sm:text-base font-bold text-foreground">
                        {brand.rating}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <p className="text-sm sm:text-base font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {brand.models}
                      </p>
                    </div>
                  </div>

                  {/* Hover particle effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary rounded-full animate-ping"></div>
                    <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-accent rounded-full animate-ping delay-300"></div>
                    <div className="absolute bottom-1/4 left-3/4 w-1 h-1 bg-primary rounded-full animate-ping delay-700"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Show More/Less Brands Button with Ultra-modern styling */}
        {hasMoreBrands && (
          <div
            className="text-center animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            <button
              onClick={handleToggleBrands}
              className="group relative inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-primary to-accent text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg overflow-hidden shadow-2xl shadow-primary/25 hover:shadow-3xl hover:shadow-primary/40 transition-all duration-500 hover:scale-105"
              style={{ backgroundSize: "200% 200%" }}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>

              <span className="relative z-10">
                {showAllBrands
                  ? "Show Less Brands"
                  : `Show More Brands (${filteredBrands.length - 8} more)`}
              </span>
              {showAllBrands ? (
                <ChevronUp className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:-translate-y-1 transition-transform duration-300" />
              ) : (
                <ChevronDown className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:translate-y-1 transition-transform duration-300" />
              )}

              {/* Floating dots */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/30 rounded-full animate-ping"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/20 rounded-full animate-ping delay-500"></div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BrandGrid;
