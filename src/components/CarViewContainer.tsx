import { useState } from "react";
import CarImageGallery from "./CarImageGallery";
import CarColorSelector from "./CarColorSelector";

interface CarViewContainerProps {
  images: string[];
  carName: string;
  car: {
    brand: string;
    model: string;
    variant?: string;
    bodyType?: string;
  };
  currentColor?: string;
  onColorChange: (colorOption: any) => void;
  isChanging?: boolean;
}

const CarViewContainer: React.FC<CarViewContainerProps> = ({
  images,
  carName,
  car,
  currentColor = "White",
  onColorChange,
  isChanging = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Image Gallery */}
      <div className="w-full">
        <CarImageGallery
          images={images}
          carName={carName}
          isLoading={isChanging}
        />
      </div>

      {/* Color Selector */}
      <CarColorSelector
        currentColor={currentColor}
        onColorChange={onColorChange}
        car={car}
        isChanging={isChanging}
      />
    </div>
  );
};

export default CarViewContainer;