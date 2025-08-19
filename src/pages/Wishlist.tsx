import { useState } from "react";
import { Heart, Trash2, Share2, Calculator, GitCompare } from "lucide-react";
import Header from "@/components/Header";
import CarCard from "@/components/CarCard";
import ShareModal from "@/components/ShareModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";


const Wishlist = () => {
  const [savedCars, setSavedCars] = useState([
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
      savedDate: "2025-01-20",
      priceAlert: true
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
      savedDate: "2025-01-18",
      priceAlert: false
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
      savedDate: "2025-01-15",
      priceAlert: true
    }
  ]);

  const [selectedCars, setSelectedCars] = useState<string[]>([]);

  const handleRemoveCar = (carId: string) => {
    setSavedCars(prev => prev.filter(car => car.id !== carId));
  };

  const handleSelectCar = (carId: string) => {
    setSelectedCars(prev => 
      prev.includes(carId) 
        ? prev.filter(id => id !== carId)
        : [...prev, carId]
    );
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} Lakh`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Wishlist
            </h1>
            <p className="text-muted-foreground">
              {savedCars.length} cars saved • Keep track of your favorite cars
            </p>
          </div>

          {/* Bulk Actions */}
          {selectedCars.length > 0 && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {selectedCars.length} selected
              </Badge>
              <div className="flex gap-2">
                <Link to="/compare">
                  <Button variant="outline" size="sm">
                    <GitCompare className="w-4 h-4 mr-2" />
                    Compare
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    setSavedCars(prev => prev.filter(car => !selectedCars.includes(car.id)));
                    setSelectedCars([]);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </div>

        {savedCars.length === 0 ? (
          // Empty State
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start browsing cars and save your favorites to keep track of them easily.
              </p>
              <Link to="/cars">
                <Button className="bg-gradient-primary hover:opacity-90">
                  Browse Cars
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <h3 className="font-medium">Quick Actions:</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <GitCompare className="w-4 h-4 mr-2" />
                        Compare All
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate EMI
                      </Button>
                      <ShareModal
                        title="My Car Wishlist"
                        description={`Check out my saved cars on AutoScope India - ${savedCars.length} cars including ${savedCars.map(car => `${car.brand} ${car.model}`).join(', ')}`}
                        url="/wishlist"
                      >
                        <Button variant="outline" size="sm">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Wishlist
                        </Button>
                      </ShareModal>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Price alerts active: {savedCars.filter(car => car.priceAlert).length} cars
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saved Cars Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCars.map((car) => (
                <div key={car.id} className="relative">
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 right-3 z-10">
                    <input
                      type="checkbox"
                      checked={selectedCars.includes(car.id)}
                      onChange={() => handleSelectCar(car.id)}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                    />
                  </div>

                  {/* Car Card */}
                  <Card className="group hover:shadow-auto-lg transition-all duration-300 hover:-translate-y-1 border-border overflow-hidden bg-gradient-card">
                    <div className="relative">
                      {/* Saved Date Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <Badge variant="secondary" className="text-xs">
                          Saved {formatDate(car.savedDate)}
                        </Badge>
                      </div>

                      {/* Price Alert Badge */}
                      {car.priceAlert && (
                        <div className="absolute top-10 left-3 z-10">
                          <Badge className="bg-success text-success-foreground text-xs">
                            Price Alert ON
                          </Badge>
                        </div>
                      )}

                      {/* Remove Button */}
                      <div className="absolute top-3 right-10 z-10">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-8 h-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveCar(car.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Car Image */}
                      <div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                        <img 
                          src={car.image} 
                          alt={`${car.brand} ${car.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Car Details */}
                      <div className="mb-3">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {car.brand} {car.model}
                        </h3>
                        <p className="text-sm text-muted-foreground">{car.variant}</p>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-foreground">{formatPrice(car.price)}</div>
                        <div className="text-sm text-muted-foreground">
                          On-road: {formatPrice(car.onRoadPrice)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Link to={`/cars/${car.id}`} className="flex-1">
                            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                              View Details
                            </Button>
                          </Link>
                          <Link to="/loan-application" className="flex-1">
                            <Button className="w-full bg-gradient-accent hover:opacity-90">
                              Get Offers
                            </Button>
                          </Link>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setSavedCars(prev => 
                              prev.map(c => 
                                c.id === car.id 
                                  ? { ...c, priceAlert: !c.priceAlert }
                                  : c
                              )
                            );
                          }}
                        >
                          {car.priceAlert ? "Disable" : "Enable"} Price Alerts
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default Wishlist;