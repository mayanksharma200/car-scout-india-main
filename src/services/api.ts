// src/services/api.ts
// Simple API service for frontend - no localStorage needed!

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper for API calls
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
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

// Health check
export const healthCheck = async () => {
  return fetchAPI('/health');
};