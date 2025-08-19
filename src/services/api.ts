// src/services/api.ts
// Updated API service with proper TypeScript types

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Log the API configuration
console.log('🔧 API Configuration:', {
  baseUrl: API_BASE_URL,
  environment: import.meta.env.MODE
});

// Helper for API calls
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Helper for authenticated API calls
async function fetchAuthenticatedAPI(endpoint: string, options: RequestInit = {}) {
  // This will be handled by the useAuthenticatedApi hook
  return fetchAPI(endpoint, options);
}

// Car API endpoints
export const carAPI = {
  // Get all cars with optional filters
  getAll: async (params?: {
    status?: string;
    brand?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return fetchAPI(`/cars${queryString}`);
  },

  // Get featured cars for homepage
  getFeatured: async () => {
    return fetchAPI('/cars/featured');
  },

  // Get single car by ID
  getById: async (id: string) => {
    return fetchAPI(`/cars/${id}`);
  },

  // Search cars
  search: async (query: string) => {
    return fetchAPI(`/cars/search?q=${encodeURIComponent(query)}`);
  },
};

// Wishlist API endpoints (require authentication)
export const wishlistAPI = {
  // Get user's wishlist
  getAll: async () => {
    return fetchAuthenticatedAPI('/wishlist');
  },

  // Add car to wishlist
  add: async (carId: string) => {
    return fetchAuthenticatedAPI('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ carId }),
    });
  },

  // Remove car from wishlist
  remove: async (carId: string) => {
    return fetchAuthenticatedAPI(`/wishlist/${carId}`, {
      method: 'DELETE',
    });
  },

  // Remove multiple cars from wishlist
  removeMultiple: async (carIds: string[]) => {
    return fetchAuthenticatedAPI('/wishlist', {
      method: 'DELETE',
      body: JSON.stringify({ carIds }),
    });
  },

  // Toggle price alert for a car
  togglePriceAlert: async (carId: string, enabled: boolean) => {
    return fetchAuthenticatedAPI(`/wishlist/${carId}/price-alert`, {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  },

  // Check if car is in wishlist
  check: async (carId: string) => {
    return fetchAuthenticatedAPI(`/wishlist/check/${carId}`);
  },

  // Get wishlist statistics
  getStats: async () => {
    return fetchAuthenticatedAPI('/wishlist/stats');
  },
};

// Lead API endpoints
export const leadAPI = {
  // Create a new lead
  create: async (leadData: {
    name: string;
    email: string;
    phone: string;
    interested_car_id?: string;
    budget_min?: number;
    budget_max?: number;
    city?: string;
    timeline?: string;
  }) => {
    return fetchAPI('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  },
};

// Authentication API endpoints
export const authAPI = {
  // Login with email and password
  login: async (email: string, password: string, rememberMe?: boolean) => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });
  },

  // Signup with email and password
  signup: async (email: string, password: string, userData?: any) => {
    return fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, userData }),
    });
  },

  // Logout
  logout: async () => {
    return fetchAPI('/auth/logout', {
      method: 'POST',
    });
  },

  // Supabase logout
  supabaseLogout: async () => {
    return fetchAPI('/auth/supabase-logout', {
      method: 'POST',
    });
  },

  // Refresh tokens
  refreshTokens: async () => {
    return fetchAPI('/auth/refresh', {
      method: 'POST',
    });
  },

  // Verify token
  verify: async () => {
    return fetchAuthenticatedAPI('/auth/verify');
  },

  // Google OAuth conversion
  googleOAuth: async (supabaseUserId: string, email: string, userData: any) => {
    return fetchAPI('/auth/google-oauth', {
      method: 'POST',
      body: JSON.stringify({ supabaseUserId, email, userData }),
    });
  },

  // Google OAuth redirect URL
  getGoogleOAuthUrl: () => {
    return `${API_BASE_URL}/auth/google`;
  },
};

// User API endpoints (require authentication)
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return fetchAuthenticatedAPI('/user/profile');
  },

  // Update user profile
  updateProfile: async (profileData: any) => {
    return fetchAuthenticatedAPI('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Health check
export const healthCheck = async () => {
  return fetchAPI('/health');
};

// Types for the API client
export interface ApiClient {
  cars: {
    getAll: (params?: any) => Promise<any>;
    getFeatured: () => Promise<any>;
    getById: (id: string) => Promise<any>;
    search: (query: string) => Promise<any>;
  };
  wishlist: {
    getAll: () => Promise<any>;
    add: (carId: string) => Promise<any>;
    remove: (carId: string) => Promise<any>;
    removeMultiple: (carIds: string[]) => Promise<any>;
    togglePriceAlert: (carId: string, enabled: boolean) => Promise<any>;
    check: (carId: string) => Promise<any>;
    getStats: () => Promise<any>;
  };
  user: {
    getProfile: () => Promise<any>;
    updateProfile: (profileData: any) => Promise<any>;
  };
  leads: {
    create: (leadData: any) => Promise<any>;
  };
}

// Export createApiClient function for use with authentication context
export const createApiClient = ({ getAuthHeaders, isTokenExpired, refreshTokens }: {
  getAuthHeaders: () => Record<string, string>;
  isTokenExpired: () => boolean;
  refreshTokens: () => Promise<boolean>;
}): ApiClient => {
  
  const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
    // Check and refresh token if needed
    if (isTokenExpired()) {
      console.log('🔄 Token expired, refreshing...');
      const refreshed = await refreshTokens();
      if (!refreshed) {
        throw new Error('Authentication failed - please log in again');
      }
    }

    const authHeaders = getAuthHeaders();
    
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });
  };

  return {
    // Car endpoints
    cars: {
      getAll: async (params?: any) => {
        const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
        const response = await fetch(`${API_BASE_URL}/cars${queryString}`);
        return response.json();
      },
      getFeatured: async () => {
        const response = await fetch(`${API_BASE_URL}/cars/featured`);
        return response.json();
      },
      getById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/cars/${id}`);
        return response.json();
      },
      search: async (query: string) => {
        const response = await fetch(`${API_BASE_URL}/cars/search?q=${encodeURIComponent(query)}`);
        return response.json();
      },
    },

    // Authenticated wishlist endpoints
    wishlist: {
      getAll: async () => {
        const response = await makeAuthenticatedRequest('/wishlist');
        return response.json();
      },
      add: async (carId: string) => {
        const response = await makeAuthenticatedRequest('/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ carId }),
        });
        return response.json();
      },
      remove: async (carId: string) => {
        const response = await makeAuthenticatedRequest(`/wishlist/${carId}`, {
          method: 'DELETE',
        });
        return response.json();
      },
      removeMultiple: async (carIds: string[]) => {
        const response = await makeAuthenticatedRequest('/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ carIds }),
        });
        return response.json();
      },
      togglePriceAlert: async (carId: string, enabled: boolean) => {
        const response = await makeAuthenticatedRequest(`/wishlist/${carId}/price-alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled }),
        });
        return response.json();
      },
      check: async (carId: string) => {
        const response = await makeAuthenticatedRequest(`/wishlist/check/${carId}`);
        return response.json();
      },
      getStats: async () => {
        const response = await makeAuthenticatedRequest('/wishlist/stats');
        return response.json();
      },
    },

    // Authenticated user endpoints
    user: {
      getProfile: async () => {
        const response = await makeAuthenticatedRequest('/user/profile');
        return response.json();
      },
      updateProfile: async (profileData: any) => {
        const response = await makeAuthenticatedRequest('/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
        });
        return response.json();
      },
    },

    // Leads
    leads: {
      create: async (leadData: any) => {
        const response = await fetch(`${API_BASE_URL}/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData),
        });
        return response.json();
      },
    },
  };
};