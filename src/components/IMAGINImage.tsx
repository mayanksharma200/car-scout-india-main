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
  // Convert proxy URLs to direct URLs to bypass CSP issues
  const getDirectImageUrl = (url: string) => {
    // If it's a proxy URL, extract the direct URL
    if (url.includes('imagin-proxy?url=')) {
      try {
        const proxyMatch = url.match(/imagin-proxy\?url=(.+)/);
        if (proxyMatch) {
          return decodeURIComponent(proxyMatch[1]);
        }
      } catch (error) {
        console.warn('Failed to parse proxy URL:', error);
      }
    }
    return url;
  };

  const [imageSrc, setImageSrc] = useState(getDirectImageUrl(src));
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Reset states when src changes
  useEffect(() => {
    const directUrl = getDirectImageUrl(src);
    console.log('IMAGINImage: New src received:', src);
    console.log('IMAGINImage: Using direct URL:', directUrl);
    setImageSrc(directUrl);
    setHasError(false);
    setIsLoading(true);
    setTimeoutReached(false);

    // Set a timeout to fallback if image takes too long
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn(`⏰ Image loading timeout (10s): ${directUrl}`);
        setTimeoutReached(true);
        setIsLoading(false);
        setHasError(true);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [src]);

  const handleImageLoad = () => {
    console.log(`Successfully loaded IMAGIN image: ${imageSrc}`);
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

  // Show loading placeholder (but only for first 2 seconds to avoid stuck loading)
  if (isLoading && !timeoutReached) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="animate-pulse">
          <Car className="h-8 w-8 text-gray-400" />
          <p className="text-xs text-gray-500 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

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
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        style={{ 
          display: isLoading ? 'none' : 'block',
          backgroundColor: 'transparent'
        }}
      />
      
      {/* Debug info overlay */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded max-w-[200px] truncate">
        {isLoading ? 'Loading...' : hasError ? 'Error' : 'Loaded'}
      </div>
    </div>
  );
};

export default IMAGINImage;