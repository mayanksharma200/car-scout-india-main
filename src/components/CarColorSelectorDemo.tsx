import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CarColorSelector from "./CarColorSelector";

interface ColorOption {
  id: string;
  name: string;
  hexCode: string;
  paintId: string;
  paintDescription: string;
  isPopular?: boolean;
}

const CarColorSelectorDemo = () => {
  const [selectedColor, setSelectedColor] = useState("White");
  const [isChanging, setIsChanging] = useState(false);
  const [is360ViewActive, setIs360ViewActive] = useState(false);
  
  const testCar = {
    brand: "BMW",
    model: "X5",
    variant: "suv",
    bodyType: "suv"
  };

  const handleColorChange = async (colorOption: ColorOption) => {
    setIsChanging(true);
    console.log("Color changing to:", colorOption.name);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSelectedColor(colorOption.name);
    setIsChanging(false);
    console.log("Color changed to:", colorOption.name);
  };

  const handleViewModeChange = (is360View: boolean) => {
    console.log("View mode changed to:", is360View ? "360° View" : "Images");
    setIs360ViewActive(is360View);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🚗 CarColorSelector with 360° View Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                {testCar.brand} {testCar.model}
              </h3>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Current Color: {selectedColor}</span>
                <span>View Mode: {is360ViewActive ? "360° View" : "Images"}</span>
                <span>Status: {isChanging ? "Changing..." : "Ready"}</span>
              </div>
            </div>
            
            <div className="bg-muted/20 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Instructions:</strong><br/>
                1. Click "360° View" button to see the interactive 360° car view<br/>
                2. Click "Images" button to switch back to image gallery mode<br/>
                3. Change colors to see how they work in both modes<br/>
                4. The 360° view should render in the same space as the color selector
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CarColorSelector with 360° View Toggle */}
      <CarColorSelector
        currentColor={selectedColor}
        onColorChange={handleColorChange}
        car={testCar}
        isChanging={isChanging}
        show360View={true}
        onViewModeChange={handleViewModeChange}
        is360ViewActive={is360ViewActive}
      />
    </div>
  );
};

export default CarColorSelectorDemo;