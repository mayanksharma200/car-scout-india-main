import React, { useEffect, useRef, useState } from 'react';
import { AdSlot as AdSlotConfig } from '@/config/adsConfig';

interface SimpleAdSlotProps {
  slot: AdSlotConfig;
  className?: string;
}

const SimpleAdSlot: React.FC<SimpleAdSlotProps> = ({ slot, className = '' }) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showFallback, setShowFallback] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!adRef.current) return;

    const timer = setTimeout(() => {
      try {
        // Simple HTML insertion approach
        const containerId = `simple-ad-${slot.id}-${Date.now()}`;
        
        // Clean version of the ad code without script conflicts
        const cleanAdCode = `
          <div id="${containerId}" style="width: 100%; text-align: center; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 0.375rem; padding: 1rem; margin: 0.5rem 0;">
            <div style="color: #6c757d; font-size: 0.875rem;">
              <div>Advertisement</div>
              <div style="font-size: 0.75rem; margin-top: 0.25rem; opacity: 0.7;">
                // ${slot.name}
              </div>
            </div>
          </div>
        `;
        
        if (adRef.current) {
          adRef.current.innerHTML = cleanAdCode;
          setShowFallback(false);
        }
      } catch (error) {
        console.error('Error loading simple ad:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [slot, isMobile]);

  const getContainerStyle = () => {
    if (isMobile) {
      return {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        margin: '0.5rem 0',
        padding: '0 0.5rem',
        maxWidth: '100%',
        minHeight: '50px'
      };
    }

    return {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      margin: '1rem auto',
      padding: '0 1rem',
      maxWidth: `${slot.size[0]}px`,
      minHeight: `${slot.size[1]}px`
    };
  };

  return (
    <div 
      className={`simple-ad-container ${className}`}
      style={getContainerStyle()}
    >
      <div 
        ref={adRef}
        className="w-full"
        style={{
          width: '100%',
          minHeight: isMobile ? '50px' : `${slot.size[1]}px`
        }}
      >
        {showFallback && (
          <div 
            className="w-full bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-gray-500 text-sm"
            style={{
              minHeight: isMobile ? '50px' : `${slot.size[1]}px`,
              padding: isMobile ? '0.5rem' : '1rem'
            }}
          >
            <div className="text-center">
              <div>Loading Advertisement...</div>
              <div className="text-xs mt-1 opacity-60">
                {/* {slot.name} */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleAdSlot;