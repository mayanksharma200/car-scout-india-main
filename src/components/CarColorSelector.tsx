import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ColorOption {
  id: string;
  name: string;
  hexCode: string;
  paintId: string;
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
  isChanging?: boolean;
}

const getColorOptions = (brand: string): ColorOption[] => {
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
  currentColor = "White",
  onColorChange,
  car,
  isChanging = false,
}) => {
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);

  const colorOptions = getColorOptions(car.brand);
  const currentColorOption = colorOptions.find(
    (color) => color.name.toLowerCase() === currentColor.toLowerCase()
  ) || colorOptions[0];

  const handleColorSelect = async (colorOption: ColorOption) => {
    if (selectedColor?.id === colorOption.id || isChanging) return;
    
    setSelectedColor(colorOption);
    
    try {
      await onColorChange(colorOption);
    } catch (error) {
      console.error("Error changing color:", error);
    } finally {
      // Reset selected color after a delay to prevent UI flickering
      setTimeout(() => {
        setSelectedColor(null);
      }, 500);
    }
  };

  const activeColor = selectedColor || currentColorOption;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Palette className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          Choose Color
          {isChanging && (
            <Badge variant="secondary" className="ml-2 text-xs animate-pulse">
              Updating...
            </Badge>
          )}
        </CardTitle>
        <p className="text-xs md:text-sm text-muted-foreground">
          Select a color to see how your {car.brand} {car.model} looks
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Current Selected Color */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg min-h-[68px]">
          <div
            className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-md flex-shrink-0 transition-colors duration-300"
            style={{ backgroundColor: activeColor.hexCode }}
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm md:text-base truncate">
              {activeColor.name}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
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
        <div className="space-y-3">
          <p className="text-sm font-medium">Available Colors</p>
          <div 
            className={`grid grid-cols-5 gap-3 min-h-[100px] transition-opacity duration-300 ${
              isChanging ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {colorOptions.map((colorOption) => {
              const isSelected = activeColor.id === colorOption.id;
              const isCurrentlySelected = selectedColor?.id === colorOption.id && isChanging;
              
              return (
                <Button
                  key={colorOption.id}
                  variant="ghost"
                  className={`h-auto p-2 hover:bg-muted/50 transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-primary bg-muted/30' : ''
                  } ${isChanging ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => !isChanging && handleColorSelect(colorOption)}
                  disabled={isChanging}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <div
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-md transition-all duration-200 ${
                          isCurrentlySelected ? 'scale-110 animate-pulse' : isChanging ? 'scale-95' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: colorOption.hexCode }}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow-md" />
                        </div>
                      )}
                      {colorOption.isPopular && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-white" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">
                      {colorOption.name}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Color Info */}
        <div className="text-xs text-muted-foreground border-t border-border pt-3 space-y-2">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
            <span>Popular colors</span>
          </p>
          <p className="leading-relaxed">
            Color appearance may vary based on lighting and screen settings
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarColorSelector;