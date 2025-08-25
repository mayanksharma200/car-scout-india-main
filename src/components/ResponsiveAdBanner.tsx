import React from 'react';
import { useAds } from '@/hooks/useAds';

interface ResponsiveAdBannerProps {
  placement: string;
  className?: string;
}

const ResponsiveAdBanner: React.FC<ResponsiveAdBannerProps> = ({ 
  placement, 
  className = '' 
}) => {
  const { getAdForPlacement, hasAdsForPlacement, currentPath, availableSlots } = useAds();
  
  const adSlot = getAdForPlacement(placement);

  // Always render something to show ads are working
  return (
    <div 
      className={`responsive-ad-banner w-full flex justify-center my-4 px-4 ${className}`}
    >
      <div 
        className="ad-container bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center text-gray-700 w-full shadow-sm hover:shadow-md transition-shadow"
        style={{
          maxWidth: '728px',
          minHeight: '90px',
          height: 'auto'
        }}
      >
        {adSlot ? (
          <div className="text-center p-6">
            <div className="text-xl font-bold text-blue-600 mb-2">🎯 Advertisement Space</div>
            <div className="text-sm font-medium text-gray-600 mb-2">
              {adSlot.name}
            </div>
            <div className="text-xs text-blue-500 bg-white px-3 py-1 rounded-full inline-block mb-2">
              {adSlot.id} • {adSlot.size[0]}×{adSlot.size[1]}px
            </div>
            <div className="text-xs text-green-600 font-medium">
              ✅ Ready for Google AdSense Integration
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Placement: {placement}
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <div className="text-lg font-bold text-orange-600 mb-2">⚠️ Ad Configuration Issue</div>
            <div className="text-sm text-gray-600">
              No ad found for "{placement}" on "{currentPath}"
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Available ads: {availableSlots.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsiveAdBanner;