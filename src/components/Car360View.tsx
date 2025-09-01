import { useState, useRef, useEffect, useCallback } from "react";
import { RotateCcw, Play, Pause, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import IMAGINImage from "./IMAGINImage";

interface Car360ViewProps {
  car: {
    brand: string;
    model: string;
    variant?: string;
  };
  paintId: string;
  paintDescription: string;
  width?: number;
  height?: number;
  className?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

const Car360View: React.FC<Car360ViewProps> = ({
  car,
  paintId,
  paintDescription,
  width = 600,
  height = 400,
  className = "",
  autoRotate = false,
  rotationSpeed = 650, // Slower, more comfortable rotation speed (higher = slower)
}) => {
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number>(0);
  const lastAngle = useRef<number>(0);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generate 24 angles for smooth 360° rotation (every 15 degrees)
  const totalAngles = 24;
  const angleStep = 360 / totalAngles;
  
  // Generate IMAGIN API angles (convert to 01-21 range used by API)
  const getApiAngle = (index: number): string => {
    // Map 0-23 range to 01-21 range (IMAGIN uses specific angle values)
    const apiAngles = [
      '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12',
      '13', '14', '15', '16', '17', '18', '19', '20', '21', '01', '02', '03'
    ];
    return apiAngles[index];
  };
  
  // Generate image URLs for all angles
  const imageUrls = Array.from({ length: totalAngles }, (_, index) => {
    const baseUrl = "https://cdn.imagin.studio/getimage";
    const params = new URLSearchParams({
      customer: "sg-zorbitads",
      make: car.brand.replace(/\s+/g, '').toLowerCase(),
      modelFamily: car.model.replace(/\s+/g, '').toLowerCase(),
      modelVariant: car.variant || 'suv',
      angle: getApiAngle(index),
      fileType: 'png',
      width: width.toString(),
      paintId,
      paintDescription,
    });
    return `${baseUrl}?${params.toString()}`;
  });
  
  // Preload images
  useEffect(() => {
    const loadImage = (url: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setLoadedCount(prev => prev + 1);
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });
    };
    
    Promise.all(imageUrls.map(url => loadImage(url)))
      .then(() => setImagesLoaded(true))
      .catch(console.error);
  }, [imageUrls]);
  
  // Auto-rotation effect
  useEffect(() => {
    if (isAutoRotating && imagesLoaded && !isDragging) {
      autoRotateRef.current = setInterval(() => {
        setCurrentAngle(prev => (prev + 1) % totalAngles);
      }, rotationSpeed);
    } else if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
      autoRotateRef.current = null;
    }
    
    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [isAutoRotating, imagesLoaded, isDragging, rotationSpeed, totalAngles]);
  
  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!imagesLoaded) return;
    
    setIsDragging(true);
    dragStartX.current = e.clientX;
    lastAngle.current = currentAngle;
    
    e.preventDefault();
  }, [currentAngle, imagesLoaded]);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const deltaX = e.clientX - dragStartX.current;
    // Much higher sensitivity for very responsive rotation
    const sensitivity = containerRef.current.offsetWidth / (totalAngles * 5); // 5x more sensitive
    const angleChange = deltaX / sensitivity;
    const newAngle = Math.round((lastAngle.current + angleChange + totalAngles * 10) % totalAngles);
    
    setCurrentAngle(Math.max(0, Math.min(totalAngles - 1, newAngle)));
  }, [isDragging, totalAngles]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Touch drag handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!imagesLoaded) return;
    
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
    lastAngle.current = currentAngle;
  }, [currentAngle, imagesLoaded]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const deltaX = e.touches[0].clientX - dragStartX.current;
    // Same high sensitivity for touch as mouse
    const sensitivity = containerRef.current.offsetWidth / (totalAngles * 5); // 5x more sensitive
    const angleChange = deltaX / sensitivity;
    const newAngle = Math.round((lastAngle.current + angleChange + totalAngles * 10) % totalAngles);
    
    setCurrentAngle(Math.max(0, Math.min(totalAngles - 1, newAngle)));
    e.preventDefault();
  }, [isDragging, totalAngles]);
  
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Attach global mouse/touch events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);
  
  const toggleAutoRotate = () => {
    setIsAutoRotating(!isAutoRotating);
  };
  
  const resetView = () => {
    setCurrentAngle(0);
  };
  
  const rotateLeft = () => {
    setCurrentAngle(prev => (prev - 1 + totalAngles) % totalAngles);
  };
  
  const rotateRight = () => {
    setCurrentAngle(prev => (prev + 1) % totalAngles);
  };
  
  const currentImageUrl = imageUrls[currentAngle];
  const loadingProgress = Math.round((loadedCount / totalAngles) * 100);
  
  return (
    <Card className={`relative bg-gradient-to-br from-muted/30 to-muted/60 overflow-hidden ${className}`}>
      <div
        ref={containerRef}
        className="relative w-full aspect-[3/2] cursor-grab active:cursor-grabbing select-none"
        style={{ height: height }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Main 360° Image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <IMAGINImage
            src={currentImageUrl}
            alt={`${car.brand} ${car.model} - 360° View - Angle ${currentAngle + 1}`}
            className={`max-w-full max-h-full object-contain transition-opacity duration-100 ${
              imagesLoaded ? 'opacity-100' : 'opacity-60'
            }`}
            fallback="/placeholder.svg"
          />
        </div>
        
        {/* Loading Overlay */}
        {!imagesLoaded && (
          <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-sm font-medium text-foreground mb-2">Loading 360° View</div>
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2">{loadingProgress}%</div>
          </div>
        )}
        
        {/* Drag Instruction */}
        {imagesLoaded && !isDragging && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-80 md:opacity-0 md:group-hover:opacity-80 transition-opacity">
            Drag to rotate • {currentAngle + 1}/{totalAngles}
          </div>
        )}
        
        {/* Control Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleAutoRotate}
            disabled={!imagesLoaded}
            className="w-10 h-10 p-0"
            title={isAutoRotating ? "Pause auto-rotation" : "Start auto-rotation"}
          >
            {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={resetView}
            disabled={!imagesLoaded}
            className="w-10 h-10 p-0"
            title="Reset to front view"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Manual Rotation Controls */}
        <div className="absolute top-4 left-4 flex gap-2 opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            onClick={rotateLeft}
            disabled={!imagesLoaded}
            className="w-10 h-10 p-0"
            title="Rotate left"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={rotateRight}
            disabled={!imagesLoaded}
            className="w-10 h-10 p-0"
            title="Rotate right"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Angle Indicator */}
      {imagesLoaded && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-md text-xs font-medium">
          {Math.round((currentAngle / (totalAngles - 1)) * 360)}°
        </div>
      )}
    </Card>
  );
};

export default Car360View;