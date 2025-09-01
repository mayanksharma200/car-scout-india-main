import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ColorOption {
  id: string;
  name: string;
  hexCode: string;
  paintId: string;  // Now uses generic IDs: "1", "2", "3", "4", "5"
  paintDescription: string;
  isPopular?: boolean;
}

interface CarColorSelectorProps {
  currentColor?: string;
  onColorChange: (colorOption: ColorOption) => void;
  car: {
    brand: string;
    model: string;
    variant?: string;
  };
}

// Generic paint colors using the working IMAGIN.studio API structure
const getColorOptions = (brand: string): ColorOption[] => {
  // Using generic paint IDs that work with the API
  const baseColors: ColorOption[] = [
    {
      id: "white",
      name: "White",
      hexCode: "#FFFFFF",
      paintId: "1",
      paintDescription: "white",
      isPopular: true,
    },
    {
      id: "black",
      name: "Black", 
      hexCode: "#000000",
      paintId: "2",
      paintDescription: "black",
      isPopular: true,
    },
    {
      id: "silver",
      name: "Silver",
      hexCode: "#C0C0C0", 
      paintId: "3",
      paintDescription: "silver",
      isPopular: true,
    },
    {
      id: "red",
      name: "Red",
      hexCode: "#DC2626",
      paintId: "4", 
      paintDescription: "red",
      isPopular: true,
    },
    {
      id: "blue",
      name: "Blue",
      hexCode: "#2563EB",
      paintId: "5",
      paintDescription: "blue",
    },
  ];

  return baseColors;
};

const CarColorSelector: React.FC<CarColorSelectorProps> = ({
  currentColor = "Pearl White",
  onColorChange,
  car,
}) => {
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [isChangingColor, setIsChangingColor] = useState(false);

  const colorOptions = getColorOptions(car.brand);
  const currentColorOption = colorOptions.find(
    (color) => color.name.toLowerCase() === currentColor.toLowerCase()
  ) || colorOptions[0];

  const handleColorSelect = async (colorOption: ColorOption) => {
    if (selectedColor?.id === colorOption.id || isChangingColor) return;
    
    setIsChangingColor(true);
    setSelectedColor(colorOption);
    
    try {
      // Call the parent color change handler
      await onColorChange(colorOption);
    } catch (error) {
      console.error("Error changing color:", error);
    } finally {
      setIsChangingColor(false);
    }
  };

  const activeColor = selectedColor || currentColorOption;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Palette className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          Choose Color
          {isChangingColor && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Updating...
            </Badge>
          )}
        </CardTitle>
        <p className="text-xs md:text-sm text-muted-foreground">
          Select a color to see how your {car.brand} {car.model} looks
        </p>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 pt-0">
        {/* Current Selected Color */}
        <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-muted/50 rounded-lg">
          <div
            className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white shadow-md flex-shrink-0"
            style={{ backgroundColor: activeColor.hexCode }}
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm md:text-base truncate">{activeColor.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {activeColor.paintDescription.replace(/-/g, ' ')}
            </p>
          </div>
          {activeColor.isPopular && (
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              Popular
            </Badge>
          )}
        </div>

        {/* Color Grid */}
        <div>
          <p className="text-xs md:text-sm font-medium mb-2 md:mb-3">Available Colors</p>
          <div className="grid grid-cols-5 md:grid-cols-4 gap-2 md:gap-3">
            {colorOptions.map((colorOption) => {
              const isSelected = activeColor.id === colorOption.id;
              const isCurrentlySelected = selectedColor?.id === colorOption.id && isChangingColor;
              
              return (
                <Button
                  key={colorOption.id}
                  variant="ghost"
                  className={`h-auto p-1 md:p-2 hover:bg-muted/50 transition-all duration-200 ${
                    isSelected ? 'ring-1 md:ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleColorSelect(colorOption)}
                  disabled={isChangingColor}
                >
                  <div className="flex flex-col items-center gap-1 md:gap-2">
                    <div className="relative">
                      <div
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-md transition-transform duration-200 ${
                          isCurrentlySelected ? 'scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: colorOption.hexCode }}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-3 h-3 md:w-4 md:h-4 text-white drop-shadow-md" />
                        </div>
                      )}
                      {colorOption.isPopular && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full" />
                      )}
                    </div>
                    <span className="text-[10px] md:text-xs font-medium text-center leading-tight">
                      {colorOption.name}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Color Info */}
        <div className="text-[10px] md:text-xs text-muted-foreground border-t border-border pt-2 md:pt-3">
          <p className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-500 rounded-full flex-shrink-0" />
            <span>Popular colors</span>
          </p>
          <p className="mt-1 leading-relaxed">
            Color appearance may vary based on lighting and screen settings
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarColorSelector;