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
  provider?: string;
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
  googleLogin: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  getAuthHeaders: () => Record<string, string>;
  isTokenExpired: () => boolean;
  saveTokens: (tokenData: TokenData, userData: any) => void;
  clearTokens: () => void;
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

// Enhanced cookie utilities for secure storage
const cookieUtils = {
  set: (
    name: string,
    value: string,
    options: {
      maxAge?: number;
      expires?: Date;
      secure?: boolean;
      sameSite?: "strict" | "lax" | "none";
      httpOnly?: boolean;
      path?: string;
    } = {}
  ) => {
    try {
      const {
        maxAge,
        expires,
        secure = window.location.protocol === "https:",
        sameSite = "lax",
        path = "/",
      } = options;

      let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(
        value
      )}`;

      if (maxAge !== undefined) {
        cookieString += `; Max-Age=${maxAge}`;
      }

      if (expires) {
        cookieString += `; Expires=${expires.toUTCString()}`;
      }

      if (secure) {
        cookieString += `; Secure`;
      }

      cookieString += `; SameSite=${sameSite}`;
      cookieString += `; Path=${path}`;

      document.cookie = cookieString;
      console.log(`🍪 Cookie set: ${name}`);
    } catch (error) {
      console.warn("Failed to set cookie:", error);
    }
  },

  get: (name: string): string | null => {
    try {
      const value = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${encodeURIComponent(name)}=`))
        ?.split("=")[1];

      return value ? decodeURIComponent(value) : null;
    } catch (error) {
      console.warn("Failed to get cookie:", error);
      return null;
    }
  },

  remove: (name: string, path: string = "/") => {
    try {
      document.cookie = `${encodeURIComponent(
        name
      )}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      console.log(`🍪 Cookie removed: ${name}`);
    } catch (error) {
      console.warn("Failed to remove cookie:", error);
    }
  },
};

// Safe storage wrapper that prefers cookies over localStorage
const safeStorage = {
  getItem: (key: string): string | null => {
    // First try cookies (more secure for auth data)
    const cookieValue = cookieUtils.get(key);
    if (cookieValue) {
      return cookieValue;
    }

    // Fallback to localStorage for development
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn("Storage access denied, using memory storage");
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    // Set in cookie (secure, httpOnly cookies are handled by backend)
    cookieUtils.set(key, value, {
      maxAge: 7 * 24 * 60 * 60, // 7 days
      secure: window.location.protocol === "https:",
      sameSite: "lax",
    });

    // Also set in localStorage for development fallback
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn("localStorage access denied, using cookies only");
    }
  },

  removeItem: (key: string): void => {
    cookieUtils.remove(key);

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("localStorage access denied, cookies cleared only");
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
  const initializationPromise = useRef<Promise<void> | null>(null);

  const backendUrl =
    import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  // Secure storage for access token and user data
  const saveTokens = useCallback((tokenData: TokenData, userData: any) => {
    try {
      // Calculate expiration time
      const expiresAt = Date.now() + tokenData.expiresIn * 1000;
      const enhancedTokenData = { ...tokenData, expiresAt };

      // Normalize user data structure
      const normalizedUser: User = {
        id: userData.id || userData.sub || "",
        email: userData.email || "",
        firstName:
          userData.firstName ||
          userData.given_name ||
          userData.name?.split(" ")[0] ||
          userData.email?.split("@")[0],
        lastName:
          userData.lastName ||
          userData.family_name ||
          userData.name?.split(" ")[1] ||
          "",
        role: userData.role || "user",
        emailVerified:
          userData.emailVerified || userData.email_verified || false,
        provider: userData.provider || "email",
      };

      // Store user data securely
      safeStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
      setTokens(enhancedTokenData);
      setUser(normalizedUser);

      console.log("✅ User session saved securely");
    } catch (error) {
      console.error("Failed to save tokens:", error);
    }
  }, []);

  const clearTokens = useCallback(() => {
    try {
      // Clear all auth-related storage
      safeStorage.removeItem(USER_STORAGE_KEY);

      // Clear refresh token cookie (backend will also clear httpOnly cookies)
      cookieUtils.remove("refreshToken");
      cookieUtils.remove("userRefreshToken");

      setTokens(null);
      setUser(null);

      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }

      console.log("✅ User session cleared");
    } catch (error) {
      console.error("Failed to clear tokens:", error);
      // Fallback to memory-only clearing
      setTokens(null);
      setUser(null);
    }
  }, []);

  const getStoredUser = useCallback((): User | null => {
    try {
      const storedUser = safeStorage.getItem(USER_STORAGE_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to retrieve stored user:", error);
      return null;
    }
  }, []);

  // Get refresh token from cookies (backend handles httpOnly cookies)
  const getRefreshToken = useCallback((): string | null => {
    // Check for client-side accessible refresh token cookie
    return (
      cookieUtils.get("userRefreshToken") || cookieUtils.get("refreshToken")
    );
  }, []);

  // Check if access token is expired or will expire soon
  const isTokenExpired = useCallback((): boolean => {
    if (!tokens?.expiresAt) return true;
    return Date.now() >= tokens.expiresAt - REFRESH_THRESHOLD;
  }, [tokens]);

  // Refresh access token
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    if (refreshPromise.current) {
      return refreshPromise.current;
    }

    const refreshOperation = async (): Promise<boolean> => {
      try {
        console.log("🔄 Refreshing user access token...");

        const response = await fetch(`${backendUrl}/auth/refresh`, {
          method: "POST",
          credentials: "include", // Important for httpOnly cookies
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          console.error("Token refresh failed:", response.status);

          // If refresh fails, clear session
          if (response.status === 401) {
            clearTokens();
          }

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
  }, [backendUrl, getStoredUser, saveTokens, clearTokens]);

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

  // Google login placeholder
  const googleLogin = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      setLoading(true);
      window.location.href = `${backendUrl}/auth/google`;
      return { success: true };
    } catch (error: any) {
      console.error("Google login error:", error);
      return {
        success: false,
        error: error.message || "Google login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Login function
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

      if (!response.ok || !result.success) {
        return {
          success: false,
          error: result.error || "Login failed",
        };
      }

      // Save tokens and user data
      const tokenData = {
        accessToken: result.data.accessToken,
        expiresIn: result.data.expiresIn,
        tokenType: result.data.tokenType || "Bearer",
      };

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
      console.log("🔐 Logging out user...");

      // Determine logout endpoint based on user provider
      const isSupabaseUser =
        user?.provider === "google" ||
        (tokens?.accessToken &&
          (tokens.accessToken.startsWith("sbp_") ||
            tokens.accessToken.includes(".")));

      let logoutUrl = `${backendUrl}/auth/logout`;
      if (isSupabaseUser) {
        logoutUrl = `${backendUrl}/auth/supabase-logout`;
      }

      // Notify backend to invalidate tokens
      await fetch(logoutUrl, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
      }).catch((error) => console.warn("Logout API call failed:", error));

      // If Supabase user, also sign out from Supabase client
      if (isSupabaseUser) {
        try {
          const { supabase } = await import("@/integrations/supabase/client");
          await supabase.auth.signOut();
        } catch (supabaseError) {
          console.warn("Supabase client sign out failed:", supabaseError);
        }
      }
    } finally {
      clearTokens();
      console.log("✅ User logged out successfully");
    }
  };

  // Initialize authentication state on mount
  useEffect(() => {
    if (initializationPromise.current) {
      return;
    }

    const initializeAuth = async () => {
      try {
        console.log("🔄 Initializing user authentication...");

        const userData = getStoredUser();
        console.log("📋 Found stored user:", userData ? "Yes" : "No");

        if (userData) {
          setUser(userData);

          // Check if we have a valid refresh token
          const hasRefreshToken =
            getRefreshToken() ||
            document.cookie.includes("refreshToken=") ||
            document.cookie.includes("userRefreshToken=");

          console.log("🍪 Has refresh token:", hasRefreshToken ? "Yes" : "No");

          if (hasRefreshToken) {
            // Attempt to refresh tokens
            console.log("🔄 Attempting to refresh session...");
            const refreshed = await refreshTokens();
            if (!refreshed) {
              console.log("❌ Token refresh failed, clearing user session");
              clearTokens();
            } else {
              console.log("✅ Session restored successfully");
            }
          } else {
            console.log("❌ No refresh token found, clearing user session");
            clearTokens();
          }
        } else {
          console.log("📋 No stored user found");
        }
      } catch (error) {
        console.error("User auth initialization error:", error);
        clearTokens();
      } finally {
        setLoading(false);
        console.log("✅ User authentication initialization complete");
      }
    };

    initializationPromise.current = initializeAuth();
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
    googleLogin,
    logout,
    refreshTokens,
    getAuthHeaders,
    isTokenExpired,
    saveTokens,
    clearTokens,
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
