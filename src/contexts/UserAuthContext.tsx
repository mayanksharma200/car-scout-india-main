import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  emailVerified: boolean;
}

interface TokenData {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  expiresAt?: number;
}

interface UserAuthContextType {
  user: User | null;
  tokens: TokenData | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  getAuthHeaders: () => Record<string, string>;
  isTokenExpired: () => boolean;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined
);

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
};

const REFRESH_THRESHOLD = 2 * 60 * 1000; // Refresh token 2 minutes before expiry
const USER_STORAGE_KEY = "user_auth_user";

// Safe localStorage wrapper - fallback to memory storage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn("localStorage access denied, using memory storage");
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn("localStorage access denied, using memory storage");
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("localStorage access denied, using memory storage");
    }
  },
};

export const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const refreshPromise = useRef<Promise<boolean> | null>(null);

  const backendUrl =
    import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  // Secure storage for access token (in-memory only)
  const saveTokens = useCallback((tokenData: TokenData, userData: User) => {
    try {
      // Calculate actual expiry time
      const expiryTime = Date.now() + tokenData.expiresIn * 1000;
      const tokensWithExpiry = {
        ...tokenData,
        expiresAt: expiryTime,
      };

      // Store user data in localStorage (contains no sensitive info)
      safeLocalStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      setTokens(tokensWithExpiry);
      setUser(userData);
    } catch (error) {
      console.error("Failed to save tokens:", error);
      // Fallback to memory-only storage
      setTokens({
        ...tokenData,
        expiresAt: Date.now() + tokenData.expiresIn * 1000,
      });
      setUser(userData);
    }
  }, []);

  const clearTokens = useCallback(() => {
    try {
      safeLocalStorage.removeItem(USER_STORAGE_KEY);
      setTokens(null);
      setUser(null);

      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }

      // Clear the refresh token cookie by setting an expired cookie
      document.cookie = `userRefreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Strict`;
    } catch (error) {
      console.error("Failed to clear tokens:", error);
      // Fallback to memory-only clearing
      setTokens(null);
      setUser(null);
    }
  }, []);

  const getStoredUser = useCallback((): User | null => {
    try {
      const storedUser = safeLocalStorage.getItem(USER_STORAGE_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to retrieve stored user:", error);
      return null;
    }
  }, []);

  // Get refresh token from cookies
  const getRefreshToken = useCallback((): string | null => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userRefreshToken="))
      ?.split("=")[1];
    return cookieValue || null;
  }, []);

  // Check if access token is expired or will expire soon
  const isTokenExpired = useCallback((): boolean => {
    if (!tokens?.expiresAt) return true;
    return Date.now() >= tokens.expiresAt - REFRESH_THRESHOLD;
  }, [tokens]);

  // Refresh access token using refresh token from cookie
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    if (refreshPromise.current) {
      return refreshPromise.current;
    }

    const refreshOperation = async (): Promise<boolean> => {
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          console.log("No refresh token available");
          return false;
        }

        console.log("🔄 Refreshing user access token...");

        const response = await fetch(`${backendUrl}/auth/refresh`, {
          method: "POST",
          credentials: "include", // Important for cookies
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          console.error("Token refresh failed:", response.status);
          return false;
        }

        const result = await response.json();

        if (result.success && result.data) {
          console.log("✅ User tokens refreshed successfully");
          const userData = getStoredUser();
          if (userData) {
            saveTokens(result.data, userData);
            scheduleTokenRefresh(result.data.expiresIn);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error("Token refresh error:", error);
        return false;
      } finally {
        refreshPromise.current = null;
      }
    };

    refreshPromise.current = refreshOperation();
    return refreshPromise.current;
  }, [backendUrl, getRefreshToken, getStoredUser, saveTokens]);

  // Schedule automatic token refresh
  const scheduleTokenRefresh = useCallback(
    (expiresIn: number) => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }

      const refreshTime = Math.max(0, expiresIn * 1000 - REFRESH_THRESHOLD);

      refreshTimer.current = setTimeout(() => {
        console.log("⏰ Automatic user token refresh triggered");
        refreshTokens();
      }, refreshTime);

      console.log(
        `🕐 User token refresh scheduled in ${Math.round(
          refreshTime / 1000
        )} seconds`
      );
    },
    [refreshTokens]
  );

  // Get authentication headers for API calls
  const getAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (tokens?.accessToken) {
      headers.Authorization = `${tokens.tokenType} ${tokens.accessToken}`;
    }

    return headers;
  }, [tokens]);

  // Login function for regular users
  const login = async (
    email: string,
    password: string,
    rememberMe = false
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("🔐 Attempting user login...");
      setLoading(true);

      const response = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        credentials: "include", // Important for cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const result = await response.json();

      console.log("User login response:", result);

      if (!response.ok || !result.success) {
        return {
          success: false,
          error: result.error || "Login failed",
        };
      }

      // Access the data structure correctly
      const tokenData = {
        accessToken: result.data.accessToken,
        expiresIn: result.data.expiresIn,
        tokenType: result.data.tokenType || "Bearer",
      };

      // Use the correct data structure
      saveTokens(tokenData, result.data.user);
      scheduleTokenRefresh(result.data.expiresIn);

      console.log("✅ User login successful");
      return { success: true };
    } catch (error: any) {
      console.error("User login error:", error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Notify backend to invalidate tokens
      await fetch(`${backendUrl}/auth/logout`, {
        method: "POST",
        credentials: "include", // Important for cookies
        headers: getAuthHeaders(),
      }).catch((error) => console.warn("Logout API call failed:", error));
    } finally {
      clearTokens();
      console.log("✅ User logged out successfully");
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = getStoredUser();
        const refreshToken = getRefreshToken();

        if (userData && refreshToken) {
          setUser(userData);

          // Attempt to refresh tokens
          console.log("Found existing user session, attempting refresh...");
          const refreshed = await refreshTokens();
          if (!refreshed) {
            console.log("Token refresh failed, clearing user session");
            clearTokens();
          }
        }
      } catch (error) {
        console.error("User auth initialization error:", error);
        clearTokens();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [clearTokens, getRefreshToken, getStoredUser, refreshTokens]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }
    };
  }, []);

  const value: UserAuthContextType = {
    user,
    tokens,
    isAuthenticated: !!user && !!tokens,
    loading,
    login,
    logout,
    refreshTokens,
    getAuthHeaders,
    isTokenExpired,
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
};

// HOC for authenticated requests
export const withUserAuth = (WrappedComponent: React.ComponentType<any>) => {
  return (props: any) => {
    const { isAuthenticated, loading } = useUserAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }

    return <WrappedComponent {...props} />;
  };
};

// Custom hook for authenticated API calls
export const useUserAuthenticatedFetch = () => {
  const { getAuthHeaders, isTokenExpired, refreshTokens } = useUserAuth();
  const backendUrl =
    import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  return useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      // Check and refresh token if needed
      if (isTokenExpired()) {
        const refreshed = await refreshTokens();
        if (!refreshed) {
          throw new Error("Authentication failed - please log in again");
        }
      }

      const url = endpoint.startsWith("http")
        ? endpoint
        : `${backendUrl}${endpoint}`;
      const headers = getAuthHeaders();

      return fetch(url, {
        ...options,
        credentials: "include", // Important for cookies
        headers: {
          ...headers,
          ...options.headers,
        },
      });
    },
    [backendUrl, getAuthHeaders, isTokenExpired, refreshTokens]
  );
};
