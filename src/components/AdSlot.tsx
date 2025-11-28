// Updated AdSlot component to handle multi-size ads
import React, { useEffect, useRef, useState, useCallback } from "react";
import { AdSlot as AdSlotType } from "@/config/adsConfig";

declare global {
  interface Window {
    googletag: any;
  }
}

interface AdSlotProps {
  slot: AdSlotType;
  showFallback?: boolean;
}

// Cache for ad script URL to avoid multiple API calls
let cachedAdScriptUrl: string | null = null;
let fetchingAdScriptUrl: Promise<string> | null = null;

const fetchAdScriptUrl = async (): Promise<string> => {
  // Return cached URL if available
  if (cachedAdScriptUrl) {
    return cachedAdScriptUrl;
  }

  // Return existing fetch promise if already fetching
  if (fetchingAdScriptUrl) {
    return fetchingAdScriptUrl;
  }

  // Fetch the URL from API
  fetchingAdScriptUrl = fetch('/api/settings/public/ad_script_url')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.value) {
        cachedAdScriptUrl = data.value;
        return data.value;
      }
      throw new Error('Failed to fetch ad script URL');
    })
    .catch(error => {
      console.error('Error fetching ad script URL:', error);
      fetchingAdScriptUrl = null;
      throw error;
    });

  return fetchingAdScriptUrl;
};

const AdSlot: React.FC<AdSlotProps> = ({ slot, showFallback = true }) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [adScriptUrl, setAdScriptUrl] = useState<string | null>(null);
  const [uniqueId] = useState(
    () => `gpt-${slot.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  // Fetch ad script URL on mount
  useEffect(() => {
    fetchAdScriptUrl()
      .then(url => setAdScriptUrl(url))
      .catch(error => console.error('Failed to load ad script URL:', error));
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const checkIfEmpty = useCallback(() => {
    if (!adRef.current) return;

    const adElement = document.getElementById(uniqueId);
    if (adElement) {
      const height = adElement.offsetHeight;
      const isHidden = window.getComputedStyle(adElement).display === 'none';

      console.log(`📱 Mobile ad check for ${slot.id}:`, {
        isMobile,
        elementHeight: height,
        isHidden: isHidden,
        currentSize: isMobile && slot.mobileSize ? slot.mobileSize : slot.size
      });

      if (height === 0 || isHidden) {
        setIsEmpty(true);
        console.log(`📭 Ad slot ${slot.id} is empty - height: ${height}px, hidden: ${isHidden}`);
      } else {
        setIsEmpty(false);
        console.log(`📬 Ad slot ${slot.id} has content - height: ${height}px`);
      }
    }
  }, [uniqueId, slot.id, isMobile, slot.mobileSize, slot.size]);

  const loadAd = useCallback(() => {
    if (!adRef.current || isLoaded || !adScriptUrl) return;

    // Define multi-size arrays for responsive ads
    const getMultiSizes = () => {
      if (slot.id.includes('728x90')) {
        // Banner ads: desktop and mobile sizes
        return [[728, 90], [320, 50]];
      } else if (slot.id.includes('300x250')) {
        // Rectangle ads: standard size works on both
        return [300, 250];
      }
      // Fallback to current size
      return isMobile && slot.mobileSize ? slot.mobileSize : slot.size;
    };

    const adSizes = getMultiSizes();
    console.log(`🎯 Loading ad: ${slot.name} (${slot.id}) with sizes:`, adSizes);

    // Clear previous content
    adRef.current.innerHTML = "";

    // Create a container div with the unique ID
    const adContainer = document.createElement("div");
    adContainer.id = uniqueId;
    adRef.current.appendChild(adContainer);

    // Load Google Tag Manager script if not already loaded
    if (!document.querySelector('script[src*="gpt.js"]')) {
      const gptScript = document.createElement("script");
      gptScript.src = adScriptUrl; // Use dynamic URL from API
      gptScript.async = true;
      gptScript.crossOrigin = "anonymous";
      document.head.appendChild(gptScript);
      console.log(`📡 Loaded ad script from: ${adScriptUrl}`);
    }

    // Initialize googletag if not already done
    window.googletag = window.googletag || { cmd: [] };

    // Execute the ad code
    window.googletag.cmd.push(() => {
      try {
        // Check if slot already exists
        const existingSlots = window.googletag.pubads().getSlots();
        const existingSlot = existingSlots.find(
          (s: any) => s.getSlotElementId() === uniqueId
        );

        if (existingSlot) {
          console.log(`⚠️ Ad slot ${slot.id} already exists, skipping`);
          return;
        }

        // Define the slot with multi-size support
        const adSlot = window.googletag.defineSlot(
          `/23175073069/${slot.id}`,
          adSizes,  // Use multi-size array
          uniqueId
        );

        if (adSlot) {
          adSlot.addService(window.googletag.pubads());

          // Only enable services once
          if (!window.googletag._servicesEnabled) {
            window.googletag.pubads().enableSingleRequest();
            window.googletag.pubads().collapseEmptyDivs();
            window.googletag.enableServices();
            window.googletag._servicesEnabled = true;
          }

          window.googletag.display(uniqueId);
          setIsLoaded(true);

          // Check if ad is empty after a short delay
          setTimeout(checkIfEmpty, 2000);

          console.log(`✅ Ad slot ${slot.id} displayed successfully with sizes:`, adSizes);
        } else {
          console.error(`❌ Failed to define ad slot: ${slot.id}`);
        }
      } catch (error) {
        console.error(`❌ Error loading ad ${slot.id}:`, error);
      }
    });
  }, [slot, isMobile, uniqueId, isLoaded, checkIfEmpty, adScriptUrl]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAd();
    }, 100);

    return () => clearTimeout(timer);
  }, [loadAd]);

  const currentSize = isMobile && slot.mobileSize ? slot.mobileSize : slot.size;
  const [width, height] = currentSize;

  // Render fallback ad if Google Ad Manager slot is empty
  if (isEmpty && showFallback) {
    return (
      <div className="ad-slot-container flex justify-center items-center my-4">
        <div
          className="ad-slot-fallback border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            maxWidth: "100%",
          }}
        >
          <div className="text-center text-gray-500">
            <div className="text-sm font-medium">Advertisement</div>
            <div className="text-xs mt-1">{width} × {height}</div>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs mt-1 text-gray-400">{slot.name}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-slot-container flex justify-center items-center my-4">
      <div
        ref={adRef}
        className="ad-slot"
        style={{
          minWidth: `${width}px`,
          minHeight: isEmpty ? '0px' : `${height}px`,
          maxWidth: "100%",
          border: process.env.NODE_ENV === "development" ? "1px dashed #ccc" : "none",
        }}
      />
      {process.env.NODE_ENV === "development" && !isEmpty && (
        <div className="text-xs text-gray-500 absolute">
          {/* {slot.name} ({width}x{height}) */}
        </div>
      )}
    </div>
  );
};

export default AdSlot;