import { useState, useRef, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  Download,
  Share2,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ShareModal from "./ShareModal";
import IMAGINImage from "./IMAGINImage";

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
}

const CarImageGallery = ({
  images,
  carName,
  isLoading = false,
}: CarImageGalleryProps) => {
  console.log("🖼️ CarImageGallery received:", {
    images,
    imagesType: typeof images,
    imagesIsArray: Array.isArray(images),
    imagesLength: images?.length,
    carName,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set()
  );
  const thumbnailRef = useRef<HTMLDivElement>(null);

  // Transform images to normalized format (memoized to prevent re-computation)
  const normalizedImages = useMemo(() => {
    let normalized = (images || []).map((img, index) => {
      if (typeof img === "string") {
        const normalizedImg = {
          id: `image-${index}`,
          url: img,
          alt: `${carName} - Image ${index + 1}`,
          category: "exterior",
        };
        console.log(`🔄 Normalized image ${index}:`, {
          original: img,
          normalized: normalizedImg,
        });
        return normalizedImg;
      }
      console.log(`✅ Already normalized image ${index}:`, img);
      return img;
    });

    // If no images, use a placeholder
    if (normalized.length === 0) {
      console.warn("⚠️ No images found, using placeholder");
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

  console.log("🎯 Final normalized images:", normalizedImages);

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

  // Preload images for instant display
  useEffect(() => {
    normalizedImages.forEach((img, index) => {
      if (!preloadedImages.has(img.url) && index < 3) {
        // Preload first 3 images
        const imageElement = new Image();
        imageElement.onload = () => {
          console.log(`🚀 Preloaded image ${index}: ${img.url}`);
          setPreloadedImages((prev) => new Set([...prev, img.url]));
        };
        imageElement.src = img.url;
      }
    });
  }, [normalizedImages, preloadedImages]);

  console.log("🎯 Current image state:", {
    currentIndex,
    filteredImagesLength: filteredImages.length,
    currentImage,
    currentImageUrl: currentImage?.url,
    preloadedCount: preloadedImages.size,
  });

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

  // Auto-scroll thumbnails to show current image
  useEffect(() => {
    if (thumbnailRef.current) {
      const thumbnail = thumbnailRef.current.children[
        currentIndex
      ] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentIndex]);

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

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFullscreen]);

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = currentImage.url;
    link.download = `${carName}-${currentIndex + 1}.jpg`;
    link.click();
  };

  // Touch/swipe handlers for mobile
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
    <div className="space-y-3 md:space-y-4">
      {/* Category Filter - Better mobile spacing */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveCategory(category);
                setCurrentIndex(0);
              }}
              className="capitalize text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 h-auto"
            >
              {category === "all" ? "All Photos" : category}
            </Button>
          ))}
        </div>
      )}

      {/* Main Image Display - Enhanced for touch */}
      <div className="relative group">
        <div
          className="aspect-video bg-muted rounded-lg overflow-hidden touch-pan-y"
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

          {/* Image Overlay Controls - Responsive positioning */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 md:group-hover:bg-black/20 transition-colors duration-300">
            {/* Navigation Arrows - Always visible on mobile, hover on desktop */}
            {filteredImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 
                           opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300
                           w-8 h-8 md:w-10 md:h-10 p-0"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 
                           opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300
                           w-8 h-8 md:w-10 md:h-10 p-0"
                  onClick={goToNext}
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </>
            )}

            {/* Action Buttons - Better mobile positioning */}
            <div
              className="absolute top-2 md:top-3 right-2 md:right-3 flex gap-1 md:gap-2 
                          opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
            >
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/50 text-white hover:bg-black/70 w-8 h-8 md:w-auto md:h-auto p-1 md:p-2"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
              <ShareModal
                title={`${carName} - Image ${currentIndex + 1}`}
                description={`Check out this ${carName} image gallery`}
                url={`/cars/1/gallery`}
                image={currentImage?.url}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 text-white hover:bg-black/70 w-8 h-8 md:w-auto md:h-auto p-1 md:p-2"
                >
                  <Share2 className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </ShareModal>
            </div>

            {/* Image Counter - Mobile optimized */}
            <div
              className="absolute bottom-2 md:bottom-3 left-2 md:left-3 bg-black/50 text-white px-2 py-1 rounded text-xs md:text-sm 
                          opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
            >
              {currentIndex + 1} / {filteredImages.length}
            </div>

            {/* Mobile swipe indicator */}
            {filteredImages.length > 1 && (
              <div className="absolute bottom-2 right-2 md:hidden bg-black/50 text-white px-2 py-1 rounded text-xs opacity-60">
                Swipe for more
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnail Navigation - Enhanced mobile experience */}
      {filteredImages.length > 1 && (
        <div className="relative">
          <div
            ref={thumbnailRef}
            className={`flex gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide pb-2 transition-opacity duration-300 ${
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
                className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-16 rounded-md md:rounded-lg overflow-hidden border-2 
                          transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation ${
                            index === currentIndex
                              ? "border-primary shadow-lg scale-105"
                              : "border-transparent hover:border-primary/50"
                          }`}
              >
                <IMAGINImage
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  fallback="/placeholder.svg"
                />
              </button>
            ))}
          </div>

          {/* Scroll indicators for mobile */}
          <div className="flex justify-center mt-2 md:hidden">
            <div className="flex gap-1">
              {filteredImages.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Modal - Enhanced for mobile */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-screen-2xl w-screen h-screen p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button - Mobile optimized */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 md:top-4 right-2 md:right-4 z-10 bg-black/50 text-white hover:bg-black/70 
                       w-10 h-10 md:w-auto md:h-auto p-2"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </Button>

            {/* Action Buttons - Mobile layout */}
            <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10 flex gap-1 md:gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/50 text-white hover:bg-black/70 w-10 h-10 md:w-auto md:h-auto p-2"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/50 text-white hover:bg-black/70 w-10 h-10 md:w-auto md:h-auto p-2"
                onClick={downloadImage}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {/* Navigation in Fullscreen - Mobile optimized */}
            {filteredImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 z-10
                           w-12 h-12 md:w-auto md:h-auto p-2 md:p-3"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 z-10
                           w-12 h-12 md:w-auto md:h-auto p-2 md:p-3"
                  onClick={goToNext}
                >
                  <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                </Button>
              </>
            )}

            {/* Main Image - Touch enabled */}
            <div
              className={`transition-transform duration-300 max-w-[90vw] max-h-[90vh] md:max-w-full md:max-h-full ${
                isZoomed ? "scale-150" : "scale-100"
              } cursor-${isZoomed ? "zoom-out" : "zoom-in"}`}
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

            {/* Image Info - Mobile responsive */}
            <div className="absolute bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg">
              <div className="text-center">
                <div className="text-xs md:text-sm font-medium">
                  {currentImage?.alt}
                </div>
                <div className="text-xs text-gray-300">
                  {currentIndex + 1} of {filteredImages.length}
                </div>
              </div>
            </div>

            {/* Thumbnail Strip in Fullscreen - Hidden on small screens */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex gap-2 max-w-screen-lg overflow-x-auto">
              {filteredImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-12 h-9 md:w-16 md:h-12 rounded overflow-hidden border transition-all ${
                    index === currentIndex
                      ? "border-white scale-110"
                      : "border-transparent hover:border-white/50"
                  }`}
                >
                  <IMAGINImage
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    fallback="/placeholder.svg"
                  />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarImageGallery;
