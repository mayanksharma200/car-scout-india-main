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
    if (selectedColor?.id === colorOption.id) return;
    
    setIsChangingColor(true);
    setSelectedColor(colorOption);
    
    try {
      // Simulate a small delay for smooth UX
      await new Promise(resolve => setTimeout(resolve, 300));
      onColorChange(colorOption);
    } catch (error) {
      console.error("Error changing color:", error);
    } finally {
      setIsChangingColor(false);
    }
  };

  const activeColor = selectedColor || currentColorOption;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="w-5 h-5 text-primary" />
          Choose Color
          {isChangingColor && (
            <Badge variant="secondary" className="ml-2">
              Updating...
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select a color to see how your {car.brand} {car.model} looks
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Selected Color */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <div
            className="w-8 h-8 rounded-full border-2 border-white shadow-md"
            style={{ backgroundColor: activeColor.hexCode }}
          />
          <div className="flex-1">
            <p className="font-medium">{activeColor.name}</p>
            <p className="text-xs text-muted-foreground">
              {activeColor.paintDescription.replace(/-/g, ' ')}
            </p>
          </div>
          {activeColor.isPopular && (
            <Badge variant="secondary" className="text-xs">
              Popular
            </Badge>
          )}
        </div>

        {/* Color Grid */}
        <div>
          <p className="text-sm font-medium mb-3">Available Colors</p>
          <div className="grid grid-cols-4 gap-3">
            {colorOptions.map((colorOption) => {
              const isSelected = activeColor.id === colorOption.id;
              const isCurrentlySelected = selectedColor?.id === colorOption.id && isChangingColor;
              
              return (
                <Button
                  key={colorOption.id}
                  variant="ghost"
                  className={`h-auto p-2 hover:bg-muted/50 transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleColorSelect(colorOption)}
                  disabled={isChangingColor}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-full border-2 border-white shadow-md transition-transform duration-200 ${
                          isCurrentlySelected ? 'scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: colorOption.hexCode }}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow-md" />
                        </div>
                      )}
                      {colorOption.isPopular && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
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
        <div className="text-xs text-muted-foreground border-t border-border pt-3">
          <p className="flex items-center gap-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full" />
            Popular colors
          </p>
          <p className="mt-1">
            Color appearance may vary based on lighting and screen settings
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarColorSelector;