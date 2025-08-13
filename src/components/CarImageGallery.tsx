import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, X, Download, Share2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ShareModal from "./ShareModal";

interface CarImageGalleryProps {
  images: {
    id: string;
    url: string;
    alt: string;
    category?: string;
  }[];
  carName: string;
}

const CarImageGallery = ({ images, carName }: CarImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const thumbnailRef = useRef<HTMLDivElement>(null);

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(images.map(img => img.category).filter(Boolean)))];
  
  // Filter images by category
  const filteredImages = activeCategory === "all" 
    ? images 
    : images.filter(img => img.category === activeCategory);

  const currentImage = filteredImages[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
    setIsZoomed(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
    setIsZoomed(false);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
    setIsZoomed(false);
  };

  // Auto-scroll thumbnails to show current image
  useEffect(() => {
    if (thumbnailRef.current) {
      const thumbnail = thumbnailRef.current.children[currentIndex] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentIndex]);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!isFullscreen) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
      case 'Escape':
        setIsFullscreen(false);
        setIsZoomed(false);
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = `${carName}-${currentIndex + 1}.jpg`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveCategory(category);
                setCurrentIndex(0);
              }}
              className="capitalize"
            >
              {category === "all" ? "All Photos" : category}
            </Button>
          ))}
        </div>
      )}

      {/* Main Image Display */}
      <div className="relative group">
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          <img
            src={currentImage?.url}
            alt={currentImage?.alt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Image Overlay Controls */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
            {/* Navigation Arrows */}
            {filteredImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  onClick={goToNext}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </>
            )}

            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/50 text-white hover:bg-black/70"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="w-4 h-4" />
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
                  className="bg-black/50 text-white hover:bg-black/70"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </ShareModal>
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {currentIndex + 1} / {filteredImages.length}
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {filteredImages.length > 1 && (
        <div className="relative">
          <div
            ref={thumbnailRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                  index === currentIndex
                    ? 'border-primary shadow-lg scale-105'
                    : 'border-transparent hover:border-primary/50'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
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
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Action Buttons */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/50 text-white hover:bg-black/70"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/50 text-white hover:bg-black/70"
                onClick={downloadImage}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {/* Navigation in Fullscreen */}
            {filteredImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 z-10"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 z-10"
                  onClick={goToNext}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Main Image */}
            <div className={`transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'} cursor-${isZoomed ? 'zoom-out' : 'zoom-in'}`}>
              <img
                src={currentImage?.url}
                alt={currentImage?.alt}
                className="max-w-full max-h-full object-contain"
                onClick={() => setIsZoomed(!isZoomed)}
              />
            </div>

            {/* Image Info */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium">{currentImage?.alt}</div>
                <div className="text-xs text-gray-300">
                  {currentIndex + 1} of {filteredImages.length}
                </div>
              </div>
            </div>

            {/* Thumbnail Strip in Fullscreen */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-screen-lg overflow-x-auto">
              {filteredImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border transition-all ${
                    index === currentIndex
                      ? 'border-white scale-110'
                      : 'border-transparent hover:border-white/50'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
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