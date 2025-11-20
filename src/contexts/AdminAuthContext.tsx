// src/contexts/AdminAuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAdminStatus: () => Promise<boolean>;
  getAuthHeaders: () => Record<string, string>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({
  children,
}) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const backendUrl =
    import.meta.env.VITE_API_URL || "/api";

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      // Try to get session from memory/storage
      const sessionData = getStoredSession();
      if (sessionData && sessionData.access_token) {
        // Verify the session is still valid
        const isValid = await verifySession(sessionData.access_token);
        if (isValid) {
          setAdminUser({
            id: sessionData.user.id,
            email: sessionData.user.email,
            role: "admin",
          });
          setIsAuthenticated(true);
        } else {
          clearStoredSession();
        }
      }
    } catch (error) {
      console.warn("Failed to check existing session:", error);
    } finally {
      setLoading(false);
    }
  };

  const verifySession = async (accessToken: string): Promise<boolean> => {
    try {
      const response = await fetch(`${backendUrl}/user/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.success && result.data?.profile?.role === "admin";
      }
      return false;
    } catch (error) {
      console.error("Session verification failed:", error);
      return false;
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Step 1: Login via backend
      const loginResponse = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse
          .json()
          .catch(() => ({ error: "Network error" }));
        return {
          success: false,
          error:
            errorData.message ||
            errorData.error ||
            `HTTP ${loginResponse.status}`,
        };
      }

      const loginResult = await loginResponse.json();

      console.log("Admin login response:", loginResult);

      if (!loginResult.success || !loginResult.data?.user) {
        return { success: false, error: "Invalid login response" };
      }

      // Check if user has admin role
      if (loginResult.data.user.role !== "admin") {
        return {
          success: false,
          error: "Access denied. This account does not have admin privileges.",
        };
      }

      // Store session and set auth state
      const sessionData = {
        user: loginResult.data.user,
        access_token: loginResult.data.accessToken,
        refresh_token: loginResult.data.refreshToken,
        expires_at: Date.now() + (loginResult.data.expiresIn * 1000),
        loginTime: Date.now(),
      };

      storeSession(sessionData);

      setAdminUser({
        id: loginResult.data.user.id,
        email: loginResult.data.user.email,
        role: loginResult.data.user.role,
      });
      setIsAuthenticated(true);

      console.log("Admin login successful");
      return { success: true };
    } catch (error: any) {
      console.error("Admin login error:", error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearStoredSession();
    setAdminUser(null);
    setIsAuthenticated(false);
  };

  const checkAdminStatus = async (): Promise<boolean> => {
    const sessionData = getStoredSession();
    if (!sessionData?.access_token) return false;

    return await verifySession(sessionData.access_token);
  };

  const getAuthHeaders = (): Record<string, string> => {
    const sessionData = getStoredSession();

    if (sessionData?.access_token) {
      console.log("📝 Providing auth headers with valid token");
      return {
        Authorization: `Bearer ${sessionData.access_token}`,
        "Content-Type": "application/json",
      };
    }

    console.warn("⚠️ No valid auth token available for request");
    return { "Content-Type": "application/json" };
  };

  // Cookie utilities for admin storage
  const adminCookieUtils = {
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
        console.log(`Admin cookie set: ${name}`);
      } catch (error) {
        console.warn("Failed to set admin cookie:", error);
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
        console.warn("Failed to get admin cookie:", error);
        return null;
      }
    },

    remove: (name: string, path: string = "/") => {
      try {
        document.cookie = `${encodeURIComponent(
          name
        )}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        console.log(`Admin cookie removed: ${name}`);
      } catch (error) {
        console.warn("Failed to remove admin cookie:", error);
      }
    },
  };

  // Storage helpers using cookies for persistence across page refreshes
  const storeSession = (sessionData: any) => {
    console.log("💾 Storing admin session in cookies...", {
      hasToken: !!sessionData.access_token,
    });

    try {
      // Store session data in cookie with 7 days expiry
      adminCookieUtils.set("admin_session", JSON.stringify(sessionData), {
        maxAge: 7 * 24 * 60 * 60, // 7 days
        secure: window.location.protocol === "https:",
        sameSite: "lax",
      });
      console.log("✅ Admin session stored in cookies");
    } catch (error) {
      console.warn(
        "⚠️ Could not store admin session in cookies, using memory"
      );
      // Store in memory as fallback
      (window as any).__adminSession = sessionData;
      console.log("✅ Admin session stored in memory");
    }
  };

  const getStoredSession = () => {
    try {
      const stored = adminCookieUtils.get("admin_session");
      if (stored) {
        const session = JSON.parse(stored);
        console.log("📖 Retrieved admin session from cookies", {
          hasToken: !!session.access_token,
        });
        return session;
      }
    } catch (error) {
      console.warn("⚠️ Could not read admin session from cookies:", error);
    }

    // Fallback to memory storage
    const memorySession = (window as any).__adminSession;
    if (memorySession) {
      console.log("📖 Retrieved admin session from memory storage", {
        hasToken: !!memorySession.access_token,
      });
      return memorySession;
    }

    console.warn("❌ No admin session found in either storage");
    return null;
  };

  const clearStoredSession = () => {
    try {
      console.log("🗑️ Clearing admin session from cookies...");
      adminCookieUtils.remove("admin_session");
      console.log("✅ Admin session cleared from cookies");
    } catch (error) {
      console.warn("⚠️ Could not clear admin session from cookies:", error);
    }
    // Also clear memory storage as fallback
    delete (window as any).__adminSession;
  };

  const value: AdminAuthContextType = {
    adminUser,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAdminStatus,
    getAuthHeaders,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
