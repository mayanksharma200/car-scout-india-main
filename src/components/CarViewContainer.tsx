import { useState } from "react";
import CarImageGallery from "./CarImageGallery";
import Car360View from "./Car360View";
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
  show360View?: boolean;
}

const CarViewContainer: React.FC<CarViewContainerProps> = ({
  images,
  carName,
  car,
  currentColor = "White",
  onColorChange,
  isChanging = false,
  show360View = true,
}) => {
  const [is360ViewActive, setIs360ViewActive] = useState(false);

  // Get current color for 360 view
  const getCurrentColorInfo = () => {
    const colorOptions = [
      { id: "white", name: "White", paintId: "1", paintDescription: "white" },
      { id: "black", name: "Black", paintId: "2", paintDescription: "black" },
      { id: "silver", name: "Silver", paintId: "3", paintDescription: "silver" },
      { id: "red", name: "Red", paintId: "4", paintDescription: "red" },
      { id: "blue", name: "Blue", paintId: "5", paintDescription: "blue" },
    ];
    
    return colorOptions.find(
      (color) => color.name.toLowerCase() === currentColor.toLowerCase()
    ) || colorOptions[0];
  };

  const currentColorInfo = getCurrentColorInfo();

  return (
    <div className="space-y-4">
      {/* Image Gallery or 360 View */}
      <div className="w-full">
        {is360ViewActive ? (
          <Car360View
            car={{
              brand: car.brand,
              model: car.model,
              variant: car.variant,
            }}
            paintId={currentColorInfo.paintId}
            paintDescription={currentColorInfo.paintDescription}
            height={400}
            autoRotate={false}
            className="w-full"
          />
        ) : (
          <CarImageGallery
            images={images}
            carName={carName}
            isLoading={isChanging}
          />
        )}
      </div>

      {/* Color Selector with View Toggle */}
      <CarColorSelector
        currentColor={currentColor}
        onColorChange={onColorChange}
        car={car}
        isChanging={isChanging}
        show360View={show360View}
        onViewModeChange={setIs360ViewActive}
        is360ViewActive={is360ViewActive}
      />
    </div>
  );
};

export default CarViewContainer;