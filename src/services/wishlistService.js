// src/services/wishlistService.js
import { apiClient } from "@/services/api";

class WishlistService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.batchQueue = new Set();
    this.batchTimeout = null;
    this.BATCH_DELAY = 100; // 100ms delay before batching
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
  }

  // Main method to check wishlist status
  async checkWishlistStatus(carId) {
    // Check cache first
    const cached = this.getCachedResult(carId);
    if (cached) {
      return cached;
    }

    // Check if there's already a pending request for this car
    if (this.pendingRequests.has(carId)) {
      return this.pendingRequests.get(carId);
    }

    // Add to batch queue and create promise
    const promise = new Promise((resolve, reject) => {
      this.batchQueue.add({
        carId,
        resolve,
        reject,
      });
    });

    this.pendingRequests.set(carId, promise);
    this.scheduleBatch();

    return promise;
  }

  // Check multiple car IDs at once
  async checkMultipleWishlistStatus(carIds) {
    if (!Array.isArray(carIds) || carIds.length === 0) {
      return {};
    }

    // Filter out cached results
    const uncachedIds = carIds.filter((id) => !this.getCachedResult(id));
    const results = {};

    // Get cached results
    carIds.forEach((id) => {
      const cached = this.getCachedResult(id);
      if (cached) {
        results[id] = cached;
      }
    });

    // If all results are cached, return immediately
    if (uncachedIds.length === 0) {
      return results;
    }

    try {
      // Make batch API call for uncached IDs
      const response = await apiClient.post("/api/wishlist/check-multiple", {
        carIds: uncachedIds,
      });

      if (response.data.success) {
        const batchResults = response.data.data;

        // Cache and merge results
        Object.entries(batchResults).forEach(([carId, data]) => {
          this.setCachedResult(carId, data);
          results[carId] = data;
        });
      }

      return results;
    } catch (error) {
      console.error("Error checking multiple wishlist status:", error);

      // Return cached results even if API fails
      return results;
    }
  }

  // Schedule batch processing
  scheduleBatch() {
    if (this.batchTimeout) {
      return;
    }

    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, this.BATCH_DELAY);
  }

  // Process queued requests in batch
  async processBatch() {
    const currentQueue = Array.from(this.batchQueue);
    this.batchQueue.clear();
    this.batchTimeout = null;

    if (currentQueue.length === 0) {
      return;
    }

    const carIds = currentQueue.map((item) => item.carId);

    try {
      const results = await this.checkMultipleWishlistStatus(carIds);

      // Resolve all promises
      currentQueue.forEach(({ carId, resolve }) => {
        const result = results[carId] || { inWishlist: false, addedAt: null };
        resolve(result);
        this.pendingRequests.delete(carId);
      });
    } catch (error) {
      // Reject all promises
      currentQueue.forEach(({ carId, reject }) => {
        reject(error);
        this.pendingRequests.delete(carId);
      });
    }
  }

  // Cache management
  getCachedResult(carId) {
    const cached = this.cache.get(carId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    if (cached) {
      this.cache.delete(carId);
    }

    return null;
  }

  setCachedResult(carId, data) {
    this.cache.set(carId, {
      data,
      timestamp: Date.now(),
    });
  }

  // Clear cache (useful for logout or manual refresh)
  clearCache() {
    this.cache.clear();
    this.pendingRequests.clear();
    this.batchQueue.clear();

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }

  // Add to wishlist (with cache update)
  async addToWishlist(carId) {
    try {
      const response = await apiClient.post("/api/wishlist/add", { carId });

      if (response.data.success) {
        // Update cache immediately
        this.setCachedResult(carId, {
          inWishlist: true,
          addedAt: new Date().toISOString(),
        });
      }

      return response.data;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      throw error;
    }
  }

  // Remove from wishlist (with cache update)
  async removeFromWishlist(carId) {
    try {
      const response = await apiClient.post("/api/wishlist/remove", { carId });

      if (response.data.success) {
        // Update cache immediately
        this.setCachedResult(carId, {
          inWishlist: false,
          addedAt: null,
        });
      }

      return response.data;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const wishlistService = new WishlistService();

// React hook for easier component integration
import { useState, useEffect } from "react";
import { useUserAuth } from "@/contexts/UserAuthContext";

export const useWishlistStatus = (carId) => {
  const [status, setStatus] = useState({ inWishlist: false, addedAt: null });
  const [loading, setLoading] = useState(true);
  const { user } = useUserAuth();

  useEffect(() => {
    if (!user || !carId) {
      setStatus({ inWishlist: false, addedAt: null });
      setLoading(false);
      return;
    }

    let mounted = true;

    const checkStatus = async () => {
      try {
        const result = await wishlistService.checkWishlistStatus(carId);
        if (mounted) {
          setStatus(result);
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error);
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
  }, [carId, user]);

  return { ...status, loading };
};

// Hook for multiple cars (useful for car listings)
export const useMultipleWishlistStatus = (carIds) => {
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useUserAuth();

  useEffect(() => {
    if (!user || !carIds || carIds.length === 0) {
      setStatuses({});
      setLoading(false);
      return;
    }

    let mounted = true;

    const checkStatuses = async () => {
      try {
        const results = await wishlistService.checkMultipleWishlistStatus(
          carIds
        );
        if (mounted) {
          setStatuses(results);
        }
      } catch (error) {
        console.error("Error checking multiple wishlist statuses:", error);
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
  }, [carIds, user]);

  return { statuses, loading };
};
