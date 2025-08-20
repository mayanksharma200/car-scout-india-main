// src/hooks/useWishlistBatch.ts
import { useState, useEffect } from 'react';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

interface WishlistStatus {
  inWishlist: boolean;
  addedAt: string | null;
}

export const useWishlistStatus = (carId: string) => {
  const [status, setStatus] = useState<WishlistStatus>({ inWishlist: false, addedAt: null });
  const [loading, setLoading] = useState(true);
  const { user } = useUserAuth();
  const api = useAuthenticatedApi();

  useEffect(() => {
    if (!user || !carId) {
      setStatus({ inWishlist: false, addedAt: null });
      setLoading(false);
      return;
    }

    let mounted = true;

    const checkStatus = async () => {
      try {
        const response = await api.wishlist.checkMultiple([carId]);
        if (mounted && response.success && response.data) {
          const carStatus = response.data[carId] || { inWishlist: false, addedAt: null };
          setStatus(carStatus);
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
        if (mounted) {
          setStatus({ inWishlist: false, addedAt: null });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkStatus();

    return () => {
      mounted = false;
    };
  }, [carId, user, api]);

  return { ...status, loading };
};

export const useMultipleWishlistStatus = (carIds: string[]) => {
  const [statuses, setStatuses] = useState<Record<string, WishlistStatus>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useUserAuth();
  const api = useAuthenticatedApi();

  useEffect(() => {
    if (!user || !carIds || carIds.length === 0) {
      setStatuses({});
      setLoading(false);
      return;
    }

    let mounted = true;

    const checkStatuses = async () => {
      try {
        const response = await api.wishlist.checkMultiple(carIds);
        if (mounted && response.success && response.data) {
          setStatuses(response.data);
        }
      } catch (error) {
        console.error('Error checking multiple wishlist statuses:', error);
        if (mounted) {
          setStatuses({});
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkStatuses();

    return () => {
      mounted = false;
    };
  }, [carIds, user, api]);

  return { statuses, loading };
};