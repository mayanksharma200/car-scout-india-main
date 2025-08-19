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
const ACCESS_TOKEN_KEY = "user_access_token";

// Cookie utilities for secure storage
const cookieUtils = {
  set: (
    name: string,
    value: string,
    options: {
      maxAge?: number;
      expires?: Date;
      secure?: boolean;
      sameSite?: "strict" | "lax" | "none";
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

// Cookie-only storage wrapper
const cookieStorage = {
  getItem: (key: string): string | null => {
    const value = cookieUtils.get(key);
    console.log(
      `🍪 Retrieved from cookie [${key}]:`,
      value ? "Found" : "Not found"
    );
    return value;
  },

  setItem: (key: string, value: string): void => {
    console.log(`🍪 Storing in cookie [${key}]`);
    cookieUtils.set(key, value, {
      maxAge: 7 * 24 * 60 * 60, // 7 days
      secure: window.location.protocol === "https:",
      sameSite: "lax",
    });
  },

  removeItem: (key: string): void => {
    console.log(`🍪 Removing cookie [${key}]`);
    cookieUtils.remove(key);
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

  // Save tokens and user data to cookies
  const saveTokens = useCallback((tokenData: TokenData, userData: any) => {
    try {
      console.log("💾 Saving tokens and user data to cookies...");

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

      // Store user data and access token in cookies
      cookieStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
      cookieStorage.setItem(
        ACCESS_TOKEN_KEY,
        JSON.stringify(enhancedTokenData)
      );

      setTokens(enhancedTokenData);
      setUser(normalizedUser);

      console.log("✅ User session saved to cookies");
      console.log("📋 Saved user:", normalizedUser);
      console.log("🔑 Token expires at:", new Date(expiresAt).toISOString());
    } catch (error) {
      console.error("Failed to save tokens:", error);
    }
  }, []);

  const clearTokens = useCallback(() => {
    try {
      console.log("🧹 Clearing user session from cookies...");

      // Clear all auth-related cookies
      cookieStorage.removeItem(USER_STORAGE_KEY);
      cookieStorage.removeItem(ACCESS_TOKEN_KEY);
      cookieStorage.removeItem("refreshToken");
      cookieStorage.removeItem("userRefreshToken");
      cookieStorage.removeItem("hasRefreshToken"); // Clear the indicator cookie

      setTokens(null);
      setUser(null);

      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }

      console.log("✅ User session cleared from cookies");
    } catch (error) {
      console.error("Failed to clear tokens:", error);
      // Fallback to memory-only clearing
      setTokens(null);
      setUser(null);
    }
  }, []);

  const getStoredUser = useCallback((): User | null => {
    try {
      const storedUser = cookieStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        console.log("📋 Retrieved stored user from cookie:", parsed);
        return parsed;
      }
      console.log("📋 No stored user found in cookies");
      return null;
    } catch (error) {
      console.error("Failed to retrieve stored user from cookies:", error);
      return null;
    }
  }, []);

  const getStoredTokens = useCallback((): TokenData | null => {
    try {
      const storedTokens = cookieStorage.getItem(ACCESS_TOKEN_KEY);
      if (storedTokens) {
        const parsed = JSON.parse(storedTokens);
        console.log("🔑 Retrieved stored tokens from cookie");
        return parsed;
      }
      console.log("🔑 No stored tokens found in cookies");
      return null;
    } catch (error) {
      console.error("Failed to retrieve stored tokens from cookies:", error);
      return null;
    }
  }, []);

  // Check if we have any refresh token available (including httpOnly)
  const hasRefreshToken = useCallback((): boolean => {
    // In production, check for the indicator cookie
    const hasIndicator = !!cookieUtils.get("hasRefreshToken");

    // In development, check for the actual refresh token
    const hasDevToken = !!cookieUtils.get("userRefreshToken");

    // Also check if any refresh token exists in document.cookie string
    const hasHttpOnlyToken = document.cookie.includes("refreshToken=");

    const hasToken = hasIndicator || hasDevToken || hasHttpOnlyToken;
    console.log("🍪 Refresh token available:", hasToken ? "Yes" : "No", {
      hasIndicator,
      hasDevToken,
      hasHttpOnlyToken,
    });
    return hasToken;
  }, []);

  // Check if access token is expired or will expire soon
  const isTokenExpired = useCallback((): boolean => {
    if (!tokens?.expiresAt) {
      console.log("⏰ No token expiration time found");
      return true;
    }

    const isExpired = Date.now() >= tokens.expiresAt - REFRESH_THRESHOLD;
    if (isExpired) {
      console.log("⏰ Token is expired or will expire soon");
    }
    return isExpired;
  }, [tokens]);

  // Refresh access token
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    if (refreshPromise.current) {
      console.log("🔄 Token refresh already in progress, waiting...");
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
          console.error(
            "Token refresh failed:",
            response.status,
            response.statusText
          );

          // If refresh fails, clear session
          if (response.status === 401) {
            console.log("🧹 Clearing session due to refresh failure");
            clearTokens();
          }

          return false;
        }

        const result = await response.json();
        console.log("🔄 Refresh response:", result);

        if (result.success && result.data) {
          console.log("✅ User tokens refreshed successfully");
          const userData = getStoredUser();
          if (userData) {
            saveTokens(result.data, userData);
            scheduleTokenRefresh(result.data.expiresIn);
            return true;
          } else {
            console.error("❌ No stored user data found for token refresh");
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
      console.log("🔐 Login response:", result);

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
        console.log("🔄 Initializing user authentication from cookies...");

        const userData = getStoredUser();
        const tokenData = getStoredTokens();

        console.log("📋 Found stored user:", userData ? "Yes" : "No");
        console.log("🔑 Found stored tokens:", tokenData ? "Yes" : "No");

        if (userData && tokenData) {
          setUser(userData);
          setTokens(tokenData);

          // Check if we have any refresh token available (including httpOnly)
          const hasRefresh = hasRefreshToken();

          if (hasRefresh) {
            // Check if token is still valid
            const isExpired = tokenData.expiresAt
              ? Date.now() >= tokenData.expiresAt - REFRESH_THRESHOLD
              : true;

            if (isExpired) {
              console.log("🔄 Token expired, attempting to refresh...");
              const refreshed = await refreshTokens();
              if (!refreshed) {
                console.log("❌ Token refresh failed, clearing user session");
                clearTokens();
              } else {
                console.log("✅ Session restored successfully after refresh");
              }
            } else {
              console.log("✅ Valid session restored from cookies");
              // Schedule next refresh
              const timeToExpiry = tokenData.expiresAt - Date.now();
              scheduleTokenRefresh(Math.floor(timeToExpiry / 1000));
            }
          } else {
            console.log("❌ No refresh token found, clearing user session");
            clearTokens();
          }
        } else {
          console.log("📋 No valid session found in cookies");
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
  }, [
    clearTokens,
    getStoredUser,
    getStoredTokens,
    refreshTokens,
    scheduleTokenRefresh,
    hasRefreshToken,
  ]);

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
