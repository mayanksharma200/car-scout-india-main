import React from "react";
import AdSlot from "./AdSlot";
import { useAds } from "@/hooks/useAds";

interface AdBannerProps {
  placement: string;
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ placement, className = "" }) => {
  const { getAdForPlacement } = useAds();

  const adSlot = getAdForPlacement(placement);

  if (!adSlot) {
    return null;
  }

  return (
    <div className={`ad-banner w-full flex justify-center ${className}`}>
      <AdSlot slot={adSlot} />
    </div>
  );
};

export default AdBanner;
