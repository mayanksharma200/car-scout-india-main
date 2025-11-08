import { useState, useRef, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  Download,
  Share2,
  Maximize2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ShareModal from "./ShareModal";
import IMAGINImage from "./IMAGINImage";
import Car360View from "./Car360View";

interface CarImageGalleryProps {
  images: (
    | string
    | {
        id: string;
        url: string;
        alt: string;
        category?: string;
      }
  )[];
  carName: string;
  isLoading?: boolean;
  show360View?: boolean;
  car?: {
    brand: string;
    model: string;
    variant?: string;
  };
  currentColor?: {
    paintId: string;
    paintDescription: string;
  };
}

const CarImageGallery = ({
  images,
  carName,
  isLoading = false,
  show360View = false,
  car,
  currentColor,
}: CarImageGalleryProps) => {
  const [is360ViewActive, setIs360ViewActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set()
  );
  const thumbnailRef = useRef<HTMLDivElement>(null);

  // Transform images to normalized format
  const normalizedImages = useMemo(() => {
    let normalized = (images || []).map((img, index) => {
      if (typeof img === "string") {
        return {
          id: `image-${index}`,
          url: img,
          alt: `${carName} - Image ${index + 1}`,
          category: "exterior",
        };
      }
      return img;
    });

    if (normalized.length === 0) {
      normalized = [
        {
          id: "placeholder",
          url: "/placeholder.svg",
          alt: `${carName} - No image available`,
          category: "placeholder",
        },
      ];
    }

    return normalized;
  }, [images, carName]);

  // Get unique categories
  const categories = [
    "all",
    ...Array.from(
      new Set(normalizedImages.map((img) => img.category).filter(Boolean))
    ),
  ];

  // Filter images by category
  const filteredImages =
    activeCategory === "all"
      ? normalizedImages
      : normalizedImages.filter((img) => img.category === activeCategory);

  const currentImage = filteredImages[currentIndex];

  // Preload images
  useEffect(() => {
    normalizedImages.forEach((img, index) => {
      if (!preloadedImages.has(img.url) && index < 3) {
        const imageElement = new Image();
        imageElement.onload = () => {
          setPreloadedImages((prev) => new Set([...prev, img.url]));
        };
        imageElement.src = img.url;
      }
    });
  }, [normalizedImages, preloadedImages]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
    setIsZoomed(false);
  };

  const goToPrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + filteredImages.length) % filteredImages.length
    );
    setIsZoomed(false);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
    setIsZoomed(false);
  };

  // Auto-scroll thumbnails (only scroll within thumbnail container, not page)
  useEffect(() => {
    if (thumbnailRef.current) {
      const thumbnail = thumbnailRef.current.children[
        currentIndex
      ] as HTMLElement;
      if (thumbnail) {
        // Use scrollLeft instead of scrollIntoView to avoid page scrolling
        const container = thumbnailRef.current;
        const thumbnailLeft = thumbnail.offsetLeft;
        const thumbnailWidth = thumbnail.offsetWidth;
        const containerWidth = container.offsetWidth;
        const scrollPosition = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);

        container.scrollTo({
          left: scrollPosition,
          behavior: "smooth"
        });
      }
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isFullscreen) return;

      switch (e.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "Escape":
          setIsFullscreen(false);
          setIsZoomed(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFullscreen]);

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = currentImage.url;
    link.download = `${carName}-${currentIndex + 1}.jpg`;
    link.click();
  };

  // Touch handlers for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && filteredImages.length > 1) {
      goToNext();
    }
    if (isRightSwipe && filteredImages.length > 1) {
      goToPrevious();
    }
  };

  return (
    <div className="w-full max-w-full space-y-3 md:space-y-4 overflow-hidden">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
        {categories.length > 1 && categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category && !is360ViewActive ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveCategory(category);
              setCurrentIndex(0);
              setIs360ViewActive(false);
            }}
            className="capitalize text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 h-auto flex-shrink-0"
          >
            {category === "all" ? "All Photos" : category}
          </Button>
        ))}
        
        {/* 360° View Toggle Button */}
        {show360View && (
          <Button
            variant={is360ViewActive ? "default" : "outline"}
            size="sm"
            onClick={() => setIs360ViewActive(!is360ViewActive)}
            className="capitalize text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 h-auto flex-shrink-0 flex items-center gap-2"
          >
            <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
            360° View
          </Button>
        )}
        
      </div>

      {/* Main Display Area */}
      <div className="relative group w-full max-w-full">
        {is360ViewActive ? (
          /* 360° View */
          <div className="w-full">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 mb-4">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
                🚗 360° Interactive View - {car?.brand || "Car"} {car?.model || "Model"}
              </h3>
              {car && currentColor ? (
                <Car360View
                  car={{
                    brand: car.brand,
                    model: car.model,
                    variant: car.variant,
                  }}
                  paintId={currentColor.paintId}
                  paintDescription={currentColor.paintDescription}
                  height={400}
                  autoRotate={false}
                  className="w-full"
                />
              ) : (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                  <p className="text-sm">
                    <strong>Missing data:</strong> Car info or color data not provided. 
                    Need car={"{brand, model, variant}"} and currentColor={"{paintId, paintDescription}"} props.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Regular Image Gallery */
          <div
            className="aspect-video bg-muted rounded-lg overflow-hidden w-full max-w-full"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <IMAGINImage
              src={currentImage?.url || "/placeholder.svg"}
              alt={currentImage?.alt || carName}
              className={`w-full h-full object-cover transition-all duration-300 ${
                isLoading ? "opacity-60" : "group-hover:scale-105"
              }`}
              fallback="/placeholder.svg"
            />

            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
            {/* Navigation Arrows */}
            {filteredImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white hover:bg-black/80 
                           opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300
                           w-8 h-8 md:w-10 md:h-10 p-0 z-10"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white hover:bg-black/80 
                           opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300
                           w-8 h-8 md:w-10 md:h-10 p-0 z-10"
                  onClick={goToNext}
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </>
            )}

            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-10">
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/60 text-white hover:bg-black/80 w-8 h-8 md:w-auto md:h-auto p-1.5 md:p-2"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </Button>
              <ShareModal
                title={`${carName} - Image ${currentIndex + 1}`}
                description={`Check out this ${carName} image gallery`}
                url={window.location.pathname}
                image={currentImage?.url}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/60 text-white hover:bg-black/80 w-8 h-8 md:w-auto md:h-auto p-1.5 md:p-2"
                >
                  <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </Button>
              </ShareModal>
            </div>

            {/* Image Counter */}
            <div
              className="absolute bottom-3 left-3 bg-black/60 text-white px-2.5 py-1.5 rounded-md text-xs md:text-sm font-medium
                          opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
            >
              {currentIndex + 1} / {filteredImages.length}
            </div>

            {/* Mobile Swipe Indicator */}
            {filteredImages.length > 1 && (
              <div
                className="absolute bottom-3 right-3 md:hidden bg-black/60 text-white px-2.5 py-1.5 rounded-md text-xs 
                            opacity-70 flex items-center gap-1.5"
              >
                <ChevronLeft className="w-3 h-3" />
                <span className="text-xs">Swipe</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            )}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Navigation - Only show when not in 360° view */}
      {!is360ViewActive && filteredImages.length > 1 && (
        <div className="w-full">
          {/* Horizontal Scrolling Thumbnails */}
          <div
            ref={thumbnailRef}
            className={`flex gap-2 md:gap-3 overflow-x-auto pb-2 w-full transition-opacity duration-300 ${
              isLoading ? "opacity-50 pointer-events-none" : ""
            }`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollBehavior: "smooth",
            }}
          >
            {filteredImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`relative flex-shrink-0 w-16 h-12 md:w-20 md:h-16 rounded-md overflow-hidden 
                          border-2 transition-all duration-200 hover:scale-105 active:scale-95 
                          ${
                            index === currentIndex
                              ? "border-primary shadow-lg scale-105 ring-1 ring-primary/20"
                              : "border-border hover:border-primary/50"
                          }`}
              >
                <IMAGINImage
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  fallback="/placeholder.svg"
                />
                {/* Individual Loading State */}
                {isLoading && index === currentIndex && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Dot Indicators for Mobile */}
          {filteredImages.length > 3 && (
            <div className="flex justify-center mt-3 md:mt-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/80 backdrop-blur-sm rounded-full border">
                {filteredImages
                  .slice(0, Math.min(6, filteredImages.length))
                  .map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 hover:scale-125 ${
                        index === currentIndex
                          ? "bg-primary scale-125"
                          : "bg-muted-foreground/50 hover:bg-muted-foreground/70"
                      }`}
                    />
                  ))}
                {filteredImages.length > 6 && (
                  <span className="text-xs text-muted-foreground ml-1 font-medium">
                    +{filteredImages.length - 6}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-screen-2xl w-screen h-screen p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-20 bg-black/60 text-white hover:bg-black/80 w-10 h-10 p-0"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Action Buttons */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/60 text-white hover:bg-black/80 w-10 h-10 p-0"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/60 text-white hover:bg-black/80 w-10 h-10 p-0"
                onClick={downloadImage}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {/* Fullscreen Navigation */}
            {filteredImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white hover:bg-black/80 z-20
                           w-12 h-12 md:w-14 md:h-14 p-0"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white hover:bg-black/80 z-20
                           w-12 h-12 md:w-14 md:h-14 p-0"
                  onClick={goToNext}
                >
                  <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                </Button>
              </>
            )}

            {/* Main Image */}
            <div
              className={`transition-transform duration-300 max-w-[90vw] max-h-[85vh] cursor-${
                isZoomed ? "zoom-out" : "zoom-in"
              } ${isZoomed ? "scale-150" : "scale-100"}`}
              onClick={() => setIsZoomed(!isZoomed)}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <IMAGINImage
                src={currentImage?.url || "/placeholder.svg"}
                alt={currentImage?.alt || carName}
                className="max-w-full max-h-full object-contain"
                fallback="/placeholder.svg"
              />
            </div>

            {/* Image Info */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="text-center">
                <div className="text-sm font-medium">{currentImage?.alt}</div>
                <div className="text-xs text-gray-300 mt-1">
                  {currentIndex + 1} of {filteredImages.length}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarImageGallery;
