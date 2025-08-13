import { useState } from "react";
import { Plus, X, Star, Fuel, Settings, Users, TrendingUp, Share2 } from "lucide-react";
import Header from "@/components/Header";
import ShareModal from "@/components/ShareModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Compare = () => {
  const [selectedCars, setSelectedCars] = useState<any[]>([]);

  const availableCars = [
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
      specifications: {
        engine: "1.2L K12N",
        power: "89 bhp",
        torque: "113 Nm",
        fuelTank: "37L",
        bootSpace: "268L",
        groundClearance: "163mm"
      }
    },
    {
      id: "2",
      brand: "Hyundai",
      model: "i20",
      variant: "Asta CVT",
      price: 1104000,
      onRoadPrice: 1234000,
      fuelType: "Petrol",
      transmission: "CVT",
      mileage: 20.3,
      seating: 5,
      rating: 4.4,
      image: "/placeholder.svg",
      specifications: {
        engine: "1.2L Kappa",
        power: "83 bhp",
        torque: "115 Nm",
        fuelTank: "37L",
        bootSpace: "311L",
        groundClearance: "170mm"
      }
    },
    {
      id: "3",
      brand: "Tata",
      model: "Altroz",
      variant: "XZ+ DCA",
      price: 999000,
      onRoadPrice: 1119000,
      fuelType: "Petrol",
      transmission: "DCA",
      mileage: 18.1,
      seating: 5,
      rating: 4.1,
      image: "/placeholder.svg",
      specifications: {
        engine: "1.2L Revotron",
        power: "86 bhp",
        torque: "113 Nm",
        fuelTank: "37L",
        bootSpace: "345L",
        groundClearance: "165mm"
      }
    }
  ];

  const addCarToCompare = (car: any) => {
    if (selectedCars.length < 3 && !selectedCars.find(c => c.id === car.id)) {
      setSelectedCars([...selectedCars, car]);
    }
  };

  const removeCarFromCompare = (carId: string) => {
    setSelectedCars(selectedCars.filter(car => car.id !== carId));
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} Lakh`;
    }
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Compare Cars
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select up to 3 cars to compare their specifications, features, and prices side by side.
          </p>
        </div>

        {/* Car Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[0, 1, 2].map((index) => (
            <Card key={index} className="h-64">
              <CardContent className="p-6 h-full flex flex-col justify-center">
                {selectedCars[index] ? (
                  <div className="text-center">
                    <div className="relative mb-4">
                      <img 
                        src={selectedCars[index].image} 
                        alt={`${selectedCars[index].brand} ${selectedCars[index].model}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                        onClick={() => removeCarFromCompare(selectedCars[index].id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <h3 className="font-semibold">
                      {selectedCars[index].brand} {selectedCars[index].model}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedCars[index].variant}
                    </p>
                    <p className="font-bold text-accent mt-2">
                      {formatPrice(selectedCars[index].price)}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-muted-foreground mb-4">
                      Select Car {index + 1}
                    </h3>
                    <Input 
                      placeholder="Search car model..." 
                      className="mb-3"
                    />
                    <Button variant="outline" className="w-full">
                      Browse Cars
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Available Cars */}
        {selectedCars.length < 3 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Popular Cars to Compare</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {availableCars
                .filter(car => !selectedCars.find(selected => selected.id === car.id))
                .map((car) => (
                <Card key={car.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{car.brand} {car.model}</h4>
                        <p className="text-sm text-muted-foreground">{car.variant}</p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => addCarToCompare(car)}
                        disabled={selectedCars.length >= 3}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-accent">{formatPrice(car.price)}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        <span className="text-sm">{car.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {selectedCars.length >= 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Specification</th>
                      {selectedCars.map((car, index) => (
                        <th key={index} className="text-center p-4 font-medium min-w-48">
                          {car.brand} {car.model}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Image</td>
                      {selectedCars.map((car, index) => (
                        <td key={index} className="p-4 text-center">
                          <img 
                            src={car.image} 
                            alt={`${car.brand} ${car.model}`}
                            className="w-32 h-20 object-cover rounded mx-auto"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/20">
                      <td className="p-4 font-medium">Price</td>
                      {selectedCars.map((car, index) => (
                        <td key={index} className="p-4 text-center font-bold text-accent">
                          {formatPrice(car.price)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Rating</td>
                      {selectedCars.map((car, index) => (
                        <td key={index} className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 fill-accent text-accent" />
                            <span>{car.rating}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Fuel Type</td>
                      {selectedCars.map((car, index) => (
                        <td key={index} className="p-4 text-center">{car.fuelType}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Transmission</td>
                      {selectedCars.map((car, index) => (
                        <td key={index} className="p-4 text-center">{car.transmission}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Mileage</td>
                      {selectedCars.map((car, index) => (
                        <td key={index} className="p-4 text-center">{car.mileage} kmpl</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Seating</td>
                      {selectedCars.map((car, index) => (
                        <td key={index} className="p-4 text-center">{car.seating} Seater</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Engine</td>
                      {selectedCars.map((car, index) => (
                        <td key={index} className="p-4 text-center">{car.specifications.engine}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Power</td>
                      {selectedCars.map((car, index) => (
                        <td key={index} className="p-4 text-center">{car.specifications.power}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Boot Space</td>
                      {selectedCars.map((car, index) => (
                        <td key={index} className="p-4 text-center">{car.specifications.bootSpace}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Action</td>
                      {selectedCars.map((car, index) => (
                        <td key={index} className="p-4 text-center">
                          <div className="space-y-2">
                            <Button className="w-full bg-gradient-accent hover:opacity-90" size="sm">
                              Get Offers
                            </Button>
                            <Button variant="outline" size="sm" className="w-full">
                              View Details
                            </Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedCars.length < 2 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              Select at least 2 cars to start comparing
            </h3>
            <p className="text-muted-foreground">
              Choose from our popular cars above or search for specific models.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;