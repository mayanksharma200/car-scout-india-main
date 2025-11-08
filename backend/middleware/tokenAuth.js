// backend/middleware/tokenAuth.js
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Token configuration
const TOKEN_CONFIG = {
  accessTokenExpiry: "15m",
  refreshTokenExpiry: "7d",
  secret: process.env.JWT_SECRET || "your-super-secret-key",
  issuer: "Carlist360-api",
  audience: "Carlist360-users",
};

// Enhanced token generation
export const generateTokens = async (user) => {
  try {
    // Get user profile for role information
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, first_name, last_name")
      .eq("id", user.id)
      .single();

    const payload = {
      userId: user.id,
      email: user.email,
      role: profile?.role || "user",
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      emailVerified: user.email_confirmed_at ? true : false,
      iat: Math.floor(Date.now() / 1000),
    };

    // Generate access token (short-lived)
    const accessToken = jwt.sign(payload, TOKEN_CONFIG.secret, {
      expiresIn: TOKEN_CONFIG.accessTokenExpiry,
      issuer: TOKEN_CONFIG.issuer,
      audience: TOKEN_CONFIG.audience,
      subject: user.id,
    });

    // Generate refresh token (long-lived)
    const refreshTokenPayload = {
      userId: user.id,
      type: "refresh",
      iat: Math.floor(Date.now() / 1000),
    };

    const refreshToken = jwt.sign(refreshTokenPayload, TOKEN_CONFIG.secret, {
      expiresIn: TOKEN_CONFIG.refreshTokenExpiry,
      issuer: TOKEN_CONFIG.issuer,
      audience: TOKEN_CONFIG.audience,
      subject: user.id,
    });

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await supabase.from("user_sessions").insert({
      user_id: user.id,
      refresh_token: refreshToken,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
      tokenType: "Bearer",
    };
  } catch (error) {
    console.error("Token generation error:", error);
    throw new Error("Failed to generate tokens");
  }
};

// Token validation middleware
export const validateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No valid authorization token provided",
        code: "MISSING_TOKEN",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT token
    const decoded = jwt.verify(token, TOKEN_CONFIG.secret, {
      issuer: TOKEN_CONFIG.issuer,
      audience: TOKEN_CONFIG.audience,
    });

    // Check if user still exists and is active
    const { data: user, error } = await supabase.auth.admin.getUserById(
      decoded.userId
    );

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "Invalid token - user not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Check if user account is still active
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active, role")
      .eq("id", decoded.userId)
      .single();

    if (profile && !profile.is_active) {
      return res.status(401).json({
        success: false,
        error: "Account is deactivated",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      emailVerified: decoded.emailVerified,
    };

    next();
  } catch (error) {
    console.error("Token validation error:", error);

    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token has expired",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    res.status(401).json({
      success: false,
      error: "Token validation failed",
      code: "VALIDATION_FAILED",
    });
  }
};

// Admin role validation
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Admin access required",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }
  next();
};

// Refresh token endpoint
export const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, TOKEN_CONFIG.secret);

    // Check if refresh token exists in database and is valid
    const { data: session, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("refresh_token", refreshToken)
      .eq("user_id", decoded.userId)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (error || !session) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    // Get user data
    const { data: user, error: userError } =
      await supabase.auth.admin.getUserById(decoded.userId);

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // Generate new tokens
    const tokens = await generateTokens(user.user);

    // Invalidate old refresh token
    await supabase
      .from("user_sessions")
      .delete()
      .eq("refresh_token", refreshToken);

    res.json({
      success: true,
      data: tokens,
      message: "Tokens refreshed successfully",
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      success: false,
      error: "Failed to refresh token",
      code: "REFRESH_FAILED",
    });
  }
};

// Logout handler (invalidate tokens)
export const logoutHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user?.id;

    // Delete specific refresh token if provided
    if (refreshToken) {
      await supabase
        .from("user_sessions")
        .delete()
        .eq("refresh_token", refreshToken);
    }

    // Or delete all sessions for user (logout from all devices)
    if (userId) {
      await supabase.from("user_sessions").delete().eq("user_id", userId);
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Logout failed",
    });
  }
};

// Enhanced login endpoint
export const loginHandler = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Generate custom tokens
    const tokens = await generateTokens(authData.user);

    // Update last login
    await supabase
      .from("profiles")
      .update({
        last_login: new Date().toISOString(),
        login_count: supabase.rpc("increment_login_count", {
          user_id: authData.user.id,
        }),
      })
      .eq("id", authData.user.id);

    // Log successful login
    console.log(`Successful login for user: ${authData.user.id}`);

    res.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          emailVerified: authData.user.email_confirmed_at ? true : false,
        },
        tokens,
        expiresIn: tokens.expiresIn,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
};

// Token cleanup job (run periodically)
export const cleanupExpiredTokens = async () => {
  try {
    const { data, error } = await supabase
      .from("user_sessions")
      .delete()
      .lt("expires_at", new Date().toISOString());

    if (error) throw error;

    console.log(
      `Cleaned up expired tokens: ${data?.length || 0} sessions removed`
    );
  } catch (error) {
    console.error("Token cleanup error:", error);
  }
};

// Set up periodic cleanup (every hour)
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
