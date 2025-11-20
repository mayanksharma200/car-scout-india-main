// utils/apiClient.ts - Enhanced API Client with Cookie Support

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

interface FetchOptions extends RequestInit {
  skipAuthRefresh?: boolean;
  timeout?: number;
}

class ApiClient {
  private config: ApiClientConfig;
  private authRefreshPromise: Promise<boolean> | null = null;
  private getAuthHeaders: (() => HeadersInit) | null = null; // Changed this line
  private isTokenExpired: (() => boolean) | null = null;
  private refreshTokens: (() => Promise<boolean>) | null = null;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000, // 1 second
      ...config,
    };

    console.log('🔧 API Client initialized with baseURL:', this.config.baseURL);
  }

  // Initialize with auth context methods
  initializeAuth(authMethods: {
  getAuthHeaders: () => HeadersInit; // Changed from Record<string, string>
    isTokenExpired: () => boolean;
    refreshTokens: () => Promise<boolean>;
  }) {
  this.getAuthHeaders = authMethods.getAuthHeaders;
  this.isTokenExpired = authMethods.isTokenExpired;
  this.refreshTokens = authMethods.refreshTokens;
  console.log('🔐 API Client auth methods initialized');
  }

  // Create timeout promise
  private createTimeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms);
    });
  }

  // Sleep utility for retries
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

// Enhanced fetch with authentication and retry logic
private async enhancedFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    skipAuthRefresh = false,
    timeout = this.config.timeout,
    ...fetchOptions
  } = options;

  // Prepare URL
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${this.config.baseURL}${endpoint}`;

  // Fix: Use HeadersInit type instead of Record<string, string>
  let headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add authentication headers if available and not explicitly skipped
  if (!skipAuthRefresh && this.getAuthHeaders && this.isTokenExpired && this.refreshTokens) {
    // Check if token needs refresh
    if (this.isTokenExpired()) {
      if (!this.authRefreshPromise) {
        console.log('🔄 Token expired, refreshing...');
        this.authRefreshPromise = this.refreshTokens();
      }
      
      const refreshed = await this.authRefreshPromise;
      this.authRefreshPromise = null;
      
      if (!refreshed) {
        throw new Error('Authentication failed - please log in again');
      }
    }

    // Get fresh auth headers
    const authHeaders = this.getAuthHeaders();
    headers = { ...headers, ...authHeaders };
  }

  // Prepare fetch options
  const finalOptions: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: 'include', // Always include credentials for cookie support
  };

    // Create fetch promise with timeout
    const fetchPromise = fetch(url, finalOptions);
    const timeoutPromise = this.createTimeoutPromise(timeout);

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Check for HTTP errors
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      (error as any).status = response.status;
      (error as any).statusText = response.statusText;
      throw error;
    }

    return response;
  }

  // Main request method with retry logic
  async request<T = any>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    let lastError: Error;
    let attempt = 0;

    while (attempt < this.config.retryAttempts) {
      try {
        attempt++;
        console.log(`🌐 API Request [${attempt}/${this.config.retryAttempts}]:`, 
          options.method || 'GET', endpoint);

        const response = await this.enhancedFetch(endpoint, options);
        const data = await response.json();

        console.log(`✅ API Response [${attempt}]:`, {
          success: data.success,
          hasData: !!data.data,
          error: data.error
        });

        return data;
      } catch (error: any) {
        lastError = error;
        console.warn(`❌ API Request failed [${attempt}/${this.config.retryAttempts}]:`, 
          error.message);

        // Don't retry on authentication errors or client errors (4xx)
        if (error.status >= 400 && error.status < 500) {
          break;
        }

        // Don't retry on the last attempt
        if (attempt >= this.config.retryAttempts) {
          break;
        }

        // Wait before retrying
        await this.sleep(this.config.retryDelay * attempt);
      }
    }

    // If we get here, all attempts failed
    console.error(`💥 API Request failed after ${this.config.retryAttempts} attempts:`, lastError);
    
    return {
      success: false,
      error: lastError.message || 'Network request failed',
      code: 'NETWORK_ERROR'
    };
  }

  // Convenience methods for different HTTP verbs
  async get<T = any>(endpoint: string, options: Omit<FetchOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, options: Omit<FetchOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any, options: Omit<FetchOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, options: Omit<FetchOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Specific API endpoints
  auth = {
    login: (email: string, password: string, rememberMe = false) =>
      this.post<{
        user: any;
        accessToken: string;
        refreshToken?: string;
        expiresIn: number;
        tokenType: string;
      }>('/auth/login', { email, password, rememberMe }, { skipAuthRefresh: true }),

    register: (userData: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }) =>
      this.post<{ user: any; message: string }>('/auth/signup', userData, { skipAuthRefresh: true }),

    logout: () =>
      this.post('/auth/logout'),

    supabaseLogout: () =>
      this.post('/auth/supabase-logout'),

    refreshToken: () =>
      this.post<{
        accessToken: string;
        expiresIn: number;
        tokenType: string;
      }>('/auth/refresh', {}, { skipAuthRefresh: true }),

    verify: () =>
      this.get<{ user: any; message: string }>('/auth/verify'),

    googleOAuth: (userData: {
      supabaseUserId: string;
      email: string;
      userData: any;
    }) =>
      this.post<{
        user: any;
        accessToken: string;
        refreshToken?: string;
        expiresIn: number;
        tokenType: string;
      }>('/auth/google-oauth', userData, { skipAuthRefresh: true }),

    supabaseToken: (userData: {
      supabaseUserId: string;
      email: string;
      userData: any;
    }) =>
      this.post<{
        user: any;
        accessToken: string;
        expiresIn: number;
        tokenType: string;
      }>('/auth/supabase-token', userData, { skipAuthRefresh: true }),
  };

  cars = {
    getFeatured: () =>
      this.get<any[]>('/cars/featured'),

    search: (query: string, limit = 500) =>
      this.get<any[]>(`/cars/search?q=${encodeURIComponent(query)}&limit=${limit}`),

    searchAdvanced: (query: string, limit = 500) =>
      this.get<any[]>(`/cars/search-advanced?q=${encodeURIComponent(query)}&limit=${limit}`),

    searchWeighted: (query: string, limit = 500) =>
      this.get<any[]>(`/cars/search-weighted?q=${encodeURIComponent(query)}&limit=${limit}`),

    getAll: (params: {
      status?: string;
      brand?: string;
      model?: string;
      minPrice?: number;
      maxPrice?: number;
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
      return this.get<{
        data: any[];
        count: number;
        pagination: {
          offset: number;
          limit: number;
          total: number;
        };
      }>(`/cars?${searchParams.toString()}`);
    },

    getById: (id: string) =>
      this.get<any>(`/cars/${id}`),
  };

  leads = {
    create: (leadData: {
      name: string;
      email: string;
      phone: string;
      carId?: string;
      message?: string;
      source?: string;
    }) =>
      this.post<any>('/leads', leadData),
  };

user = {
  getProfile: () =>
    this.get<{
      user: any;
      profile: any;
    }>('/user/profile'),

  updateProfile: (profileData: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    date_of_birth?: string;
    gender?: string;
    city?: string;
    state?: string;
    preferences?: any;
  }) =>
    this.put<{
      data: any;
      message: string;
    }>('/user/profile', profileData),
};

  

  admin = {
    getStats: () =>
      this.get<{
        totalCars: number;
        totalLeads: number;
        totalUsers: number;
        activeSessions: number;
        environment: string;
        timestamp: string;
      }>('/admin/stats'),

    getApiSettings: () =>
      this.get<any[]>('/admin/api-settings'),

    updateApiSettings: (settings: any) =>
      this.post('/admin/api-settings', settings),

    testApiNinjas: () =>
      this.post<{
        connected: boolean;
        latency: number;
        status: string;
      }>('/admin/test-api-ninjas'),

    syncApiNinjas: () =>
      this.post<{
        newCars: number;
        updatedCars: number;
        totalCars: number;
      }>('/admin/sync-api-ninjas'),

    testCarwale: (config: { apiKey: string; baseUrl: string }) =>
      this.post<{
        connected: boolean;
        endpoints: string[];
      }>('/admin/test-carwale', config),

    syncCarwale: (config: { apiKey: string; baseUrl: string; endpoints: string[] }) =>
      this.post<{
        newCars: number;
        updatedCars: number;
        totalCars: number;
      }>('/admin/sync-carwale', config),
  };

  // Health check
  health = {
    check: () =>
      this.get<{
        status: string;
        timestamp: string;
        version: string;
        auth: string;
        environment: string;
        features: {
          rateLimiting: boolean;
          secureHeaders: boolean;
          httpOnlyCookies: boolean;
          localStorage: boolean;
        };
      }>('/health', { skipAuthRefresh: true }),
  };
}

// Create and export singleton instance
const apiClient = new ApiClient();

// Factory function to create API client with auth context
export const createApiClient = (authContext?: {
  getAuthHeaders: () => HeadersInit; // Changed type
  isTokenExpired: () => boolean;
  refreshTokens: () => Promise<boolean>;
}) => {
  if (authContext) {
    apiClient.initializeAuth(authContext);
  }
  return apiClient;
};

// Export default instance
export default apiClient;

// Export types for use in other files
export type { ApiResponse, ApiClientConfig, FetchOptions };