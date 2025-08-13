import { useState, useEffect } from "react";
import CarCard from "./CarCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const FeaturedCars = () => {
  const [featuredCars, setFeaturedCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedCars();
  }, []);

  const loadFeaturedCars = async () => {
    try {
      const { data: cars, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(4);

      console.log('Raw cars from database:', cars);
      
      if (error) {
        console.error('Error loading cars:', error);
        // Fallback to mock data if database is empty
        setFeaturedCars(getMockCars());
      } else if (cars && cars.length > 0) {
        // Transform database cars to match CarCard interface
        const transformedCars = cars.map(car => ({
          id: car.id,
          brand: car.brand,
          model: car.model,
          variant: car.variant || "",
          price: car.price_min || 0,
          onRoadPrice: car.price_max || car.price_min || 0,
          fuelType: car.fuel_type || "Petrol",
          transmission: car.transmission || "Manual",
          mileage: parseFloat(car.mileage?.toString().replace(/[^\d.]/g, '') || '0'),
          seating: car.seating_capacity || 5,
          rating: 4.2 + Math.random() * 0.8, // Mock rating for now
          image: Array.isArray(car.images) && car.images.length > 0 ? 
            (typeof car.images[0] === 'string' ? car.images[0] : "/placeholder.svg") : "/placeholder.svg",
          isPopular: Math.random() > 0.5,
          isBestSeller: Math.random() > 0.7
        }));
        console.log('Transformed cars:', transformedCars);
        setFeaturedCars(transformedCars);
      } else {
        // No cars in database, use mock data
        setFeaturedCars(getMockCars());
      }
    } catch (error) {
      console.error('Error in loadFeaturedCars:', error);
      setFeaturedCars(getMockCars());
    } finally {
      setLoading(false);
    }
  };

  const getMockCars = () => [
    {
      id: "1",
      brand: "Maruti Suzuki",
      model: "Swift",
      variant: "ZXI+ AMT",
      price: 849000,
      onRoadPrice: 967000,
      fuelType: "Petrol",
      transmission: "AMT",
      mileage: 23.2,
      seating: 5,
      rating: 4.2,
      image: "/placeholder.svg",
      isPopular: true
    },
    {
      id: "2",
      brand: "Hyundai",
      model: "Creta",
      variant: "SX(O) Turbo DCT",
      price: 1999000,
      onRoadPrice: 2234000,
      fuelType: "Petrol",
      transmission: "DCT",
      mileage: 16.8,
      seating: 5,
      rating: 4.4,
      image: "/placeholder.svg",
      isBestSeller: true
    },
    {
      id: "3",
      brand: "Tata",
      model: "Nexon",
      variant: "XZ+ Dark Edition",
      price: 1449000,
      onRoadPrice: 1625000,
      fuelType: "Petrol",
      transmission: "AMT",
      mileage: 17.4,
      seating: 5,
      rating: 4.5,
      image: "/placeholder.svg",
      isPopular: true
    },
    {
      id: "4",
      brand: "Mahindra",
      model: "XUV700",
      variant: "AX7 Diesel AT",
      price: 2399000,
      onRoadPrice: 2687000,
      fuelType: "Diesel",
      transmission: "AT",
      mileage: 15.0,
      seating: 7,
      rating: 4.6,
      image: "/placeholder.svg",
      isBestSeller: true
    }
  ];

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
              Hand-picked selections based on customer reviews, sales data, and expert ratings.
            </p>
          </div>
          <Link to="/cars">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground hidden lg:block">
              View All Cars
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-card rounded-lg border border-border p-4 animate-pulse">
                <div className="h-40 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))
          ) : (
            featuredCars.map((car, index) => (
              <div key={car.id} className="animate-fade-in hover-scale" style={{ animationDelay: `${index * 0.1}s` }}>
                <CarCard car={car} />
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-8 lg:hidden">
          <Link to="/cars">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              View All Cars
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;