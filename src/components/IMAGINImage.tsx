import React, { useState, useEffect } from "react";
import { Car } from "lucide-react";

interface IMAGINImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  onError?: () => void;
}

const IMAGINImage: React.FC<IMAGINImageProps> = ({
  src,
  alt,
  className = "",
  fallback = "/placeholder.svg",
  loading = "lazy",
  onLoad,
  onError
}) => {
  // Simplified URL processing for maximum performance
  const getOptimizedUrl = (url: string) => {
    // Direct extraction without regex for proxy URLs
    if (url.includes('imagin-proxy?url=')) {
      const urlIndex = url.indexOf('imagin-proxy?url=') + 17;
      url = decodeURIComponent(url.substring(urlIndex));
    }

    // Fast IMAGIN optimization without URL object creation
    if (url.includes('cdn.imagin.studio')) {
      // Replace parameters directly for speed
      return url
        .replace(/width=\d+/g, 'width=440')
        .replace(/fileType=\w+/g, 'fileType=png')
        .replace(/zoomType=\w+/g, 'zoomType=relative')
        .replace(/&randomPaint=\w+/g, '')
        .replace(/&safeMode=\w+/g, '')
        .replace(/&fullscreen=\w+/g, '')
        + (url.includes('zoomLevel=') ? '' : '&zoomLevel=60')
        + (url.includes('aspectRatio=') ? '' : '&aspectRatio=1.6');
    }
    
    return url;
  };

  const [imageSrc, setImageSrc] = useState(getOptimizedUrl(src));
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState(Date.now());

  // Minimal effect for maximum performance
  useEffect(() => {
    const optimizedUrl = getOptimizedUrl(src);
    
    if (imageSrc !== optimizedUrl) {
      setLoadStartTime(Date.now());
      setImageSrc(optimizedUrl);
      setHasError(false);
      setIsLoading(true);
      setTimeoutReached(false);
    }

    // Faster timeout for quicker fallback
    const timeoutId = setTimeout(() => {
      setTimeoutReached(true);
      if (isLoading) {
        setIsLoading(false);
        setHasError(true);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [src]);

  const handleImageLoad = () => {
    const loadTime = Date.now() - loadStartTime;
    console.log(`✅ Successfully loaded IMAGIN image in ${loadTime}ms: ${imageSrc}`);
    
    // Clean up timer if it exists
    const timerId = (setImageSrc as any)._timerId;
    if (timerId) {
      try {
        console.timeEnd(timerId);
      } catch (e) {
        // Timer doesn't exist, ignore
      }
    }
    
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleImageError = (event) => {
    console.error(`Failed to load IMAGIN image: ${src}`, event);
    console.error('Image error details:', {
      currentSrc: imageSrc,
      originalSrc: src,
      fallback: fallback,
      error: event
    });
    setIsLoading(false);
    setHasError(true);
    
    // Try fallback if not already using it
    if (imageSrc !== fallback && !imageSrc.includes('placeholder')) {
      console.log(`Switching to fallback: ${fallback}`);
      setImageSrc(fallback);
    }
    
    onError?.();
  };

  // Don't show loading placeholder - show image immediately for better perceived performance
  // Loading state will be handled by browser's native loading behavior

  // Show error state with fallback
  if (hasError && imageSrc === fallback) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Car className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* DNS prefetch and preconnect to IMAGIN CDN for faster connections */}
      {imageSrc.includes('cdn.imagin.studio') && (
        <>
          <link rel="dns-prefetch" href="//cdn.imagin.studio" />
          <link rel="preconnect" href="https://cdn.imagin.studio" crossOrigin="" />
        </>
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        loading="eager" // Force eager loading for immediate display
        onLoad={handleImageLoad}
        onError={handleImageError}
        referrerPolicy="no-referrer"
        fetchpriority="high" // Use high priority for faster loading (lowercase for React)
        decoding="async" // Enable async decoding for better performance
        style={{ 
          display: 'block', // Always show image, let browser handle loading
          backgroundColor: '#f3f4f6', // Light gray background while loading
          imageRendering: 'optimizeSpeed', // Optimize for speed over quality
          transition: 'opacity 0.2s ease-in-out' // Smooth fade-in
        }}
      />
      
      {/* Debug info overlay with load time */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded max-w-[200px] truncate">
        {isLoading ? `Loading... ${Math.round((Date.now() - loadStartTime) / 1000)}s` : hasError ? 'Error' : `Loaded ${Math.round((Date.now() - loadStartTime) / 1000)}s`}
      </div>
    </div>
  );
};

export default IMAGINImage;