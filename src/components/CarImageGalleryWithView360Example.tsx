import { useState } from "react";
import CarImageGallery from "./CarImageGallery";
import CarColorSelector from "./CarColorSelector";

// Example of how to use the updated components in CarDetail.tsx

const CarImageGalleryWith360Example = () => {
  const [selectedColor, setSelectedColor] = useState("White");
  const [isChanging, setIsChanging] = useState(false);

  // Sample car and images data
  const sampleCar = {
    brand: "BMW",
    model: "X5",
    variant: "suv",
  };

  const sampleImages = [
    "https://example.com/bmw-x5-1.jpg",
    "https://example.com/bmw-x5-2.jpg",
  ];

  // Color mapping for 360° view
  const getCurrentColorInfo = () => {
    const colorMap = {
      White: { paintId: "1", paintDescription: "white" },
      Black: { paintId: "2", paintDescription: "black" },
      Silver: { paintId: "3", paintDescription: "silver" },
      Red: { paintId: "4", paintDescription: "red" },
      Blue: { paintId: "5", paintDescription: "blue" },
    };
    return colorMap[selectedColor] || colorMap["White"];
  };

  const handleColorChange = async (colorOption) => {
    setIsChanging(true);
    console.log("Color changing to:", colorOption.name);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSelectedColor(colorOption.name);
    setIsChanging(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Car Image Gallery with 360° View</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Gallery - spans 2 columns */}
        <div className="lg:col-span-2">
          <CarImageGallery
            images={sampleImages}
            carName={`${sampleCar.brand} ${sampleCar.model}`}
            isLoading={isChanging}
            show360View={true} // Enable 360° view toggle
            car={sampleCar}
            currentColor={getCurrentColorInfo()}
          />
        </div>

        {/* Color Selector Sidebar */}
        <div className="lg:col-span-1">
          <CarColorSelector
            currentColor={selectedColor}
            onColorChange={handleColorChange}
            car={sampleCar}
            isChanging={isChanging}
            show360View={false} // Disable 360 view in sidebar since it's in gallery
          />
        </div>
      </div>

      <div className="bg-muted/20 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Click "360° View" button in the image gallery to switch to interactive 360° car view</li>
          <li>Click "Exterior" or other category buttons to switch back to regular images</li>
          <li>Change colors in the sidebar - they update in both gallery and 360° view</li>
          <li>360° view replaces the image gallery in the same space</li>
          <li>Thumbnails are hidden when in 360° view mode</li>
        </ul>
      </div>
    </div>
  );
};

export default CarImageGalleryWith360Example;