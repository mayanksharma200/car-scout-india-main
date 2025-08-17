// src/utils/apiClient.ts
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
}

class ApiClient {
  private config: ApiClientConfig;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseURL: config.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 1,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth = true,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${this.config.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Important for cookies
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let responseData: any;

      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        return {
          success: false,
          error: responseData.error || responseData.message || `HTTP ${response.status}`,
          code: responseData.code
        };
      }

      return typeof responseData === 'object' && responseData.success !== undefined
        ? responseData
        : { success: true, data: responseData };

    } catch (error: any) {
      console.error('API request error:', error);

      if (retryCount < this.config.retryAttempts) {
        console.log(`🔄 Retrying request (${retryCount + 1}/${this.config.retryAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.makeRequest(endpoint, options, requiresAuth, retryCount + 1);
      }

      return {
        success: false,
        error: error.message || 'Network error occurred',
        code: 'NETWORK_ERROR'
      };
    }
  }

  // GET request
  async get<T>(endpoint: string, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' }, requiresAuth);
  }

  // POST request
  async post<T>(
    endpoint: string, 
    data?: any, 
    requiresAuth = true
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      },
      requiresAuth
    );
  }

  // PUT request
  async put<T>(
    endpoint: string, 
    data?: any, 
    requiresAuth = true
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      },
      requiresAuth
    );
  }

  // DELETE request
  async delete<T>(endpoint: string, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' }, requiresAuth);
  }
}

// Simplified API client creation
export const createApiClient = () => {
  const client = new ApiClient();

  return {
    // Authentication
    auth: {
      login: (email: string, password: string, rememberMe = false) =>
        client.post('/auth/login', { email, password, rememberMe }, false),
      refresh: () => client.post('/auth/refresh', {}, false),
      logout: () => client.post('/auth/logout', {}),
    },
    // Cars
    cars: {
      getFeatured: () => client.get('/cars/featured', false),
      search: (query: string, limit?: number) =>
        client.get(`/cars/search?q=${encodeURIComponent(query)}${limit ? `&limit=${limit}` : ''}`, false),
    },
    // Add other endpoints as needed
    client,
  };
};