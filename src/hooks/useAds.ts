import { useLocation } from 'react-router-dom';
import { getAdSlotsByPath, getAdSlotByPlacement, AdSlot } from '@/config/adsConfig';
import { useMemo } from 'react';

export const useAds = () => {
  const location = useLocation();

  const currentPath = useMemo(() => {
    // Handle dynamic routes
    const path = location.pathname;
    if (path.startsWith('/cars/') && path !== '/cars') {
      return '/cars/:slug';
    }
    return path;
  }, [location.pathname]);

  const availableSlots = useMemo(() => {
    return getAdSlotsByPath(currentPath);
  }, [currentPath]);

  const getAdForPlacement = (placement: string): AdSlot | undefined => {
    return getAdSlotByPlacement(currentPath, placement);
  };

  const hasAdsForPlacement = (placement: string): boolean => {
    return !!getAdSlotByPlacement(currentPath, placement);
  };

  return {
    currentPath,
    availableSlots,
    getAdForPlacement,
    hasAdsForPlacement
  };
};