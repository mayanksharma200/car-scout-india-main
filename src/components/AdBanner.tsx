import React from "react";
import AdSlot from "./AdSlot";
import { useAds } from "@/hooks/useAds";

interface AdBannerProps {
  placement: string;
  className?: string;
  showFallback?: boolean;
}

const AdBanner: React.FC<AdBannerProps> = ({
  placement,
  className = "",
  showFallback = true,
}) => {
  const { getAdForPlacement } = useAds();

  const adSlot = getAdForPlacement(placement);

  if (!adSlot) {
    return null;
  }

  return (
    <div className={`ad-banner w-full flex justify-center relative overflow-hidden ${className}`} style={{ isolation: 'isolate' }}>
      <AdSlot slot={adSlot} showFallback={showFallback} />
    </div>
  );
};

export default AdBanner;
