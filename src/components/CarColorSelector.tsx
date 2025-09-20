import { useState, useEffect } from "react";
import { Palette, Check, RotateCcw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCarPaintOptions } from "@/utils/imaginAPI";

interface ColorOption {
  id: string;
  name: string;
  hexCode: string;
  paintId: string;
  paintDescription: string;
  isPopular?: boolean;
  sprayCanInfo?: {
    sprayCanId: string;
    paintType: string;
    primarySprayCanRGB: string;
    primarySprayCanHighLightRGB: string;
    colourCluster: string;
  };
  paintSwatchInfo?: {
    primary: {
      highLight: string;
      lowLight: string;
    };
    secondary?: {
      highLight: string;
      lowLight: string;
    };
    tertiary?: {
      highLight: string;
      lowLight: string;
    };
  };
}

interface CarColorSelectorProps {
  currentColor?: string;
  onColorChange: (colorOption: ColorOption) => void;
  car: {
    brand: string;
    model: string;
    variant?: string;
    bodyType?: string;
    year?: string | number;
  };
  isChanging?: boolean;
  show360View?: boolean;
  onViewModeChange?: (is360View: boolean) => void;
  is360ViewActive?: boolean;
}

const CarColorSelector: React.FC<CarColorSelectorProps> = ({
  currentColor = "White",
  onColorChange,
  car,
  isChanging = false,
  show360View = true,
  onViewModeChange,
  is360ViewActive = false,
}) => {
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [internal360ViewActive, setInternal360ViewActive] = useState(false);
  const [colorOptions, setColorOptions] = useState<ColorOption[]>([]);
  const [loadingColors, setLoadingColors] = useState(true);

  // Use internal state if no external state management
  const active360View = onViewModeChange ? is360ViewActive : internal360ViewActive;

  const handleViewModeToggle = (is360View: boolean) => {
    console.log("🚀 View mode toggle clicked:", is360View);
    if (onViewModeChange) {
      onViewModeChange(is360View);
    } else {
      setInternal360ViewActive(is360View);
    }
  };

  // Load paint options when component mounts or car changes
  useEffect(() => {
    const loadPaintOptions = async () => {
      try {
        setLoadingColors(true);
        console.log('🎨 Loading paint options for car:', car);

        const options = await getCarPaintOptions(car);
        console.log('🎨 Loaded paint options:', options);
        console.log('🎨 Paint options length:', options?.length);
        console.log('🎨 First paint option:', options?.[0]);

        setColorOptions(options || []);
      } catch (error) {
        console.error('❌ Error loading paint options:', error);
        // Fallback to basic colors if API fails
        setColorOptions([
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
        ]);
      } finally {
        setLoadingColors(false);
      }
    };

    loadPaintOptions();
  }, [car]);

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

  const activeColor = selectedColor || currentColorOption || colorOptions[0];

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
        
        {/* View Mode Toggle Buttons */}
        {show360View && (
          <div className="flex flex-wrap gap-2 max-w-full overflow-hidden mb-4">
            <Button
              variant={!active360View ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewModeToggle(false)}
              className="capitalize text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 h-auto flex-shrink-0"
            >
              Images
            </Button>
            <Button
              variant={active360View ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewModeToggle(true)}
              className="capitalize text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 h-auto flex-shrink-0 flex items-center gap-2"
            >
              <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
              360° View
            </Button>
          </div>
        )}

        {/* Current Selected Color */}
        {activeColor && (
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
        )}

        {/* Color Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Available Colors</p>
            {loadingColors && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading...
              </div>
            )}
          </div>

          {loadingColors ? (
            <div className="grid grid-cols-5 gap-3 min-h-[100px]">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted animate-pulse" />
                  <div className="w-8 h-3 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`grid grid-cols-5 gap-3 min-h-[100px] transition-opacity duration-300 ${
                isChanging ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {colorOptions.map((colorOption) => {
              const isSelected = activeColor?.id === colorOption.id;
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
          )}
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