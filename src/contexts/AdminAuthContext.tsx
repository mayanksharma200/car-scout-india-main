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
    import.meta.env.VITE_API_URL || "http://localhost:3001/api";

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

      if (!loginResult.success || !loginResult.data?.user) {
        return { success: false, error: "Invalid login response" };
      }

      // Step 2: Verify admin role
      const adminCheckResponse = await fetch(`${backendUrl}/auth/check-admin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${loginResult.data.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: loginResult.data.user.id }),
      });

      if (!adminCheckResponse.ok) {
        return { success: false, error: "Failed to verify admin status" };
      }

      const adminCheckResult = await adminCheckResponse.json();

      if (!adminCheckResult.success || !adminCheckResult.isAdmin) {
        return {
          success: false,
          error: "Access denied. This account does not have admin privileges.",
        };
      }

      // Step 3: Store session and set auth state
      const sessionData = {
        user: loginResult.data.user,
        access_token: loginResult.data.session.access_token,
        refresh_token: loginResult.data.session.refresh_token,
        expires_at: loginResult.data.session.expires_at,
        loginTime: Date.now(),
      };

      storeSession(sessionData);

      setAdminUser({
        id: loginResult.data.user.id,
        email: loginResult.data.user.email,
        role: "admin",
      });
      setIsAuthenticated(true);

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

  // Storage helpers with fallbacks
  const storeSession = (sessionData: any) => {
    console.log("💾 Storing admin session...", {
      hasToken: !!sessionData.access_token,
    });

    try {
      sessionStorage.setItem("admin_session", JSON.stringify(sessionData));
      console.log("✅ Session stored in sessionStorage");
    } catch (error) {
      console.warn(
        "⚠️ Could not store session in sessionStorage, using memory"
      );
      // Store in memory as fallback
      (window as any).__adminSession = sessionData;
      console.log("✅ Session stored in memory");
    }
  };

  const getStoredSession = () => {
    try {
      const stored = sessionStorage.getItem("admin_session");
      if (stored) {
        const session = JSON.parse(stored);
        console.log("📖 Retrieved session from sessionStorage", {
          hasToken: !!session.access_token,
        });
        return session;
      }
    } catch (error) {
      console.warn("⚠️ Could not read from sessionStorage:", error);
    }

    // Fallback to memory storage
    const memorySession = (window as any).__adminSession;
    if (memorySession) {
      console.log("📖 Retrieved session from memory storage", {
        hasToken: !!memorySession.access_token,
      });
      return memorySession;
    }

    console.warn("❌ No session found in either storage");
    return null;
  };

  const clearStoredSession = () => {
    try {
      sessionStorage.removeItem("admin_session");
    } catch (error) {
      // Clear memory storage as fallback
      delete (window as any).__adminSession;
    }
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
