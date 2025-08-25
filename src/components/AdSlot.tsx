import React, { useEffect, useRef, useState } from "react";
import { AdSlot as AdSlotType } from "@/config/adsConfig";

// Add TypeScript declaration to avoid compiler errors
declare global {
  interface Window {
    googletag: any;
  }
}

interface AdSlotProps {
  slot: AdSlotType;
}

const AdSlot: React.FC<AdSlotProps> = ({ slot }) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [uniqueId] = useState(
    () => `gpt-${slot.id}-${Math.random().toString(36).substr(2, 9)}`
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!adRef.current) return;

    // Get the current size based on mobile/desktop
    const currentSize =
      isMobile && slot.mobileSize ? slot.mobileSize : slot.size;

    // Replace the hardcoded "gpt-passback" with our unique ID
    // and update the size dimensions
    let adCode = slot.code
      .replace(/gpt-passback/g, uniqueId)
      .replace(/\[728,\s*90\]/g, `[${currentSize[0]}, ${currentSize[1]}]`)
      .replace(/\[300,\s*250\]/g, `[${currentSize[0]}, ${currentSize[1]}]`);

    // Set the HTML exactly as your original working code
    adRef.current.innerHTML = adCode;

    // Execute scripts in the same way scripts would execute
    const scripts = adRef.current.querySelectorAll("script");
    scripts.forEach((script) => {
      const newScript = document.createElement("script");

      if (script.src) {
        newScript.src = script.src;
        newScript.async = script.async;
        if (script.getAttribute("crossorigin")) {
          newScript.crossOrigin = script.getAttribute("crossorigin");
        }
      } else {
        newScript.textContent = script.textContent;
      }

      // Replace the old script with new one to trigger execution
      script.parentNode?.replaceChild(newScript, script);
    });
  }, [slot, isMobile, uniqueId]);

  const currentSize = isMobile && slot.mobileSize ? slot.mobileSize : slot.size;
  const [width, height] = currentSize;

  return (
    <div className="ad-slot-container flex justify-center items-center my-4">
      <div
        ref={adRef}
        className="ad-slot"
        style={{
          minWidth: `${width}px`,
          minHeight: `${height}px`,
          maxWidth: "100%",
        }}
      />
    </div>
  );
};

export default AdSlot;
