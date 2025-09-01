import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CarColorSelector from "./CarColorSelector";

interface ColorOption {
  id: string;
  name: string;
  hexCode: string;
  paintId: string;
  paintDescription: string;
  isPopular?: boolean;
}

const Car360TestDemo = () => {
  const [selectedColor, setSelectedColor] = useState("White");
  const [isChanging, setIsChanging] = useState(false);
  const [currentCar, setCurrentCar] = useState({
    brand: "BMW",
    model: "X5",
    variant: "suv",
    bodyType: "suv"
  });

  // Sample car models for testing
  const testCars = [
    { brand: "BMW", model: "X5", variant: "suv", bodyType: "suv" },
    { brand: "Mercedes", model: "C-Class", variant: "sedan", bodyType: "sedan" },
    { brand: "Audi", model: "A3", variant: "hatchback", bodyType: "hatchback" },
    { brand: "Toyota", model: "Camry", variant: "sedan", bodyType: "sedan" },
    { brand: "Honda", model: "Civic", variant: "sedan", bodyType: "sedan" },
  ];

  const handleColorChange = async (colorOption: ColorOption) => {
    setIsChanging(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSelectedColor(colorOption.name);
    setIsChanging(false);
  };

  const handleCarChange = (car: typeof currentCar) => {
    setCurrentCar(car);
    setSelectedColor("White"); // Reset to default color
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚗 Car 360° View Demo
            <Badge variant="secondary">Interactive Test</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Test the 360° view functionality with different car models. Switch between cars to see how the component adapts.
            </p>
            
            {/* Car Selection Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {testCars.map((car, index) => (
                <Button
                  key={index}
                  variant={currentCar.brand === car.brand && currentCar.model === car.model ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCarChange(car)}
                  className="text-xs"
                >
                  {car.brand} {car.model}
                </Button>
              ))}
            </div>

            {/* Current Car Info */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-lg">
                {currentCar.brand} {currentCar.model}
              </h3>
              <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                <span>Variant: {currentCar.variant}</span>
                <span>Body Type: {currentCar.bodyType}</span>
                <span>Current Color: {selectedColor}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Car Color Selector with 360° View */}
      <CarColorSelector
        currentColor={selectedColor}
        onColorChange={handleColorChange}
        car={currentCar}
        isChanging={isChanging}
        show360View={true}
      />

      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">How to Use the 360° View:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Click on the "360° View" tab to access the interactive car view
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Drag the car image left or right to rotate and view from different angles
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Use the control buttons to auto-rotate, reset view, or manually rotate
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Change colors to see how they look in the 360° view
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Works with both mouse drag and touch gestures on mobile devices
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Car360TestDemo;