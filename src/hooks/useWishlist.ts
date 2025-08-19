// src/hooks/useWishlist.ts
// Custom hook for wishlist management

import { useState, useEffect, useCallback } from 'react';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useToast } from '@/hooks/use-toast';

interface WishlistItem {
  id: string;
  savedDate: string;
  priceAlert: boolean;
  car: {
    id: string;
    brand: string;
    model: string;
    variant: string;
    price: number;
    onRoadPrice: number;
    fuelType: string;
    transmission: string;
    mileage: number;
    seating: number;
    rating: number;
    image: string;
  };
}

interface WishlistStats {
  totalCars: number;
  priceAlertsActive: number;
}

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [stats, setStats] = useState<WishlistStats>({ totalCars: 0, priceAlertsActive: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { isAuthenticated } = useUserAuth();
  const api = useAuthenticatedApi();
  const { toast } = useToast();

  // Fetch wishlist data
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      console.log('📋 Fetching wishlist...');
      setLoading(true);
      setError(null);

      const [wishlistResponse, statsResponse] = await Promise.all([
        api.wishlist.getAll(),
        api.wishlist.getStats()
      ]);

      if (wishlistResponse.success) {
        setWishlist(wishlistResponse.data || []);
        console.log(`✅ Loaded ${wishlistResponse.data?.length || 0} wishlist items`);
      } else {
        throw new Error(wishlistResponse.error || 'Failed to fetch wishlist');
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

    } catch (err: any) {
      console.error('❌ Error fetching wishlist:', err);
      setError(err.message || 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, api]);

  // Check if a car is in wishlist
  const isInWishlist = useCallback((carId: string): boolean => {
    return wishlist.some(item => item.car.id === carId);
  }, [wishlist]);

  // Add car to wishlist
  const addToWishlist = useCallback(async (carId: string) => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please sign in to add cars to your wishlist.",
      });
      return false;
    }

    try {
      setActionLoading(`add-${carId}`);
      console.log(`❤️ Adding car ${carId} to wishlist...`);

      const response = await api.wishlist.add(carId);
      
      if (response.success) {
        await fetchWishlist(); // Refresh the list
        
        toast({
          title: "Added to wishlist",
          description: "Car has been added to your wishlist.",
        });
        
        console.log('✅ Car added to wishlist successfully');
        return true;
      } else {
        throw new Error(response.error || 'Failed to add to wishlist');
      }
    } catch (err: any) {
      console.error('❌ Error adding to wishlist:', err);
      
      let errorMessage = "Failed to add car to wishlist. Please try again.";
      if (err.message.includes('already in wishlist')) {
        errorMessage = "This car is already in your wishlist.";
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      return false;
    } finally {
      setActionLoading(null);
    }
  }, [isAuthenticated, api, fetchWishlist, toast]);

  // Remove car from wishlist
  const removeFromWishlist = useCallback(async (carId: string) => {
    try {
      setActionLoading(`remove-${carId}`);
      console.log(`🗑️ Removing car ${carId} from wishlist...`);

      const response = await api.wishlist.remove(carId);
      
      if (response.success) {
        setWishlist(prev => prev.filter(item => item.car.id !== carId));
        setStats(prev => ({ 
          ...prev, 
          totalCars: Math.max(0, prev.totalCars - 1) 
        }));
        
        toast({
          title: "Removed from wishlist",
          description: "Car has been removed from your wishlist.",
        });
        
        console.log('✅ Car removed from wishlist successfully');
        return true;
      } else {
        throw new Error(response.error || 'Failed to remove from wishlist');
      }
    } catch (err: any) {
      console.error('❌ Error removing from wishlist:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove car from wishlist. Please try again.",
      });
      return false;
    } finally {
      setActionLoading(null);
    }
  }, [api, toast]);

  // Remove multiple cars from wishlist
  const removeMultipleFromWishlist = useCallback(async (carIds: string[]) => {
    if (carIds.length === 0) return false;

    try {
      setActionLoading('bulk-remove');
      console.log(`🗑️ Removing ${carIds.length} cars from wishlist...`);

      const response = await api.wishlist.removeMultiple(carIds);
      
      if (response.success) {
        setWishlist(prev => prev.filter(item => !carIds.includes(item.car.id)));
        setStats(prev => ({ 
          ...prev, 
          totalCars: Math.max(0, prev.totalCars - response.data.removedCount) 
        }));
        
        toast({
          title: "Removed from wishlist",
          description: `${response.data.removedCount} cars removed from your wishlist.`,
        });
        
        console.log('✅ Multiple cars removed from wishlist successfully');
        return true;
      } else {
        throw new Error(response.error || 'Failed to remove cars');
      }
    } catch (err: any) {
      console.error('❌ Error removing multiple cars:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove cars from wishlist. Please try again.",
      });
      return false;
    } finally {
      setActionLoading(null);
    }
  }, [api, toast]);

  // Toggle price alert
  const togglePriceAlert = useCallback(async (carId: string, enabled: boolean) => {
    try {
      setActionLoading(`alert-${carId}`);
      console.log(`🔔 ${enabled ? 'Enabling' : 'Disabling'} price alert for car ${carId}...`);

      const response = await api.wishlist.togglePriceAlert(carId, enabled);
      
      if (response.success) {
        setWishlist(prev => 
          prev.map(item => 
            item.car.id === carId 
              ? { ...item, priceAlert: enabled }
              : item
          )
        );
        
        setStats(prev => ({
          ...prev,
          priceAlertsActive: enabled 
            ? prev.priceAlertsActive + 1 
            : Math.max(0, prev.priceAlertsActive - 1)
        }));
        
        toast({
          title: `Price alert ${enabled ? 'enabled' : 'disabled'}`,
          description: `You will ${enabled ? 'now' : 'no longer'} receive price updates for this car.`,
        });
        
        console.log(`✅ Price alert ${enabled ? 'enabled' : 'disabled'} successfully`);
        return true;
      } else {
        throw new Error(response.error || 'Failed to toggle price alert');
      }
    } catch (err: any) {
      console.error('❌ Error toggling price alert:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update price alert. Please try again.",
      });
      return false;
    } finally {
      setActionLoading(null);
    }
  }, [api, toast]);

  // Toggle wishlist status (add/remove)
  const toggleWishlist = useCallback(async (carId: string) => {
    const inWishlist = isInWishlist(carId);
    
    if (inWishlist) {
      return await removeFromWishlist(carId);
    } else {
      return await addToWishlist(carId);
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

  // Initialize wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    // Data
    wishlist,
    stats,
    loading,
    error,
    actionLoading,
    
    // Computed values
    isInWishlist,
    isEmpty: wishlist.length === 0,
    count: wishlist.length,
    
    // Actions
    addToWishlist,
    removeFromWishlist,
    removeMultipleFromWishlist,
    togglePriceAlert,
    toggleWishlist,
    refetch: fetchWishlist,
  };
};