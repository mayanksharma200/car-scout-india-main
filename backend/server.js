// backend/server.js - Environment-Aware Configuration
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
console.log(`🔧 Mode: ${IS_PRODUCTION ? "Production" : "Development"}`);

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

// ===== ENVIRONMENT-AWARE CONFIGURATIONS =====

// Token configuration
const TOKEN_CONFIG = {
  accessTokenExpiry: process.env.SESSION_TIMEOUT || "15m",
  refreshTokenExpiry: process.env.REFRESH_TIMEOUT || "7d",
  secret:
    process.env.JWT_SECRET ||
    (IS_DEVELOPMENT
      ? "dev-secret-key-32-chars-minimum-123"
      : "your-super-secret-key-change-in-production"),
  refreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    (IS_DEVELOPMENT
      ? "dev-refresh-secret-32-chars-min-123"
      : "your-refresh-secret-key-change-in-production"),
  issuer: "autoscope-api",
  audience: "autoscope-users",
};

// CORS configuration based on environment
const CORS_CONFIG = {
  origin:
    process.env.CORS_ORIGIN ||
    (IS_DEVELOPMENT ? "http://localhost:8080" : false),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

// Cookie configuration based on environment
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: IS_PRODUCTION, // HTTPS only in production, HTTP OK in development
  sameSite: IS_PRODUCTION ? "strict" : "lax", // Stricter in production
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
  domain: IS_PRODUCTION ? undefined : undefined, // Let browser handle domain
};

// Security middleware configuration
const HELMET_CONFIG = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: [
        "'self'",
        process.env.SUPABASE_URL,
        ...(IS_DEVELOPMENT ? ["http://localhost:*"] : []),
      ],
    },
  },
  crossOriginEmbedderPolicy: false,
  // Less strict in development
  hsts: IS_PRODUCTION ? { maxAge: 31536000, includeSubDomains: true } : false,
};

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: IS_DEVELOPMENT ? 10000 : 1000, // More lenient in development
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: IS_DEVELOPMENT
    ? (req) => req.ip === "127.0.0.1" || req.ip === "::1"
    : undefined, // Skip rate limiting for localhost in dev
};

// ===== MIDDLEWARE SETUP =====

// Security middleware
app.use(helmet(HELMET_CONFIG));

// CORS
app.use(cors(CORS_CONFIG));

// Cookie parser (for production httpOnly cookies)
app.use(cookieParser());

// Body parser
app.use(express.json({ limit: "10mb" }));

// Rate limiting (more lenient in development)
const generalLimiter = rateLimit({
  ...RATE_LIMIT_CONFIG,
  max: IS_DEVELOPMENT ? 10000 : 1000,
});

const authLimiter = rateLimit({
  ...RATE_LIMIT_CONFIG,
  max: IS_DEVELOPMENT ? 100 : 10,
  message: {
    success: false,
    error: "Too many authentication attempts, please try again later.",
  },
});

const createAccountLimiter = rateLimit({
  ...RATE_LIMIT_CONFIG,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: IS_DEVELOPMENT ? 50 : 3,
  message: {
    success: false,
    error: "Too many account creation attempts, please try again later.",
  },
});

// Apply rate limiting
if (IS_PRODUCTION) {
  app.use("/api/", generalLimiter);
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/signup", createAccountLimiter);
  app.use("/api/auth/refresh", authLimiter);
} else {
  console.log("⚠️ Rate limiting disabled in development");
}

// ===== TOKEN MANAGEMENT =====

// Generate JWT tokens (environment-aware)
const generateTokens = async (user) => {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, first_name, last_name, is_active, email_verified")
      .eq("id", user.id)
      .single();

    if (profile && !profile.is_active) {
      throw new Error("Account is deactivated");
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: profile?.role || "user",
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      emailVerified: user.email_confirmed_at ? true : false,
      iat: Math.floor(Date.now() / 1000),
    };

    // Generate access token
    const accessToken = jwt.sign(payload, TOKEN_CONFIG.secret, {
      expiresIn: TOKEN_CONFIG.accessTokenExpiry,
      issuer: TOKEN_CONFIG.issuer,
      audience: TOKEN_CONFIG.audience,
      subject: user.id,
    });

    // Generate refresh token
    const refreshTokenPayload = {
      userId: user.id,
      type: "refresh",
      iat: Math.floor(Date.now() / 1000),
    };

    const refreshToken = jwt.sign(
      refreshTokenPayload,
      TOKEN_CONFIG.refreshSecret,
      {
        expiresIn: TOKEN_CONFIG.refreshTokenExpiry,
        issuer: TOKEN_CONFIG.issuer,
        audience: TOKEN_CONFIG.audience,
        subject: user.id,
      }
    );

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await supabase.from("user_sessions").insert({
      user_id: user.id,
      refresh_token: refreshToken,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
      is_active: true,
    });

    const tokenResponse = {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
      tokenType: "Bearer",
    };

    console.log(
      `✅ Generated tokens for ${user.email} (${
        IS_PRODUCTION ? "Production" : "Development"
      } mode)`
    );
    return tokenResponse;
  } catch (error) {
    console.error("Token generation error:", error);
    throw new Error("Failed to generate tokens");
  }
};

// Token validation middleware
const validateToken = async (req, res, next) => {
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
    const decoded = jwt.verify(token, TOKEN_CONFIG.secret, {
      issuer: TOKEN_CONFIG.issuer,
      audience: TOKEN_CONFIG.audience,
    });

    // Verify user exists and is active
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

    // Check account status
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active, role, failed_login_attempts, locked_until")
      .eq("id", decoded.userId)
      .single();

    if (profile) {
      if (!profile.is_active) {
        return res.status(401).json({
          success: false,
          error: "Account is deactivated",
          code: "ACCOUNT_DEACTIVATED",
        });
      }

      if (profile.locked_until && new Date(profile.locked_until) > new Date()) {
        return res.status(401).json({
          success: false,
          error: "Account is temporarily locked",
          code: "ACCOUNT_LOCKED",
        });
      }
    }

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
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Admin access required",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }
  next();
};

// Optional auth middleware
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      try {
        const decoded = jwt.verify(token, TOKEN_CONFIG.secret, {
          issuer: TOKEN_CONFIG.issuer,
          audience: TOKEN_CONFIG.audience,
        });

        req.user = {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          emailVerified: decoded.emailVerified,
        };
      } catch (error) {
        // Continue without auth if token is invalid
        if (IS_DEVELOPMENT) {
          console.warn("Optional auth failed:", error.message);
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Authentication event logging
const logAuthEvent = async (
  userId,
  eventType,
  ipAddress,
  userAgent,
  success = true,
  errorMessage = null
) => {
  try {
    await supabase.from("auth_audit_logs").insert({
      user_id: userId,
      event_type: eventType,
      ip_address: ipAddress,
      user_agent: userAgent,
      success,
      error_message: errorMessage,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log auth event:", error);
  }
};

// ===== PUBLIC ROUTES =====

// Health check with environment info
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "2.0.0-token-auth",
    auth: "JWT-based",
    environment: process.env.NODE_ENV,
    features: {
      rateLimiting: IS_PRODUCTION,
      secureHeaders: IS_PRODUCTION,
      httpOnlyCookies: IS_PRODUCTION,
      localStorage: IS_DEVELOPMENT,
    },
  });
});

// Car endpoints (unchanged)
app.get("/api/cars/featured", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error fetching featured cars:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch featured cars",
    });
  }
});

// Replace your existing /api/cars/search endpoint with this improved version

app.get("/api/cars/search", async (req, res) => {
  try {
    const { q, limit = 500 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    console.log(`🔍 Searching for: "${q}"`);

    // Clean and split the search query into individual words
    const searchTerms = q.trim()
      .toLowerCase()
      .split(/\s+/) // Split by whitespace
      .filter(term => term.length > 0); // Remove empty strings

    console.log(`📝 Search terms:`, searchTerms);

    let query = supabase
      .from("cars")
      .select("*")
      .eq("status", "active");

    if (searchTerms.length === 1) {
      // Single word search - use the original OR logic
      const term = searchTerms[0];
      query = query.or(`brand.ilike.%${term}%,model.ilike.%${term}%,variant.ilike.%${term}%`);
    } else {
      // Multi-word search - each term must match somewhere in brand, model, or variant
      for (const term of searchTerms) {
        query = query.or(`brand.ilike.%${term}%,model.ilike.%${term}%,variant.ilike.%${term}%`);
      }
    }

    query = query
      .order('brand', { ascending: true })
      .order('model', { ascending: true })
      .order('variant', { ascending: true })
      .limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      console.error("❌ Database error:", error);
      throw error;
    }

    // For multi-word searches, filter results to ensure ALL terms are found
    let filteredData = data;
    
    if (searchTerms.length > 1) {
      filteredData = data.filter(car => {
        const carText = `${car.brand} ${car.model} ${car.variant}`.toLowerCase();
        return searchTerms.every(term => carText.includes(term));
      });
    }

    console.log(`✅ Found ${filteredData.length} cars matching "${q}"`);
    
    // Log first few results for debugging
    filteredData.slice(0, 5).forEach(car => {
      console.log(`🚗 ${car.brand} ${car.model} ${car.variant}`);
    });

    res.json({
      success: true,
      data: filteredData || [],
      query: q,
      searchTerms: searchTerms,
      totalFound: filteredData.length
    });
  } catch (error) {
    console.error("💥 Search error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search cars",
      details: error.message
    });
  }
});

// Alternative: More sophisticated search with PostgreSQL full-text search
app.get("/api/cars/search-advanced", async (req, res) => {
  try {
    const { q, limit = 500 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    console.log(`🔍 Advanced searching for: "${q}"`);

    // Use PostgreSQL's full-text search capabilities
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("status", "active")
      .textSearch('brand', q, { type: 'websearch' })
      .or(`model.ilike.%${q}%,variant.ilike.%${q}%`)
      .order('brand', { ascending: true })
      .order('model', { ascending: true })
      .limit(parseInt(limit));

    if (error) throw error;

    console.log(`✅ Advanced search found ${data.length} cars`);

    res.json({
      success: true,
      data: data || [],
      query: q,
      searchType: 'advanced'
    });
  } catch (error) {
    console.error("💥 Advanced search error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to perform advanced search",
      details: error.message
    });
  }
});

// Even better: Weighted search with scoring
app.get("/api/cars/search-weighted", async (req, res) => {
  try {
    const { q, limit = 500 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    console.log(`🔍 Weighted searching for: "${q}"`);

    const searchTerms = q.trim().toLowerCase().split(/\s+/).filter(term => term.length > 0);
    
    // Build a more sophisticated query with scoring
    const { data, error } = await supabase
      .rpc('search_cars_weighted', {
        search_query: q,
        search_limit: parseInt(limit)
      });

    if (error) {
      // Fallback to simple search if RPC function doesn't exist
      console.warn("Weighted search function not available, using fallback");
      
      let query = supabase
        .from("cars")
        .select("*")
        .eq("status", "active");

      // Build dynamic OR conditions for each search term
      const conditions = searchTerms.map(term => 
        `brand.ilike.%${term}%,model.ilike.%${term}%,variant.ilike.%${term}%`
      ).join(',');

      const { data: fallbackData, error: fallbackError } = await query
        .or(conditions)
        .order('brand', { ascending: true })
        .order('model', { ascending: true })
        .limit(parseInt(limit));

      if (fallbackError) throw fallbackError;

      // Filter for multi-word matches
      const filteredData = fallbackData.filter(car => {
        const carText = `${car.brand} ${car.model} ${car.variant}`.toLowerCase();
        return searchTerms.every(term => carText.includes(term));
      });

      return res.json({
        success: true,
        data: filteredData,
        query: q,
        searchType: 'fallback'
      });
    }

    console.log(`✅ Weighted search found ${data.length} cars`);

    res.json({
      success: true,
      data: data || [],
      query: q,
      searchType: 'weighted'
    });
  } catch (error) {
    console.error("💥 Weighted search error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to perform weighted search",
      details: error.message
    });
  }
});

app.get("/api/cars", async (req, res) => {
  try {
    const {
      status = "active",
      brand,
      model,
      minPrice,
      maxPrice,
      limit = 500,
      offset = 0,
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query;

    let query = supabase.from("cars").select("*", { count: "exact" });

    query = query.eq("status", status);
    if (brand) query = query.eq("brand", brand);
    if (model) query = query.eq("model", model);
    if (minPrice) query = query.gte("price_min", minPrice);
    if (maxPrice) query = query.lte("price_max", maxPrice);

    query = query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      count,
      pagination: {
        offset: parseInt(offset),
        limit: parseInt(limit),
        total: count,
      },
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch cars",
    });
  }
});

app.get("/api/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
      });
    }

    await supabase
      .from("cars")
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq("id", id);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching car:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch car",
    });
  }
});

app.post("/api/leads", optionalAuth, async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      user_id: req.user?.id || null,
      ip_address: req.ip,
      user_agent: req.get("User-Agent"),
      status: "new",
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("leads")
      .insert([leadData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: "Lead created successfully",
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create lead",
    });
  }
});

// ===== AUTHENTICATION ROUTES (Environment-Aware) =====

// Login endpoint with environment-aware token handling
// Login endpoint with consistent response structure
// Login endpoint with consistent response structure and error handling
app.post("/api/auth/login", async (req, res) => {
  const ipAddress = req.ip;
  const userAgent = req.get("User-Agent");
  let userId = null;

  try {
    const { email, password, rememberMe = false } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
        code: "MISSING_CREDENTIALS"
      });
    }

    console.log(`🔐 Login attempt for ${email} from ${ipAddress}`);

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      await logAuthEvent(
        null,
        "login_failed",
        ipAddress,
        userAgent,
        false,
        authError.message
      );
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS"
      });
    }

    userId = authData.user.id;

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, first_name, last_name, is_active")
      .eq("id", userId)
      .single();

    // Check account status
    if (profile && !profile.is_active) {
      await logAuthEvent(
        userId,
        "login_blocked",
        ipAddress,
        userAgent,
        false,
        "Account deactivated"
      );
      return res.status(403).json({
        success: false,
        error: "Account is deactivated",
        code: "ACCOUNT_DEACTIVATED"
      });
    }

    // Generate tokens with error handling
    let tokens;
    try {
      tokens = await generateTokens(authData.user);
      console.log("Generated tokens:", { 
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        tokenType: tokens.tokenType
      });
    } catch (tokenError) {
      console.error("Token generation failed:", tokenError);
      return res.status(500).json({
        success: false,
        error: "Failed to generate authentication tokens",
        code: "TOKEN_GENERATION_FAILED"
      });
    }

    // Ensure expiresIn is always present with a valid value
    if (!tokens.expiresIn || typeof tokens.expiresIn !== 'number') {
      console.warn("expiresIn missing or invalid, setting default");
      tokens.expiresIn = 900; // 15 minutes
    }

    // Update login tracking
    try {
      await supabase.rpc("increment_login_count", { user_id: userId });
      await supabase
        .from("profiles")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", userId);
    } catch (updateError) {
      console.warn("Failed to update login tracking:", updateError);
      // Don't fail the login for tracking errors
    }

    // Prepare consistent response structure
    const responseData = {
      user: {
        id: authData.user.id,
        email: authData.user.email,
        emailVerified: !!authData.user.email_confirmed_at,
        role: profile?.role || "user",
        firstName: profile?.first_name,
        lastName: profile?.last_name
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken, // Always include for development
      expiresIn: tokens.expiresIn,
      tokenType: tokens.tokenType || "Bearer"
    };

    // In production, set HttpOnly cookie for refresh token
    if (IS_PRODUCTION) {
      res.cookie("refreshToken", tokens.refreshToken, {
        ...COOKIE_CONFIG,
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined // 30 days if "remember me"
      });
      // Remove refreshToken from response in production
      delete responseData.refreshToken;
    }

    // Log successful login
    await logAuthEvent(userId, "login_success", ipAddress, userAgent, true);

    console.log(`✅ Login successful for user: ${userId}`);
    
    return res.json({
      success: true,
      data: responseData,
      message: "Login successful"
    });

  } catch (error) {
    console.error("Login error:", error);
    
    if (userId) {
      await logAuthEvent(
        userId,
        "login_error",
        ipAddress,
        userAgent,
        false,
        error.message
      );
      
      // Reset failed login attempts (handle RPC errors gracefully)
      try {
        await supabase.rpc("increment_failed_logins", { user_id: userId });
      } catch (rpcError) {
        console.warn("Failed to increment failed logins:", rpcError);
      }
    }

    return res.status(500).json({
      success: false,
      error: "Login failed",
      code: "LOGIN_FAILED",
      details: IS_DEVELOPMENT ? error.message : undefined
    });
  }
});

// Updated generateTokens function with better error handling
// const generateTokens = async (user) => {
//   try {
//     const { data: profile } = await supabase
//       .from("profiles")
//       .select("role, first_name, last_name, is_active, email_verified")
//       .eq("id", user.id)
//       .single();

//     if (profile && !profile.is_active) {
//       throw new Error("Account is deactivated");
//     }

//     const payload = {
//       userId: user.id,
//       email: user.email,
//       role: profile?.role || "user",
//       firstName: profile?.first_name,
//       lastName: profile?.last_name,
//       emailVerified: user.email_confirmed_at ? true : false,
//       iat: Math.floor(Date.now() / 1000),
//     };

//     // Generate access token
//     const accessToken = jwt.sign(payload, TOKEN_CONFIG.secret, {
//       expiresIn: TOKEN_CONFIG.accessTokenExpiry,
//       issuer: TOKEN_CONFIG.issuer,
//       audience: TOKEN_CONFIG.audience,
//       subject: user.id,
//     });

//     // Generate refresh token
//     const refreshTokenPayload = {
//       userId: user.id,
//       type: "refresh",
//       iat: Math.floor(Date.now() / 1000),
//     };

//     const refreshToken = jwt.sign(
//       refreshTokenPayload,
//       TOKEN_CONFIG.refreshSecret,
//       {
//         expiresIn: TOKEN_CONFIG.refreshTokenExpiry,
//         issuer: TOKEN_CONFIG.issuer,
//         audience: TOKEN_CONFIG.audience,
//         subject: user.id,
//       }
//     );

//     // Store refresh token in database
//     const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
//     const { error: sessionError } = await supabase.from("user_sessions").insert({
//       user_id: user.id,
//       refresh_token: refreshToken,
//       expires_at: expiresAt.toISOString(),
//       created_at: new Date().toISOString(),
//       is_active: true,
//     });

//     if (sessionError) {
//       console.error("Failed to store refresh token:", sessionError);
//       throw new Error("Failed to store session");
//     }

//     const tokenResponse = {
//       accessToken,
//       refreshToken,
//       expiresIn: 900, // Explicit 15 minutes in seconds
//       tokenType: "Bearer",
//     };

//     console.log(
//       `✅ Generated tokens for ${user.email} (${
//         IS_PRODUCTION ? "Production" : "Development"
//       } mode) - expiresIn: ${tokenResponse.expiresIn}`
//     );
    
//     return tokenResponse;
//   } catch (error) {
//     console.error("Token generation error:", error);
//     throw new Error(`Failed to generate tokens: ${error.message}`);
//   }
// };

// Refresh token endpoint (environment-aware)
app.post("/api/auth/refresh", async (req, res) => {
  try {
    let refreshToken;

    if (IS_PRODUCTION) {
      // Production: Get refresh token from httpOnly cookie
      refreshToken = req.cookies.refreshToken;
    } else {
      // Development: Get refresh token from request body
      refreshToken = req.body.refreshToken;
    }

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, TOKEN_CONFIG.refreshSecret);

    // Check if refresh token exists in database and is valid
    const { data: session, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("refresh_token", refreshToken)
      .eq("user_id", decoded.userId)
      .eq("is_active", true)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (error || !session) {
      if (IS_PRODUCTION) {
        res.clearCookie("refreshToken", COOKIE_CONFIG);
      }

      await logAuthEvent(
        decoded.userId,
        "token_refresh_failed",
        req.ip,
        req.get("User-Agent"),
        false,
        "Invalid refresh token"
      );
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
      .update({
        is_active: false,
        last_accessed: new Date().toISOString(),
      })
      .eq("refresh_token", refreshToken);

    // Log token refresh
    await logAuthEvent(
      decoded.userId,
      "token_refresh_success",
      req.ip,
      req.get("User-Agent"),
      true
    );

    // Environment-aware response
    if (IS_PRODUCTION) {
      // Production: Update httpOnly cookie
      res.cookie("refreshToken", tokens.refreshToken, COOKIE_CONFIG);

      res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn,
        },
        message: "Tokens refreshed successfully",
      });
    } else {
      // Development: Send complete tokens
      res.json({
        success: true,
        data: tokens,
        message: "Tokens refreshed successfully",
      });
    }
  } catch (error) {
    console.error("Refresh token error:", error);

    if (IS_PRODUCTION) {
      res.clearCookie("refreshToken", COOKIE_CONFIG);
    }

    res.status(401).json({
      success: false,
      error: "Failed to refresh token",
      code: "REFRESH_FAILED",
    });
  }
});

// Google OAuth conversion endpoint
app.post("/api/auth/google-oauth", async (req, res) => {
  const ipAddress = req.ip;
  const userAgent = req.get("User-Agent");

  try {
    const { supabaseUserId, email, userData } = req.body;

    if (!supabaseUserId || !email) {
      return res.status(400).json({
        success: false,
        error: "Supabase user ID and email are required",
        code: "MISSING_OAUTH_DATA"
      });
    }

    console.log(`🔐 Google OAuth conversion for ${email} from ${ipAddress}`);

    // Get or create user profile
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, first_name, last_name, is_active")
      .eq("id", supabaseUserId)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      // Profile doesn't exist, create it
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: supabaseUserId,
          role: "user",
          first_name: userData?.firstName,
          last_name: userData?.lastName,
          is_active: true,
          email_verified: userData?.emailVerified || true,
          login_count: 0,
          failed_login_attempts: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error("Failed to create profile:", createError);
        return res.status(500).json({
          success: false,
          error: "Failed to create user profile",
          code: "PROFILE_CREATION_FAILED"
        });
      }

      profile = newProfile;
    } else if (profileError) {
      console.error("Profile fetch error:", profileError);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch user profile",
        code: "PROFILE_FETCH_FAILED"
      });
    }

    // Check account status
    if (profile && !profile.is_active) {
      await logAuthEvent(
        supabaseUserId,
        "google_oauth_blocked",
        ipAddress,
        userAgent,
        false,
        "Account deactivated"
      );
      return res.status(403).json({
        success: false,
        error: "Account is deactivated",
        code: "ACCOUNT_DEACTIVATED"
      });
    }

    // Create a mock user object for token generation
    const mockUser = {
      id: supabaseUserId,
      email: email,
      email_confirmed_at: userData?.emailVerified ? new Date().toISOString() : null,
    };

    // Generate tokens
    let tokens;
    try {
      tokens = await generateTokens(mockUser);
    } catch (tokenError) {
      console.error("Token generation failed:", tokenError);
      return res.status(500).json({
        success: false,
        error: "Failed to generate authentication tokens",
        code: "TOKEN_GENERATION_FAILED"
      });
    }

    // Update login tracking
    try {
      await supabase.rpc("increment_login_count", { user_id: supabaseUserId });
      await supabase
        .from("profiles")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", supabaseUserId);
    } catch (updateError) {
      console.warn("Failed to update login tracking:", updateError);
    }

    // Prepare response
    const responseData = {
      user: {
        id: supabaseUserId,
        email: email,
        emailVerified: userData?.emailVerified || true,
        role: profile?.role || "user",
        firstName:
          profile?.first_name || userData?.firstName || email.split("@")[0],
        lastName: profile?.last_name || userData?.lastName || "",
        // Add any other fields your UserAuthContext expects
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      tokenType: tokens.tokenType || "Bearer",
    };

    // In production, set HttpOnly cookie for refresh token
    if (IS_PRODUCTION) {
      res.cookie("userRefreshToken", tokens.refreshToken, {
        ...COOKIE_CONFIG,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days for Google OAuth
      });
      delete responseData.refreshToken;
    }

    // Log successful conversion
    await logAuthEvent(supabaseUserId, "google_oauth_success", ipAddress, userAgent, true);

    console.log(`✅ Google OAuth conversion successful for user: ${supabaseUserId}`);
    
    return res.json({
      success: true,
      data: responseData,
      message: "Google OAuth conversion successful"
    });

  } catch (error) {
    console.error("Google OAuth conversion error:", error);
    
    return res.status(500).json({
      success: false,
      error: "Google OAuth conversion failed",
      code: "OAUTH_CONVERSION_FAILED",
      details: IS_DEVELOPMENT ? error.message : undefined
    });
  }
});

// In your backend (API route)
// In your backend API route (/api/auth/supabase-token)
app.post('/api/auth/supabase-token', async (req, res) => {
  try {
    const { supabaseUserId, email, userData } = req.body;

    // Simple token generation (replace with your actual JWT logic)
    const accessToken = generateSimpleToken(supabaseUserId);
    
    const responseData = {
      user: {
        id: supabaseUserId,
        email: email,
        firstName: userData?.first_name || userData?.given_name || email.split('@')[0],
        lastName: userData?.last_name || userData?.family_name || '',
        role: 'user',
        emailVerified: true,
        provider: userData?.provider || 'email'
      },
      accessToken: accessToken,
      expiresIn: 3600,
      tokenType: 'Bearer'
    };

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate tokens'
    });
  }
});

// Simple token generator (replace with your actual JWT implementation)
function generateSimpleToken(userId) {
  return `supabase-${userId}-${Date.now()}`;
}

// Logout endpoint (environment-aware)
app.post("/api/auth/logout", validateToken, async (req, res) => {
  try {
    let refreshToken;

    if (IS_PRODUCTION) {
      refreshToken = req.cookies.refreshToken;
      // Clear httpOnly cookie
      res.clearCookie("refreshToken", COOKIE_CONFIG);
    } else {
      refreshToken = req.body.refreshToken;
    }

    const userId = req.user?.id;

    // Invalidate refresh token(s)
    if (refreshToken) {
      await supabase
        .from("user_sessions")
        .update({ is_active: false })
        .eq("refresh_token", refreshToken);
    } else {
      // Logout from all devices
      await supabase
        .from("user_sessions")
        .update({ is_active: false })
        .eq("user_id", userId);
    }

    // Log logout
    await logAuthEvent(userId, "logout", req.ip, req.get("User-Agent"), true);

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
});

// Separate endpoint for Supabase logout
// /api/auth/supabase-logout - Fixed version
app.post("/api/auth/supabase-logout", async (req, res) => {
  try {
    console.log('🔄 Supabase logout request received');
    
    // Get the Supabase token from Authorization header OR from session
    let token;
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('📋 Token from header:', token?.substring(0, 20) + '...');
    } else {
      // Alternative: Get from session or cookies if available
      token = req.session?.supabaseToken || req.cookies?.supabase_token;
      console.log('📋 Token from session/cookies:', token?.substring(0, 20) + '...');
    }

    if (!token) {
      console.log('❌ No token provided for Supabase logout');
      return res.status(401).json({
        success: false,
        error: "No authentication token provided",
        code: "MISSING_TOKEN"
      });
    }

    // For Supabase logout, we don't need to validate the token first
    // We can directly call signOut which handles token validation internally
    console.log('🔐 Attempting Supabase sign out...');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.log('❌ Supabase sign out error:', error);
      
      // If signOut fails, it might be because the token is already invalid
      // We can still proceed with cleaning up our local sessions
      console.log('🔄 Proceeding with local session cleanup despite Supabase error');
    } else {
      console.log('✅ Supabase sign out successful');
    }

    // Extract user ID from the token if possible (for logging)
    let userId = 'unknown';
    try {
      // Simple JWT parsing (without verification since we're logging out)
      if (token.includes('.')) {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = payload.sub || payload.user_id || 'unknown';
        console.log('👤 Extracted user ID from token:', userId);
      }
    } catch (parseError) {
      console.log('⚠️ Could not parse token for user ID:', parseError);
    }

    // Invalidate sessions in your database using the user ID if available
    if (userId !== 'unknown') {
      try {
        await supabase
          .from("user_sessions")
          .update({ is_active: false })
          .eq("user_id", userId);
        console.log('✅ Local sessions invalidated for user:', userId);
      } catch (dbError) {
        console.log('❌ Local session cleanup failed:', dbError);
      }
    }

    // Log logout event
    try {
      await logAuthEvent(userId, "supabase_logout", req.ip, req.get("User-Agent"), true);
    } catch (logError) {
      console.log('❌ Logging failed:', logError);
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error) {
    console.error("Supabase logout unexpected error:", error);
    res.status(500).json({
      success: false,
      error: "Logout failed",
    });
  }
});

// Other authentication endpoints (signup, verify, etc.) remain the same...
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, userData } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long",
      });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: undefined,
      },
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        error: authError.message,
      });
    }

    if (authData.user) {
      await supabase.from("profiles").insert({
        id: authData.user.id,
        role: "user",
        first_name: userData?.firstName,
        last_name: userData?.lastName,
        email_verified: false,
        is_active: true,
        login_count: 0,
        failed_login_attempts: 0,
      });

      await logAuthEvent(
        authData.user.id,
        "signup",
        req.ip,
        req.get("User-Agent"),
        true
      );
    }

    res.status(201).json({
      success: true,
      data: {
        user: authData.user,
        message:
          "Account created successfully. Please check your email for verification.",
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create account",
    });
  }
});

app.get("/api/auth/verify", validateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      message: "Token is valid",
    },
  });
});

// ===== PROTECTED ROUTES =====

// User routes
app.get("/api/user/profile", validateToken, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: req.user.id,
          role: "user",
          first_name: req.user.firstName,
          last_name: req.user.lastName,
          is_active: true,
          email_verified: req.user.emailVerified,
        })
        .select()
        .single();

      if (createError) throw createError;
    }

    res.json({
      success: true,
      data: {
        user: req.user,
        profile: profile || {
          id: req.user.id,
          role: "user",
          first_name: req.user.firstName,
          last_name: req.user.lastName,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
    });
  }
});

// Admin routes
app.get("/api/admin/stats", validateToken, requireAdmin, async (req, res) => {
  try {
    const [carsCount, leadsCount, usersCount, activeSessions] =
      await Promise.all([
        supabase.from("cars").select("*", { count: "exact", head: true }),
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("user_sessions")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
      ]);

    res.json({
      success: true,
      data: {
        totalCars: carsCount.count || 0,
        totalLeads: leadsCount.count || 0,
        totalUsers: usersCount.count || 0,
        activeSessions: activeSessions.count || 0,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
    });
  }
});

// Development-only endpoints
if (IS_DEVELOPMENT) {
  app.post("/api/auth/create-test-user", async (req, res) => {
    try {
      const testEmail = "test@autoscope.com";
      const testPassword = "test123456";

      // Delete existing test user if exists
      try {
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(
          (u) => u.email === testEmail
        );

        if (existingUser) {
          await supabase.auth.admin.deleteUser(existingUser.id);
          console.log("Deleted existing test user");
        }
      } catch (deleteError) {
        console.warn("Could not delete existing user:", deleteError.message);
      }

      // Create new test user
      const { data, error } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          firstName: "Test",
          lastName: "User",
        },
      });

      if (error) throw error;

      // Set as admin
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        role: "admin",
        first_name: "Test",
        last_name: "User",
        is_active: true,
        email_verified: true,
      });

      if (profileError) {
        console.warn("Could not set admin role:", profileError.message);
      }

      res.json({
        success: true,
        data: {
          email: testEmail,
          password: testPassword,
          user: data.user,
        },
        message: "Test user created successfully with admin role",
      });
    } catch (error) {
      console.error("Error creating test user:", error);
      res.status(400).json({
        success: false,
        error: "Failed to create test user",
        message: error.message,
      });
    }
  });
}

// Admin creation endpoint
app.post("/api/auth/create-admin", async (req, res) => {
  try {
    const { email, password, adminKey } = req.body;

    const expectedAdminKey = process.env.ADMIN_CREATION_KEY;
    if (!expectedAdminKey || adminKey !== expectedAdminKey) {
      return res.status(403).json({
        success: false,
        error: "Invalid admin creation key",
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: "Admin User",
      },
    });

    if (error) {
      throw error;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      role: "admin",
      is_active: true,
      email_verified: true,
    });

    if (profileError) {
      throw profileError;
    }

    await logAuthEvent(
      data.user.id,
      "admin_created",
      req.ip,
      req.get("User-Agent"),
      true
    );

    res.json({
      success: true,
      message: "Admin user created successfully",
      data: {
        email,
        userId: data.user.id,
      },
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// ===== ADMIN API SETTINGS ENDPOINTS =====

// GET API settings
app.get('/api/admin/api-settings', validateToken, requireAdmin, async (req, res) => {
  try {
    // Try to get settings from Supabase first
    const { data: settings, error } = await supabase
      .from('api_settings')
      .select('*');

    if (error) throw error;

    // Format the response
    const response = {
      success: true,
      data: settings,
      syncStats: {}
    };

    // Get sync statistics if carwale_api exists
    const carwaleConfig = settings.find(s => s.setting_key === 'carwale_api');
    if (carwaleConfig) {
      // Get last sync time from cars table
      const { data: carsData } = await supabase
        .from('cars')
        .select('last_synced')
        .order('last_synced', { ascending: false })
        .limit(1);

      // Get total cars count
      const { count } = await supabase
        .from('cars')
        .select('*', { count: 'exact', head: true });

      response.syncStats = {
        lastSync: carsData?.[0]?.last_synced || null,
        totalCars: count || 0
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching API settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load API settings',
      details: error.message
    });
  }
});

// POST (update) API settings
app.post('/api/admin/api-settings', validateToken, requireAdmin, async (req, res) => {
  try {
    const { carwaleConfig, brandAPIs, generalSettings, syncStats } = req.body;

    // Prepare operations array
    const operations = [];

    // Upsert CarWale API settings
    if (carwaleConfig) {
      operations.push(
        supabase
          .from('api_settings')
          .upsert({
            setting_key: 'carwale_api',
            setting_value: carwaleConfig,
            enabled: syncStats?.enabled || false
          })
      );
    }

    // Upsert Brand APIs
    if (brandAPIs) {
      operations.push(
        supabase
          .from('api_settings')
          .upsert({
            setting_key: 'brand_apis',
            setting_value: { apis: brandAPIs },
            enabled: brandAPIs.some(api => api.enabled)
          })
      );
    }

    // Upsert General Settings
    if (generalSettings) {
      operations.push(
        supabase
          .from('api_settings')
          .upsert({
            setting_key: 'general_settings',
            setting_value: generalSettings,
            enabled: true
          })
      );
    }

    // Execute all operations
    const results = await Promise.all(operations);

    // Check for errors
    const hasError = results.some(result => result.error);
    if (hasError) {
      throw new Error('One or more operations failed');
    }

    res.json({
      success: true,
      message: 'API settings updated successfully'
    });
  } catch (error) {
    console.error('Error saving API settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save API settings',
      details: error.message
    });
  }
});

// Test API-Ninjas connection
app.post('/api/admin/test-api-ninjas', validateToken, requireAdmin, async (req, res) => {
  try {
    // This would be where you'd test connection to API-Ninjas
    // For now we'll just simulate a successful test
    res.json({
      success: true,
      message: 'API-Ninjas connection test successful',
      data: {
        connected: true,
        latency: 142,
        status: 'active'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'API test failed',
      details: error.message
    });
  }
});

// Sync API-Ninjas data
app.post('/api/admin/sync-api-ninjas', validateToken, requireAdmin, async (req, res) => {
  try {
    // This would sync data from API-Ninjas
    // Simulate a sync operation
    const newCars = Math.floor(Math.random() * 5) + 1;
    const updatedCars = Math.floor(Math.random() * 3);
    
    res.json({
      success: true,
      message: 'Sync completed successfully',
      data: {
        newCars,
        updatedCars,
        totalCars: 42 + newCars // Example total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Sync failed',
      details: error.message
    });
  }
});

// Test CarWale connection
app.post('/api/admin/test-carwale', validateToken, requireAdmin, async (req, res) => {
  try {
    const { apiKey, baseUrl } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    // Simulate testing CarWale API
    res.json({
      success: true,
      message: 'CarWale API connection successful',
      data: {
        connected: true,
        endpoints: [
          '/cars',
          '/brands',
          '/models'
        ].map(endpoint => `${baseUrl}${endpoint}`)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'CarWale API test failed',
      details: error.message
    });
  }
});

// Sync CarWale data
app.post('/api/admin/sync-carwale', validateToken, requireAdmin, async (req, res) => {
  try {
    const { apiKey, baseUrl, endpoints } = req.body;
    
    if (!apiKey || !baseUrl) {
      return res.status(400).json({
        success: false,
        error: 'API configuration is required'
      });
    }

    // Simulate sync operation
    const newCars = Math.floor(Math.random() * 10) + 1;
    const updatedCars = Math.floor(Math.random() * 5);
    
    res.json({
      success: true,
      message: 'CarWale data sync completed',
      data: {
        newCars,
        updatedCars,
        totalCars: 100 + newCars // Example total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'CarWale sync failed',
      details: error.message
    });
  }
});
// ===== TOKEN CLEANUP =====

const cleanupExpiredTokens = async () => {
  try {
    const { data, error } = await supabase
      .from("user_sessions")
      .update({ is_active: false })
      .lt("expires_at", new Date().toISOString())
      .eq("is_active", true);

    if (error) throw error;

    console.log(
      `🧹 Cleaned up expired tokens: ${data?.length || 0} sessions deactivated`
    );
  } catch (error) {
    console.error("Token cleanup error:", error);
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

// ===== ERROR HANDLING =====

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: IS_PRODUCTION ? "Internal server error" : error.message,
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// ===== START SERVER =====

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔐 JWT Token-based authentication enabled`);
  console.log(
    `🛡️ Security middleware: ${IS_PRODUCTION ? "Full" : "Development"}`
  );
  console.log(`📊 Rate limiting: ${IS_PRODUCTION ? "Enabled" : "Disabled"}`);
  console.log(`🍪 HttpOnly cookies: ${IS_PRODUCTION ? "Enabled" : "Disabled"}`);
  console.log(
    `💾 Token storage: ${IS_PRODUCTION ? "HttpOnly cookies" : "localStorage"}`
  );

  if (IS_DEVELOPMENT) {
    console.log(`🔧 Development features enabled:`);
    console.log(`   POST /api/auth/create-test-user`);
    console.log(`   Relaxed rate limiting`);
    console.log(`   Detailed error messages`);
  }

  // Start token cleanup
  cleanupExpiredTokens();
});
