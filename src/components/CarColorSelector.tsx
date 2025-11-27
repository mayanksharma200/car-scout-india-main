import { useState, useEffect } from "react";
import { Palette, Check, RotateCcw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Basic color options (no longer using IMAGIN API)
const COLOR_OPTIONS = [
  { id: "white", name: "White", hexCode: "#FFFFFF", paintId: "1", paintDescription: "white", isPopular: true },
  { id: "black", name: "Black", hexCode: "#000000", paintId: "2", paintDescription: "black", isPopular: true },
  { id: "silver", name: "Silver", hexCode: "#C0C0C0", paintId: "3", paintDescription: "silver", isPopular: true },
  { id: "blue", name: "Blue", hexCode: "#2563EB", paintId: "4", paintDescription: "blue", isPopular: true },
  { id: "red", name: "Red", hexCode: "#DC2626", paintId: "5", paintDescription: "red", isPopular: true },
  { id: "green", name: "Green", hexCode: "#16A34A", paintId: "6", paintDescription: "green" },
];

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
    colors?: string; // Semicolon-separated color names
    color_codes?: string; // Semicolon-separated color codes
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

        let options: ColorOption[] = [];

        // Parse colors from car data if available
        if (car.colors && car.color_codes) {
          const colorNames = car.colors.split(';').map(c => c.trim()).filter(c => c);
          const colorCodes = car.color_codes.split(';').map(c => c.trim()).filter(c => c);

          options = colorNames.map((name, index) => {
            const code = colorCodes[index] || '';
            const hexCode = code.startsWith('#') ? code : `#${code}`;

            return {
              id: name.toLowerCase().replace(/\s+/g, '-'),
              name,
              hexCode,
              paintId: (index + 1).toString(),
              paintDescription: name.toLowerCase(),
              isPopular: index < 3 // Mark first 3 as popular
            };
          });

          console.log('🎨 Parsed colors from car data:', options);
        } else if (car.colors) {
          // If only color names available, use default hex codes
          const colorNames = car.colors.split(';').map(c => c.trim()).filter(c => c);
          options = colorNames.map((name, index) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            hexCode: COLOR_OPTIONS.find(c => c.name.toLowerCase() === name.toLowerCase())?.hexCode || '#808080',
            paintId: (index + 1).toString(),
            paintDescription: name.toLowerCase(),
            isPopular: index < 3
          }));
        } else {
          // Fallback to static color options
          options = COLOR_OPTIONS;
          console.log('🎨 Using fallback static colors');
        }

        console.log('🎨 Loaded paint options:', options);
        setColorOptions(options || []);
      } catch (error) {
        console.error('❌ Error loading paint options:', error);
        // Fallback to basic colors if parsing fails
        setColorOptions(COLOR_OPTIONS.slice(0, 3));
      } finally {
        setLoadingColors(false);
      }
    };

    loadPaintOptions();
  }, [car, car.colors, car.color_codes]);

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


        {/* Current Selected Color */}
        {activeColor && (
          <div className="flex items-center justify-center p-3 bg-muted/50 rounded-lg min-h-[68px]">
            <div
              className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white shadow-md flex-shrink-0 transition-colors duration-300"
              style={{ backgroundColor: activeColor.hexCode }}
            />
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
            <div className="flex flex-wrap justify-center gap-4 min-h-[80px]">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`flex flex-wrap justify-center gap-4 min-h-[80px] transition-opacity duration-300 ${isChanging ? 'opacity-50 pointer-events-none' : ''
                }`}
            >
              {colorOptions.map((colorOption) => {
                const isSelected = activeColor?.id === colorOption.id;
                const isCurrentlySelected = selectedColor?.id === colorOption.id && isChanging;

                return (
                  <Button
                    key={colorOption.id}
                    variant="ghost"
                    className={`h-auto p-1 hover:bg-muted/50 transition-all duration-200 ${isChanging ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    onClick={() => !isChanging && handleColorSelect(colorOption)}
                    disabled={isChanging}
                  >
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-md transition-all duration-200 ${isCurrentlySelected ? 'scale-110 animate-pulse' : isChanging ? 'scale-95' : 'hover:scale-105'
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
            <span>Popular options</span>
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