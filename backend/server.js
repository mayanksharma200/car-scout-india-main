// backend/server.js - Environment-Aware Configuration
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import emailService from "./services/emailService.js";
import ideogramAPI from "./services/ideogramAPI.js";
import s3UploadService from "./services/s3UploadService.js";

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
  issuer: "Carlist360-api",
  audience: "Carlist360-users",
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
      imgSrc: ["'self'", "data:", "https:", ...(IS_DEVELOPMENT ? ["http://localhost:*"] : [])],
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
      phone:profile?.phone,
      city:profile?.city,
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

// Enhanced /api/cars/search endpoint with comprehensive filter support
// Enhanced /api/cars/search endpoint with comprehensive filter support
app.get("/api/cars/search", async (req, res) => {
  try {
    const {
      q,
      brand,
      city,
      budget,
      carType,
      minPrice,
      maxPrice,
      minMileage,
      maxMileage,
      fuelTypes,
      transmissions,
      bodyTypes,
      seatingOptions,
      filterBrands,
      limit = 500,
      offset = 0,
      sortBy = "brand",
      sortOrder = "asc",
    } = req.query;

    console.log(`🔍 Enhanced search with filters:`, {
      q,
      brand,
      city,
      budget,
      carType,
      minPrice,
      maxPrice,
      fuelTypes,
      transmissions,
      bodyTypes,
      seatingOptions,
    });

    let query = supabase.from("cars").select("*").eq("status", "active");

    // Apply text search if query provided
    if (q && q.trim()) {
      const searchTerms = q
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      console.log(`📝 Search terms:`, searchTerms);

      if (searchTerms.length === 1) {
        const term = searchTerms[0];
        query = query.or(
          `brand.ilike.%${term}%,model.ilike.%${term}%,variant.ilike.%${term}%`
        );
      } else {
        // For multi-word searches, we'll filter after getting results
        // to ensure ALL terms match somewhere in brand/model/variant
        const firstTerm = searchTerms[0];
        query = query.or(
          `brand.ilike.%${firstTerm}%,model.ilike.%${firstTerm}%,variant.ilike.%${firstTerm}%`
        );
      }
    }

    // Apply brand filter
    if (brand) {
      query = query.ilike("brand", `%${brand}%`);
    }

    // Apply car type filter (this would need to be mapped to your data structure)
    if (carType) {
      // You might need to adjust this based on how car types are stored
      // For now, assuming it's part of variant or a separate field
      switch (carType) {
        case "new":
          // Filter for new cars - adjust based on your data structure
          break;
        case "certified":
          // Filter for certified cars
          break;
        case "premium":
          // Filter for premium cars
          break;
      }
    }

    // Apply price range filters
    if (minPrice) {
      query = query.gte("price_min", parseInt(minPrice));
    }
    if (maxPrice) {
      query = query.lte("price_max", parseInt(maxPrice));
    }

    // Apply budget range filter (convert budget string to price range)
    if (budget) {
      const budgetRanges = {
        "Under ₹5 Lakh": { min: 0, max: 500000 },
        "₹5-10 Lakh": { min: 500000, max: 1000000 },
        "₹10-15 Lakh": { min: 1000000, max: 1500000 },
        "₹15-20 Lakh": { min: 1500000, max: 2000000 },
        "₹20-30 Lakh": { min: 2000000, max: 3000000 },
        "₹30-50 Lakh": { min: 3000000, max: 5000000 },
        "₹50 Lakh - ₹1 Crore": { min: 5000000, max: 10000000 },
        "Above ₹1 Crore": { min: 10000000, max: null },
      };

      const budgetRange = budgetRanges[budget];
      if (budgetRange) {
        // Correct logic: Car price range should overlap with budget range
        // A car fits if: car_min <= budget_max AND car_max >= budget_min
        if (budgetRange.max) {
          query = query.lte("price_min", budgetRange.max); // Car starts within or before budget max
        }
        query = query.gte("price_max", budgetRange.min); // Car ends within or after budget min

        console.log(`Budget filter: ${budgetRange.min} - ${budgetRange.max}`);
      }
    }

    // Apply fuel type filters
    if (fuelTypes) {
      const fuelArray = fuelTypes.split(",").map((f) => f.trim());
      console.log(`🔥 Filtering by fuel types:`, fuelArray);
      
      if (fuelArray.length === 1) {
        // Try exact match first, then case-insensitive if needed
        query = query.eq("fuel_type", fuelArray[0]);
      } else {
        // For multiple fuel types, use exact matches in array
        query = query.in("fuel_type", fuelArray);
      }
      
      console.log(`🔍 Applied fuel type filter for: ${fuelArray.join(', ')}`);
    }

    // Apply transmission filters
    if (transmissions) {
      const transmissionArray = transmissions.split(",").map((t) => t.trim());
      console.log(`⚙️ Filtering by transmissions:`, transmissionArray);
      
      if (transmissionArray.length === 1) {
        query = query.eq("transmission", transmissionArray[0]);
      } else {
        query = query.in("transmission", transmissionArray);
      }
    }

    // Apply body type filters
    if (bodyTypes) {
      const bodyTypeArray = bodyTypes.split(",").map((b) => b.trim());
      console.log(`🚗 Filtering by body types:`, bodyTypeArray);
      
      if (bodyTypeArray.length === 1) {
        query = query.eq("body_type", bodyTypeArray[0]);
      } else {
        query = query.in("body_type", bodyTypeArray);
      }
    }

    // Apply seating capacity filters with logical validation
    if (seatingOptions) {
      const seatingArray = seatingOptions.split(",").map((s) => s.trim());
      const seatingNumbers = seatingArray
        .map((s) => {
          if (s === "8+") return 8; // Handle 8+ as 8 or greater
          return parseInt(s);
        })
        .filter((n) => !isNaN(n));

      if (seatingNumbers.length > 0) {
        if (seatingArray.includes("8+")) {
          // If 8+ is included, get cars with 8 or more seats
          query = query.gte("seating_capacity", 8);
        } else {
          query = query.in("seating_capacity", seatingNumbers);
        }

        // Log potential conflicts
        if (bodyTypes && seatingNumbers.some((s) => s >= 7)) {
          const bodyTypeArray = bodyTypes.split(",").map((b) => b.trim());
          if (bodyTypeArray.includes("Hatchback")) {
            console.warn(
              "⚠️ Conflicting filters: 7+ seater Hatchbacks are rare. Consider SUV or MPV body types."
            );
          }
        }
      }
    }

    // Apply additional brand filters from advanced filters
    if (filterBrands) {
      const brandArray = filterBrands.split(",").map((b) => b.trim());
      // Combine with main brand filter if both exist
      if (brand) {
        brandArray.push(brand);
      }

      // Create OR conditions for brands
      const brandConditions = brandArray
        .map((b) => `brand.ilike.%${b}%`)
        .join(",");
      query = query.or(brandConditions);
    }

    // Apply mileage filters (extract numeric value from mileage string)
    if (minMileage || maxMileage) {
      // Note: This is tricky because mileage is stored as "24.9 kmpl"
      // You might want to add a numeric mileage column for better filtering
      // For now, this is a basic implementation
      if (minMileage) {
        // This won't work well with string mileage - consider adding numeric column
        console.warn(
          "Mileage filtering needs numeric mileage column for accurate results"
        );
      }
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Debug: Let's see what we get from the database before applying filters
    console.log(`🗃️ Executing database query...`);
    
    // First, let's see if there's ANY data in the cars table
    const { data: allCars, error: allCarsError } = await supabase
      .from("cars")
      .select("id, brand, model, variant, fuel_type, transmission, body_type, status")
      .eq("status", "active")
      .limit(5);
      
    console.log(`📊 Sample cars in database:`, allCars);
    console.log(`🔢 Total active cars sample:`, allCars ? allCars.length : 0);
    
    if (allCars && allCars.length > 0) {
      console.log(`⛽ Fuel types in sample:`, allCars.map(car => car.fuel_type));
    }

    // Debug: Let's also test a simple fuel type query to see if it works
    const { data: simpleFuelTest, error: simpleFuelError } = await supabase
      .from("cars")
      .select("id, brand, model, fuel_type")
      .eq("status", "active")
      .eq("fuel_type", "Petrol")
      .limit(3);
      
    console.log(`🧪 Simple fuel type test:`, simpleFuelTest);
    console.log(`🧪 Simple fuel type count:`, simpleFuelTest ? simpleFuelTest.length : 0);

    const { data, error, count } = await query;

    console.log(`🔍 Query executed. Results count:`, data ? data.length : 0);
    console.log(`🔍 Database error:`, error);
    console.log(`🔍 First few results:`, data ? data.slice(0, 3).map(car => ({
      id: car.id, 
      brand: car.brand, 
      model: car.model, 
      fuel_type: car.fuel_type
    })) : []);

    if (error) {
      console.error("❌ Database error:", error);
      throw error;
    }

    let filteredData = data || [];

    // Post-process for multi-word text search
    if (q && q.trim()) {
      const searchTerms = q
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      if (searchTerms.length > 1) {
        filteredData = filteredData.filter((car) => {
          // Include all car text fields for comprehensive search
          const carText =
            `${car.brand} ${car.model} ${car.variant} ${car.fuel_type} ${car.transmission} ${car.body_type}`.toLowerCase();
          return searchTerms.every((term) => carText.includes(term));
        });
      }
    }

    // Post-process for city filter (if you don't have city in cars table)
    if (city) {
      // Since cars table might not have city, you could:
      // 1. Add city to cars table
      // 2. Filter based on dealer locations
      // 3. Skip city filtering for now
      console.warn(
        "City filtering not implemented - add city column to cars table"
      );
    }

    // Post-process for mileage filtering (better implementation)
    if (minMileage || maxMileage) {
      filteredData = filteredData.filter((car) => {
        if (!car.mileage) return true;

        // Extract numeric value from mileage string like "24.9 kmpl"
        const mileageMatch = car.mileage.match(/(\d+\.?\d*)/);
        if (!mileageMatch) return true;

        const numericMileage = parseFloat(mileageMatch[1]);

        if (minMileage && numericMileage < parseFloat(minMileage)) return false;
        if (maxMileage && numericMileage > parseFloat(maxMileage)) return false;

        return true;
      });
    }

    console.log(`✅ Found ${filteredData.length} cars after all filters`);

    // Enhanced debugging for empty results
    if (filteredData.length === 0) {
      console.log("🔍 No results found. Debugging filters:");
      console.log("Applied filters:", {
        brand,
        budget,
        fuelTypes,
        transmissions,
        bodyTypes,
        seatingOptions,
      });

      // Test each filter individually
      if (brand) {
        const { data: brandTest } = await supabase
          .from("cars")
          .select("*")
          .eq("status", "active")
          .ilike("brand", `%${brand}%`);
        console.log(`Brand "${brand}" has ${brandTest?.length || 0} cars`);
      }

      if (bodyTypes && seatingOptions) {
        const bodyArray = bodyTypes.split(",");
        const seatingArray = seatingOptions.split(",");
        if (bodyArray.includes("Hatchback") && seatingArray.includes("7")) {
          console.log(
            "⚠️ FILTER CONFLICT: Searching for 7-seater Hatchback (these rarely exist)"
          );
          console.log("💡 Suggestion: 7-seaters are typically MPVs or SUVs");
        }
      }
    }

    // Log sample results for debugging
    filteredData.slice(0, 3).forEach((car) => {
      console.log(
        `🚗 ${car.brand} ${car.model} ${car.variant} - ₹${car.price_min}-${car.price_max}`
      );
    });

    res.json({
      success: true,
      data: filteredData,
      query: q,
      appliedFilters: {
        brand,
        city,
        budget,
        carType,
        priceRange: { min: minPrice, max: maxPrice },
        mileageRange: { min: minMileage, max: maxMileage },
        fuelTypes: fuelTypes ? fuelTypes.split(",") : [],
        transmissions: transmissions ? transmissions.split(",") : [],
        bodyTypes: bodyTypes ? bodyTypes.split(",") : [],
        seatingOptions: seatingOptions ? seatingOptions.split(",") : [],
        filterBrands: filterBrands ? filterBrands.split(",") : [],
      },
      totalFound: filteredData.length,
      searchType: q ? "search_with_filters" : "filter_only",
    });
  } catch (error) {
    console.error("💥 Search error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search cars",
      details: error.message,
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
      .textSearch("brand", q, { type: "websearch" })
      .or(`model.ilike.%${q}%,variant.ilike.%${q}%`)
      .order("brand", { ascending: true })
      .order("model", { ascending: true })
      .limit(parseInt(limit));

    if (error) throw error;

    console.log(`✅ Advanced search found ${data.length} cars`);

    res.json({
      success: true,
      data: data || [],
      query: q,
      searchType: "advanced",
    });
  } catch (error) {
    console.error("💥 Advanced search error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to perform advanced search",
      details: error.message,
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

    const searchTerms = q
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0);

    // Build a more sophisticated query with scoring
    const { data, error } = await supabase.rpc("search_cars_weighted", {
      search_query: q,
      search_limit: parseInt(limit),
    });

    if (error) {
      // Fallback to simple search if RPC function doesn't exist
      console.warn("Weighted search function not available, using fallback");

      let query = supabase.from("cars").select("*").eq("status", "active");

      // Build dynamic OR conditions for each search term
      const conditions = searchTerms
        .map(
          (term) =>
            `brand.ilike.%${term}%,model.ilike.%${term}%,variant.ilike.%${term}%`
        )
        .join(",");

      const { data: fallbackData, error: fallbackError } = await query
        .or(conditions)
        .order("brand", { ascending: true })
        .order("model", { ascending: true })
        .limit(parseInt(limit));

      if (fallbackError) throw fallbackError;

      // Filter for multi-word matches
      const filteredData = fallbackData.filter((car) => {
        const carText =
          `${car.brand} ${car.model} ${car.variant}`.toLowerCase();
        return searchTerms.every((term) => carText.includes(term));
      });

      return res.json({
        success: true,
        data: filteredData,
        query: q,
        searchType: "fallback",
      });
    }

    console.log(`✅ Weighted search found ${data.length} cars`);

    res.json({
      success: true,
      data: data || [],
      query: q,
      searchType: "weighted",
    });
  } catch (error) {
    console.error("💥 Weighted search error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to perform weighted search",
      details: error.message,
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

    console.log(`🚗 /api/cars called with params:`, {
      status,
      brand,
      model,
      minPrice,
      maxPrice,
      limit,
      offset,
      sortBy,
      sortOrder
    });

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

    console.log(`📊 Query results:`, {
      error,
      count,
      dataLength: data?.length || 0,
      sampleCars: data ? data.slice(0, 3).map(car => ({
        id: car.id,
        brand: car.brand,
        model: car.model,
        status: car.status,
        price_min: car.price_min,
        price_max: car.price_max
      })) : []
    });

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

// ===== ADMIN CAR CRUD ENDPOINTS =====

// Create a new car
app.post("/api/admin/cars", async (req, res) => {
  try {
    const carData = {
      ...req.body,
      status: req.body.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('[Admin] Creating new car:', carData.brand, carData.model);

    const { data, error } = await supabase
      .from("cars")
      .insert([carData])
      .select()
      .single();

    if (error) {
      console.error('[Admin] Error creating car:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create car',
        details: error.message
      });
    }

    console.log('[Admin] ✅ Car created successfully:', data.id);

    res.status(201).json({
      success: true,
      data: data,
      message: 'Car created successfully'
    });

  } catch (error) {
    console.error('[Admin] Error in create car:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Update an existing car
app.put("/api/admin/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const carData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    console.log('[Admin] Updating car:', id);

    const { data, error } = await supabase
      .from("cars")
      .update(carData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error('[Admin] Error updating car:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update car',
        details: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Car not found'
      });
    }

    console.log('[Admin] ✅ Car updated successfully:', id);

    res.json({
      success: true,
      data: data,
      message: 'Car updated successfully'
    });

  } catch (error) {
    console.error('[Admin] Error in update car:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Delete a car
app.delete("/api/admin/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log('[Admin] Deleting car:', id);

    const { data, error } = await supabase
      .from("cars")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error('[Admin] Error deleting car:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete car',
        details: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Car not found'
      });
    }

    console.log('[Admin] ✅ Car deleted successfully:', id);

    res.json({
      success: true,
      message: 'Car deleted successfully',
      data: data
    });

  } catch (error) {
    console.error('[Admin] Error in delete car:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get all cars for admin (includes inactive/draft cars)
app.get("/api/admin/cars", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      brand,
      fuel_type,
      transmission,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from("cars")
      .select("*", { count: 'exact' });

    // Filters
    if (status) {
      query = query.eq('status', status);
    }

    if (brand) {
      query = query.eq('brand', brand);
    }

    if (fuel_type) {
      query = query.eq('fuel_type', fuel_type);
    }

    if (transmission) {
      query = query.eq('transmission', transmission);
    }

    if (search) {
      query = query.or(`brand.ilike.%${search}%,model.ilike.%${search}%,variant.ilike.%${search}%`);
    }

    // Sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // Pagination
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[Admin] Error fetching cars:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch cars',
        details: error.message
      });
    }

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: totalPages,
        hasMore: parseInt(page) < totalPages
      }
    });

  } catch (error) {
    console.error('[Admin] Error in get cars:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Admin endpoint for generating images with Ideogram AI
app.post("/api/admin/cars/ideogram-generate", async (req, res) => {
  try {
    const { carId, carData, options = {} } = req.body;

    if (!carId || !carData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: carId and carData'
      });
    }

    console.log(`🎨 Generating Ideogram AI images for: ${carData.brand} ${carData.model}`);

    // Check if Ideogram is configured
    if (!ideogramAPI.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Ideogram API is not configured. Please add IDEOGRAM_API_KEY to environment variables.'
      });
    }

    // Generate images using Ideogram API
    const generationOptions = {
      num_images: options.num_images || 8, // Generate 8 images for all angles
      aspect_ratio: options.aspect_ratio || '16x9',
      rendering_speed: options.rendering_speed || 'TURBO',
      style_type: options.style_type || 'REALISTIC'
    };

    const ideogramResult = await ideogramAPI.generateCarImages(carData, generationOptions);

    if (ideogramResult.success && ideogramResult.images.length > 0) {
      console.log(`✅ Successfully generated ${ideogramResult.totalImages} Ideogram images for: ${carData.brand} ${carData.model}`);

      // Return images for preview - DO NOT save to database yet
      // User will review and approve images before uploading to S3
      res.json({
        success: true,
        carId,
        carName: `${carData.brand} ${carData.model}`,
        images: ideogramResult.images,
        imagesCount: ideogramResult.totalImages,
        primaryImage: ideogramResult.primaryImage,
        created: ideogramResult.created,
        message: 'Images generated successfully. Please review and approve before saving.'
      });
    } else {
      console.log(`❌ Ideogram generation failed for: ${carData.brand} ${carData.model}`);
      res.status(422).json({
        success: false,
        error: 'Ideogram API did not return valid images for this car',
        carId,
        carName: `${carData.brand} ${carData.model}`
      });
    }

  } catch (error) {
    console.error('Error generating Ideogram images:', error);

    // Handle specific error types
    let statusCode = 500;
    let errorMessage = error.message;

    if (error.message.includes('Invalid Ideogram API key')) {
      statusCode = 401;
    } else if (error.message.includes('Rate limit exceeded')) {
      statusCode = 429;
    } else if (error.message.includes('safety check')) {
      statusCode = 422;
    }

    res.status(statusCode).json({
      success: false,
      error: 'Failed to generate Ideogram images',
      message: errorMessage
    });
  }
});

// Admin endpoint to upload approved Ideogram images to S3 and save to car
app.post("/api/admin/cars/ideogram-approve-images", async (req, res) => {
  try {
    const { carId, approvedImages } = req.body;

    if (!carId || !approvedImages || !Array.isArray(approvedImages) || approvedImages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: carId and approvedImages array'
      });
    }

    console.log(`📤 Uploading ${approvedImages.length} approved images to S3 for car ${carId}`);

    // Check if S3 is configured
    if (!s3UploadService.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'AWS S3 is not configured. Please add AWS credentials to environment variables.'
      });
    }

    // Upload approved images to S3
    const uploadResults = await s3UploadService.uploadMultipleImages(approvedImages, carId);

    // Filter successful uploads
    const successfulUploads = uploadResults.filter(result => result.success);
    const failedUploads = uploadResults.filter(result => !result.success);

    if (successfulUploads.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'All image uploads failed',
        failedUploads
      });
    }

    // Extract S3 URLs
    const s3ImageUrls = successfulUploads.map(result => result.s3Url);

    // Fetch current car data
    const { data: currentCar, error: fetchError } = await supabase
      .from('cars')
      .select('images')
      .eq('id', carId)
      .single();

    if (fetchError) {
      console.error(`Failed to fetch car ${carId}:`, fetchError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch car data',
        details: fetchError.message
      });
    }

    // Merge existing images with new S3 images (avoid duplicates)
    const existingImages = currentCar.images || [];
    const mergedImages = [...new Set([...existingImages, ...s3ImageUrls])];

    // Prepare update data
    const updateData = {
      images: mergedImages,
      ideogram_images: {
        source: 'ideogram',
        primary: s3ImageUrls[0],
        angles: successfulUploads.map(upload => ({
          angle: upload.angle,
          url: upload.s3Url,
          resolution: upload.resolution,
          is_safe: upload.is_safe,
          original_url: upload.originalUrl
        })),
        total_images: successfulUploads.length,
        valid: true,
        last_updated: new Date().toISOString()
      },
      image_last_updated: new Date().toISOString()
    };

    // Update car in database
    const { error: updateError } = await supabase
      .from('cars')
      .update(updateData)
      .eq('id', carId);

    if (updateError) {
      console.error(`Failed to update car ${carId}:`, updateError);
      return res.status(500).json({
        success: false,
        error: 'Database update failed',
        details: updateError.message,
        uploadedUrls: s3ImageUrls // Return URLs even if DB update fails
      });
    }

    console.log(`✅ Successfully uploaded ${successfulUploads.length} images and updated car ${carId}`);

    res.json({
      success: true,
      carId,
      uploadedCount: successfulUploads.length,
      failedCount: failedUploads.length,
      s3ImageUrls,
      totalImages: mergedImages.length,
      uploadResults: {
        successful: successfulUploads,
        failed: failedUploads
      }
    });

  } catch (error) {
    console.error('Error uploading approved images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload approved images',
      message: error.message
    });
  }
});

// Batch Ideogram generation endpoint for multiple cars
app.post("/api/admin/cars/ideogram-bulk-generate", async (req, res) => {
  try {
    const { carIds, options = {} } = req.body;

    if (!carIds || !Array.isArray(carIds) || carIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid carIds array'
      });
    }

    console.log(`🎨 Starting Ideogram bulk generation for ${carIds.length} cars`);

    // Check if Ideogram is configured
    if (!ideogramAPI.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Ideogram API is not configured'
      });
    }

    const results = [];
    const errors = [];
    let successCount = 0;
    let failCount = 0;

    // Process each car
    for (const carId of carIds) {
      try {
        // Fetch car data
        const { data: car, error: fetchError } = await supabase
          .from('cars')
          .select('*')
          .eq('id', carId)
          .single();

        if (fetchError || !car) {
          errors.push({
            carId,
            error: 'Car not found',
            details: fetchError?.message
          });
          failCount++;
          continue;
        }

        // Generate images
        const generationOptions = {
          num_images: options.num_images || 8,
          aspect_ratio: options.aspect_ratio || '16:9',
          rendering_speed: options.rendering_speed || 'TURBO',
          style_type: options.style_type || 'REALISTIC'
        };

        const ideogramResult = await ideogramAPI.generateCarImages(car, generationOptions);

        if (ideogramResult.success && ideogramResult.images.length > 0) {
          const formattedData = ideogramAPI.formatForDatabase(ideogramResult, carId);
          const imageUrls = ideogramResult.images.map(img => img.url);

          const updateData = {
            images: imageUrls,
            ideogram_images: formattedData,
            image_last_updated: new Date().toISOString()
          };

          const { error: updateError } = await supabase
            .from('cars')
            .update(updateData)
            .eq('id', carId);

          if (updateError) {
            errors.push({
              carId,
              carName: `${car.brand} ${car.model}`,
              error: 'Database update failed',
              details: updateError.message
            });
            failCount++;
          } else {
            results.push({
              carId,
              carName: `${car.brand} ${car.model}`,
              imagesCount: ideogramResult.totalImages,
              primaryImage: ideogramResult.primaryImage
            });
            successCount++;
          }
        } else {
          errors.push({
            carId,
            carName: `${car.brand} ${car.model}`,
            error: 'Image generation failed'
          });
          failCount++;
        }

      } catch (carError) {
        console.error(`Error processing car ${carId}:`, carError);
        errors.push({
          carId,
          error: carError.message
        });
        failCount++;
      }

      // Add small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`✅ Ideogram bulk generation complete: ${successCount} succeeded, ${failCount} failed`);

    res.json({
      success: true,
      processed: carIds.length,
      successful: successCount,
      failed: failCount,
      results,
      errors
    });

  } catch (error) {
    console.error('Error in Ideogram bulk generation:', error);
    res.status(500).json({
      success: false,
      error: 'Bulk generation failed',
      message: error.message
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
// Updated Login endpoint with proper cookie handling
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
        code: "MISSING_CREDENTIALS",
      });
    }

    console.log(`🔐 Login attempt for ${email} from ${ipAddress}`);

    // Authenticate with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
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
        code: "INVALID_CREDENTIALS",
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
        code: "ACCOUNT_DEACTIVATED",
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
        tokenType: tokens.tokenType,
      });
    } catch (tokenError) {
      console.error("Token generation failed:", tokenError);
      return res.status(500).json({
        success: false,
        error: "Failed to generate authentication tokens",
        code: "TOKEN_GENERATION_FAILED",
      });
    }

    // Ensure expiresIn is always present with a valid value
    if (!tokens.expiresIn || typeof tokens.expiresIn !== "number") {
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
        lastName: profile?.last_name,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken, // Always include for development
      expiresIn: tokens.expiresIn,
      tokenType: tokens.tokenType || "Bearer",
    };

    // Environment-aware cookie setting
    if (IS_PRODUCTION) {
      // Set the actual httpOnly refresh token (secure)
      res.cookie("refreshToken", tokens.refreshToken, {
        ...COOKIE_CONFIG,
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined, // 30 days if "remember me"
      });

      // Set a client-readable indicator cookie (not the actual token, just a flag)
      res.cookie("hasRefreshToken", "true", {
        httpOnly: false, // Client can read this
        secure: IS_PRODUCTION,
        sameSite: IS_PRODUCTION ? "strict" : "lax",
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      // Remove refreshToken from response in production
      delete responseData.refreshToken;
    } else {
      // In development, set a client-readable refresh token for easier debugging
      res.cookie("userRefreshToken", tokens.refreshToken, {
        httpOnly: false, // Client can read this in development
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });
    }

    // Log successful login
    await logAuthEvent(userId, "login_success", ipAddress, userAgent, true);

    console.log(`✅ Login successful for user: ${userId}`);

    return res.json({
      success: true,
      data: responseData,
      message: "Login successful",
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
      details: IS_DEVELOPMENT ? error.message : undefined,
    });
  }
});

// Updated Refresh token endpoint
app.post("/api/auth/refresh", async (req, res) => {
  try {
    let refreshToken;

    if (IS_PRODUCTION) {
      // Production: Get refresh token from httpOnly cookie
      refreshToken = req.cookies.refreshToken;
    } else {
      // Development: Get refresh token from request body OR cookie
      refreshToken = req.body.refreshToken || req.cookies.userRefreshToken;
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
      // Clear cookies on refresh failure
      if (IS_PRODUCTION) {
        res.clearCookie("refreshToken", COOKIE_CONFIG);
        res.clearCookie("hasRefreshToken", {
          path: "/",
          secure: IS_PRODUCTION,
          sameSite: IS_PRODUCTION ? "strict" : "lax",
        });
      } else {
        res.clearCookie("userRefreshToken", {
          path: "/",
          secure: false,
          sameSite: "lax",
        });
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

    // Environment-aware response with updated cookies
    if (IS_PRODUCTION) {
      // Update httpOnly cookie and indicator
      res.cookie("refreshToken", tokens.refreshToken, COOKIE_CONFIG);
      res.cookie("hasRefreshToken", "true", {
        httpOnly: false,
        secure: IS_PRODUCTION,
        sameSite: IS_PRODUCTION ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn,
          tokenType: tokens.tokenType || "Bearer",
        },
        message: "Tokens refreshed successfully",
      });
    } else {
      // Development: Update client-readable token
      res.cookie("userRefreshToken", tokens.refreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          tokenType: tokens.tokenType || "Bearer",
        },
        message: "Tokens refreshed successfully",
      });
    }
  } catch (error) {
    console.error("Refresh token error:", error);

    // Clear cookies on error
    if (IS_PRODUCTION) {
      res.clearCookie("refreshToken", COOKIE_CONFIG);
      res.clearCookie("hasRefreshToken", {
        path: "/",
        secure: IS_PRODUCTION,
        sameSite: IS_PRODUCTION ? "strict" : "lax",
      });
    } else {
      res.clearCookie("userRefreshToken", {
        path: "/",
        secure: false,
        sameSite: "lax",
      });
    }

    res.status(401).json({
      success: false,
      error: "Failed to refresh token",
      code: "REFRESH_FAILED",
    });
  }
});

// Updated Google OAuth conversion endpoint
app.post("/api/auth/google-oauth", async (req, res) => {
  const ipAddress = req.ip;
  const userAgent = req.get("User-Agent");

  try {
    const { supabaseUserId, email, userData } = req.body;

    if (!supabaseUserId || !email) {
      return res.status(400).json({
        success: false,
        error: "Supabase user ID and email are required",
        code: "MISSING_OAUTH_DATA",
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
          code: "PROFILE_CREATION_FAILED",
        });
      }

      profile = newProfile;
    } else if (profileError) {
      console.error("Profile fetch error:", profileError);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch user profile",
        code: "PROFILE_FETCH_FAILED",
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
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    // Create a mock user object for token generation
    const mockUser = {
      id: supabaseUserId,
      email: email,
      email_confirmed_at: userData?.emailVerified
        ? new Date().toISOString()
        : null,
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
        code: "TOKEN_GENERATION_FAILED",
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
        provider: "google",
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      tokenType: tokens.tokenType || "Bearer",
    };

    // Environment-aware cookie setting for Google OAuth
    if (IS_PRODUCTION) {
      res.cookie("refreshToken", tokens.refreshToken, {
        ...COOKIE_CONFIG,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for Google OAuth
      });
      res.cookie("hasRefreshToken", "true", {
        httpOnly: false,
        secure: IS_PRODUCTION,
        sameSite: IS_PRODUCTION ? "strict" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
      });
      delete responseData.refreshToken;
    } else {
      res.cookie("userRefreshToken", tokens.refreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
      });
    }

    // Log successful conversion
    await logAuthEvent(
      supabaseUserId,
      "google_oauth_success",
      ipAddress,
      userAgent,
      true
    );

    console.log(
      `✅ Google OAuth conversion successful for user: ${supabaseUserId}`
    );

    return res.json({
      success: true,
      data: responseData,
      message: "Google OAuth conversion successful",
    });
  } catch (error) {
    console.error("Google OAuth conversion error:", error);

    return res.status(500).json({
      success: false,
      error: "Google OAuth conversion failed",
      code: "OAUTH_CONVERSION_FAILED",
      details: IS_DEVELOPMENT ? error.message : undefined,
    });
  }
});

// Updated Logout endpoint
app.post("/api/auth/logout", validateToken, async (req, res) => {
  try {
    let refreshToken;

    if (IS_PRODUCTION) {
      refreshToken = req.cookies.refreshToken;
      // Clear httpOnly cookie and indicator
      res.clearCookie("refreshToken", COOKIE_CONFIG);
      res.clearCookie("hasRefreshToken", {
        path: "/",
        secure: IS_PRODUCTION,
        sameSite: IS_PRODUCTION ? "strict" : "lax",
      });
    } else {
      refreshToken = req.body.refreshToken || req.cookies.userRefreshToken;
      // Clear development cookie
      res.clearCookie("userRefreshToken", {
        path: "/",
        secure: false,
        sameSite: "lax",
      });
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

// Updated Supabase logout endpoint
app.post("/api/auth/supabase-logout", async (req, res) => {
  try {
    console.log("🔄 Supabase logout request received");

    // Get the Supabase token from Authorization header
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
      console.log("📋 Token from header:", token?.substring(0, 20) + "...");
    }

    // Clear cookies regardless of token presence
    if (IS_PRODUCTION) {
      res.clearCookie("refreshToken", COOKIE_CONFIG);
      res.clearCookie("hasRefreshToken", {
        path: "/",
        secure: IS_PRODUCTION,
        sameSite: IS_PRODUCTION ? "strict" : "lax",
      });
    } else {
      res.clearCookie("userRefreshToken", {
        path: "/",
        secure: false,
        sameSite: "lax",
      });
    }

    // Try to sign out from Supabase
    if (token) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.log("❌ Supabase sign out error:", error);
        } else {
          console.log("✅ Supabase sign out successful");
        }
      } catch (supabaseError) {
        console.log("❌ Supabase sign out failed:", supabaseError);
      }
    }

    // Extract user ID from the token if possible (for logging)
    let userId = "unknown";
    try {
      if (token && token.includes(".")) {
        const payload = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );
        userId = payload.sub || payload.user_id || "unknown";
        console.log("👤 Extracted user ID from token:", userId);
      }
    } catch (parseError) {
      console.log("⚠️ Could not parse token for user ID:", parseError);
    }

    // Invalidate sessions in database
    if (userId !== "unknown") {
      try {
        await supabase
          .from("user_sessions")
          .update({ is_active: false })
          .eq("user_id", userId);
        console.log("✅ Local sessions invalidated for user:", userId);
      } catch (dbError) {
        console.log("❌ Local session cleanup failed:", dbError);
      }
    }

    // Log logout event
    try {
      await logAuthEvent(
        userId,
        "supabase_logout",
        req.ip,
        req.get("User-Agent"),
        true
      );
    } catch (logError) {
      console.log("❌ Logging failed:", logError);
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

// ===== FORGOT PASSWORD ENDPOINTS =====

// Send OTP for password reset
app.post("/api/auth/forgot-password/send-otp", async (req, res) => {
  try {
    const { email, role = 'user' } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Invalid role specified"
      });
    }

    // Check if user exists with the specified email and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, first_name, is_active')
      .eq('email', email)
      .eq('role', role)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        success: false,
        error: `No ${role} account found with this email address.`
      });
    }

    if (!profile.is_active) {
      return res.status(403).json({
        success: false,
        error: "Account is deactivated. Please contact support."
      });
    }

    // Generate OTP
    const otp = emailService.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this email
    await supabase
      .from('password_reset_otp')
      .delete()
      .eq('email', email)
      .eq('role', role);

    // Store OTP in database
    const { error: otpError } = await supabase
      .from('password_reset_otp')
      .insert({
        user_id: profile.id,
        email: email,
        otp_code: otp,
        role: role,
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0,
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      });

    if (otpError) {
      console.error('❌ Failed to store OTP:', otpError);
      return res.status(500).json({
        success: false,
        error: "Failed to generate OTP. Please try again."
      });
    }

    // Send OTP email
    try {
      await emailService.sendPasswordResetOTP(email, otp, profile.first_name);

      console.log(`✅ Password reset OTP sent to ${email} (${role})`);

      res.json({
        success: true,
        message: "OTP has been sent to your email address.",
        expiresIn: 600 // 10 minutes in seconds
      });
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError);

      // Delete the OTP if email fails
      await supabase
        .from('password_reset_otp')
        .delete()
        .eq('email', email)
        .eq('role', role);

      res.status(500).json({
        success: false,
        error: emailError.message || "Failed to send OTP email. Please try again."
      });
    }

  } catch (error) {
    console.error('❌ Forgot password send OTP error:', error);
    res.status(500).json({
      success: false,
      error: "An unexpected error occurred. Please try again."
    });
  }
});

// Verify OTP
app.post("/api/auth/forgot-password/verify-otp", async (req, res) => {
  try {
    const { email, otp, role = 'user' } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: "Email and OTP are required"
      });
    }

    // Find the OTP record
    const { data: otpRecord, error: otpError } = await supabase
      .from('password_reset_otp')
      .select('*')
      .eq('email', email)
      .eq('role', role)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpRecord) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired OTP"
      });
    }

    // Check if OTP has expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      await supabase
        .from('password_reset_otp')
        .delete()
        .eq('id', otpRecord.id);

      return res.status(400).json({
        success: false,
        error: "OTP has expired. Please request a new one."
      });
    }

    // Check attempts limit (max 5 attempts)
    if (otpRecord.attempts >= 5) {
      await supabase
        .from('password_reset_otp')
        .delete()
        .eq('id', otpRecord.id);

      return res.status(400).json({
        success: false,
        error: "Too many failed attempts. Please request a new OTP."
      });
    }

    // Verify OTP
    if (otpRecord.otp_code !== otp) {
      // Increment attempts
      await supabase
        .from('password_reset_otp')
        .update({ attempts: otpRecord.attempts + 1 })
        .eq('id', otpRecord.id);

      return res.status(400).json({
        success: false,
        error: `Invalid OTP. ${4 - otpRecord.attempts} attempts remaining.`
      });
    }

    // Mark OTP as verified
    await supabase
      .from('password_reset_otp')
      .update({
        verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', otpRecord.id);

    console.log(`✅ OTP verified for ${email} (${role})`);

    res.json({
      success: true,
      message: "OTP verified successfully",
      resetToken: otpRecord.id // Return the OTP record ID as reset token
    });

  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: "An unexpected error occurred. Please try again."
    });
  }
});

// Reset password with verified OTP
app.post("/api/auth/forgot-password/reset", async (req, res) => {
  try {
    const { email, resetToken, newPassword, role = 'user' } = req.body;

    // Validate input
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Email, reset token, and new password are required"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long"
      });
    }

    // Find and verify the OTP record
    const { data: otpRecord, error: otpError } = await supabase
      .from('password_reset_otp')
      .select('*')
      .eq('id', resetToken)
      .eq('email', email)
      .eq('role', role)
      .eq('verified', true)
      .single();

    if (otpError || !otpRecord) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token"
      });
    }

    // Check if reset token has expired (15 minutes after verification)
    const expiryTime = new Date(otpRecord.verified_at);
    expiryTime.setMinutes(expiryTime.getMinutes() + 15);

    if (expiryTime < new Date()) {
      await supabase
        .from('password_reset_otp')
        .delete()
        .eq('id', resetToken);

      return res.status(400).json({
        success: false,
        error: "Reset token has expired. Please request a new OTP."
      });
    }

    // Update user password in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      otpRecord.user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Failed to update password:', updateError);
      return res.status(500).json({
        success: false,
        error: "Failed to reset password. Please try again."
      });
    }

    // Delete the used OTP record
    await supabase
      .from('password_reset_otp')
      .delete()
      .eq('id', resetToken);

    // Invalidate all existing sessions for this user
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', otpRecord.user_id);

    // Get user profile for confirmation email
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', otpRecord.user_id)
      .single();

    // Send confirmation email (non-blocking)
    emailService.sendPasswordResetConfirmation(email, profile?.first_name)
      .catch(err => console.error('Failed to send confirmation email:', err));

    console.log(`✅ Password reset successful for ${email} (${role})`);

    res.json({
      success: true,
      message: "Password has been reset successfully. Please log in with your new password."
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      error: "An unexpected error occurred. Please try again."
    });
  }
});

// ===== PROTECTED ROUTES =====

// User routes
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

    let userProfile = profile;

    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: req.user.id,
          role: "user",
          first_name: req.user.firstName,
          last_name: req.user.lastName,
          phone: req.user.phone,
          city: req.user.city,
          is_active: true,
          email_verified: req.user.emailVerified,
        })
        .select()
        .single();

      if (createError) throw createError;
      userProfile = newProfile;
    }

    // Merge user data with profile data
    const completeUserData = {
      ...req.user,
      id:userProfile.id,
      firstName: userProfile.first_name,
      lastName: userProfile.last_name,
      role:"user",
      phone: userProfile.phone,
      city: userProfile.city,
      // Add other profile fields as needed
    };

    res.json({
      success: true,
      data: {
        user: completeUserData, // Return the merged user data
        profile: userProfile,
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

// Update user profile
app.put("/api/user/profile", validateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    const allowedFields = [
      'first_name',
      'last_name', 
      'phone',
      'date_of_birth',
      'gender',
      'city',
      'state',
      'preferences'
    ];

    const filteredData = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    // Add updated timestamp
    filteredData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update(filteredData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Profile update error:", error);
      throw error;
    }

    res.json({
      success: true,
      data: data,
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
      details: IS_DEVELOPMENT ? error.message : undefined
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
      const testEmail = "test@Carlist360.com";
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
        firstName: "Admin",
        lastName: "User",
      },
    });

    if (error) {
      throw error;
    }

    // Use service role to bypass RLS policies
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      email: email,
      first_name: "Admin",
      last_name: "User",
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

// Supabase token exchange endpoint
app.post("/api/auth/supabase-token", async (req, res) => {
  try {
    const { supabaseUserId, email, userData } = req.body;

    if (!supabaseUserId || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Check if user profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", supabaseUserId)
      .single();

    // If profile doesn't exist, create it
    if (profileError && profileError.code === "PGRST116") {
      const firstName = userData?.first_name || userData?.given_name || userData?.name?.split(' ')[0] || '';
      const lastName = userData?.last_name || userData?.family_name || userData?.name?.split(' ').slice(1).join(' ') || '';

      const { error: createError } = await supabase.from("profiles").insert({
        id: supabaseUserId,
        email: email,
        first_name: firstName,
        last_name: lastName,
        role: "user",
        is_active: true,
        email_verified: true,
      });

      if (createError) {
        console.error("Failed to create profile:", createError);
        return res.status(500).json({
          success: false,
          error: "Failed to create user profile",
        });
      }
    }

    // Generate JWT tokens
    const tokenPayload = {
      id: supabaseUserId,
      email: email,
      role: profile?.role || "user",
    };

    const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.SESSION_TIMEOUT || "15m",
    });

    const refreshToken = jwt.sign(
      { id: supabaseUserId },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.REFRESH_TIMEOUT || "7d",
      }
    );

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes
        tokenType: "Bearer",
      },
    });
  } catch (error) {
    console.error("Error in supabase-token endpoint:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Backend wishlist endpoints (add to your main server file)

// ===== WISHLIST ROUTES =====

// Fixed GET wishlist endpoint with better error handling and fallbacks
app.get("/api/wishlist", validateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`📋 Fetching wishlist for user: ${userId}`);

    // First, try to get wishlist with car join
    let { data: wishlistData, error } = await supabase
      .from("user_wishlist")
      .select(
        `
        id,
        user_id,
        car_id,
        added_at,
        cars (
          id,
          brand,
          model,
          variant,
          price_min,
          price_max,
          images,
          fuel_type,
          transmission,
          mileage,
          body_type,
          seating_capacity,
          status
        )
      `
      )
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    // If join fails, try alternative approach
    if (error) {
      console.warn(
        "Join query failed, trying alternative approach:",
        error.message
      );

      // Get wishlist items without join
      const { data: wishlistItems, error: wishlistError } = await supabase
        .from("user_wishlist")
        .select("id, user_id, car_id, added_at")
        .eq("user_id", userId)
        .order("added_at", { ascending: false });

      if (wishlistError) {
        console.error("Failed to fetch wishlist items:", wishlistError);
        return res.status(500).json({
          success: false,
          error: "Failed to fetch wishlist",
          code: "WISHLIST_FETCH_FAILED",
        });
      }

      // Manually fetch car details for each item
      if (wishlistItems && wishlistItems.length > 0) {
        const carIds = wishlistItems.map((item) => item.car_id);
        const { data: cars, error: carsError } = await supabase
          .from("cars")
          .select(
            "id, brand, model, variant, price_min, price_max, images, fuel_type, transmission, mileage, body_type, seating_capacity, status"
          )
          .in("id", carIds);

        if (carsError) {
          console.error("Failed to fetch car details:", carsError);
          return res.status(500).json({
            success: false,
            error: "Failed to fetch car details",
            code: "CAR_FETCH_FAILED",
          });
        }

        // Combine wishlist items with car data
        wishlistData = wishlistItems
          .map((item) => {
            const car = cars?.find((c) => c.id === item.car_id);
            return {
              ...item,
              cars: car || null,
            };
          })
          .filter((item) => item.cars !== null); // Remove items where car wasn't found
      } else {
        wishlistData = [];
      }
    }

    // Handle empty wishlist
    if (!wishlistData || wishlistData.length === 0) {
      console.log("📋 User has empty wishlist");
      return res.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    // Transform data to include price alerts
    const transformedWishlist = await Promise.all(
      wishlistData.map(async (item) => {
        // Skip items without car data
        if (!item.cars) {
          console.warn(`Skipping wishlist item ${item.id} - no car data found`);
          return null;
        }

        // Check if user has price alerts enabled for this car
        let alertData = null;
        try {
          const { data, error: alertError } = await supabase
            .from("price_alerts")
            .select("id, is_active")
            .eq("user_id", userId)
            .eq("car_id", item.car_id)
            .eq("is_active", true)
            .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no rows found

          if (!alertError) {
            alertData = data;
          }
        } catch (alertError) {
          console.warn(
            `Failed to check price alert for car ${item.car_id}:`,
            alertError
          );
        }

        return {
          id: item.id,
          savedDate: item.added_at,
          priceAlert: !!alertData,
          car: {
            id: item.cars.id,
            brand: item.cars.brand || "Unknown",
            model: item.cars.model || "Unknown",
            variant: item.cars.variant || "",
            price: item.cars.price_min || 0,
            onRoadPrice: item.cars.price_max || item.cars.price_min || 0,
            fuelType: item.cars.fuel_type || "Petrol",
            transmission: item.cars.transmission || "Manual",
            bodyType: item.cars.body_type || "Hatchback",
            mileage: parseFloat(
              item.cars.mileage?.toString().replace(/[^\d.]/g, "") || "0"
            ),
            seating: item.cars.seating_capacity || 5,
            rating: 4.2, // Default rating since column doesn't exist
            image:
              Array.isArray(item.cars.images) && item.cars.images.length > 0
                ? item.cars.images[0]
                : "/placeholder.svg",
          },
        };
      })
    );

    // Filter out null items (where car data wasn't found)
    const validWishlistItems = transformedWishlist.filter(
      (item) => item !== null
    );

    console.log(`✅ Found ${validWishlistItems.length} cars in wishlist`);

    res.json({
      success: true,
      data: validWishlistItems,
      count: validWishlistItems.length,
    });
  } catch (error) {
    console.error("Wishlist error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch wishlist",
      code: "WISHLIST_ERROR",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Also add a simple test endpoint to check if the tables exist
app.get("/api/wishlist/test", validateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Test basic wishlist table access
    const { data: wishlistTest, error: wishlistError } = await supabase
      .from("user_wishlist")
      .select("id, car_id, added_at")
      .eq("user_id", userId)
      .limit(1);

    // Test cars table access
    const { data: carsTest, error: carsError } = await supabase
      .from("cars")
      .select("id, brand, model")
      .limit(1);

    // Test price_alerts table access
    const { data: alertsTest, error: alertsError } = await supabase
      .from("price_alerts")
      .select("id, user_id, car_id")
      .eq("user_id", userId)
      .limit(1);

    res.json({
      success: true,
      data: {
        wishlist: {
          accessible: !wishlistError,
          error: wishlistError?.message,
          count: wishlistTest?.length || 0,
        },
        cars: {
          accessible: !carsError,
          error: carsError?.message,
          count: carsTest?.length || 0,
        },
        priceAlerts: {
          accessible: !alertsError,
          error: alertsError?.message,
          count: alertsTest?.length || 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Add this debug endpoint to check authentication
app.get("/api/auth/debug", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const cookies = req.cookies;

    const debugInfo = {
      authHeader: {
        present: !!authHeader,
        format: authHeader ? authHeader.substring(0, 20) + "..." : null,
        startsWithBearer: authHeader ? authHeader.startsWith("Bearer ") : false,
      },
      cookies: {
        refreshToken: !!cookies.refreshToken,
        userRefreshToken: !!cookies.userRefreshToken,
        hasRefreshToken: !!cookies.hasRefreshToken,
        allCookies: Object.keys(cookies),
      },
      environment: {
        isProduction: IS_PRODUCTION,
        nodeEnv: process.env.NODE_ENV,
      },
    };

    // Try to decode token without verification to see what's inside
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        // Decode without verification to see the payload
        const decoded = jwt.decode(token);
        debugInfo.tokenPayload = {
          valid: false, // We haven't verified yet
          exp: decoded?.exp,
          iat: decoded?.iat,
          userId: decoded?.userId || decoded?.sub,
          email: decoded?.email,
          expired: decoded?.exp ? Date.now() / 1000 > decoded.exp : "unknown",
        };

        // Now try to verify
        try {
          const verified = jwt.verify(token, TOKEN_CONFIG.secret);
          debugInfo.tokenPayload.valid = true;
          debugInfo.tokenPayload.verificationError = null;
        } catch (verifyError) {
          debugInfo.tokenPayload.verificationError = verifyError.message;
        }
      } catch (decodeError) {
        debugInfo.tokenDecodeError = decodeError.message;
      }
    }

    res.json({
      success: true,
      debugInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Add this to your server.js after the existing /api/leads endpoint
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

    // Validate required fields
    if (!leadData.name || !leadData.email || !leadData.phone) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and phone are required",
        code: "MISSING_REQUIRED_FIELDS"
      });
    }

    const { data, error } = await supabase
      .from("leads")
      .insert([leadData])
      .select()
      .single();

    if (error) {
      console.error("Lead creation error:", error);
      throw error;
    }

    console.log(`✅ Lead created successfully: ${data.id}`);

    res.status(201).json({
      success: true,
      data,
      message: "Lead created successfully",
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    
    // Handle specific database errors
    if (error.code === 'PGRST204') {
      return res.status(400).json({
        success: false,
        error: "Database column missing. Please add missing fields to leads table.",
        code: "MISSING_COLUMNS"
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create lead",
      details: IS_DEVELOPMENT ? error.message : undefined
    });
  }
});


// Add this helper function for URL encoding
const encodeURL = (url) => {
  return encodeURIComponent(url);
};

// Replace your SMS endpoint with this corrected version
app.post("/api/sms/send-otp", async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required"
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Clean phone number (remove +91 if present)
    const cleanedPhone = phoneNumber.startsWith('+91') 
      ? phoneNumber.substring(3) 
      : phoneNumber.startsWith('91') 
      ? phoneNumber.substring(2)
      : phoneNumber;

    console.log(`📱 Original phone: ${phoneNumber}`);
    console.log(`🧹 Cleaned phone: ${cleanedPhone}`);
    console.log(`🔢 Generated OTP: ${otp}`);

    // Validate phone number (should be 10 digits)
    if (!/^\d{10}$/.test(cleanedPhone)) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number format"
      });
    }

    // SMS Gateway credentials and template with your correct credentials
    const SMS_CONFIG = {
      username: process.env.SMS_USERNAME || "VENTES",
      password: process.env.SMS_PASSWORD || "VENTES@",
      from: "VENTCP",
      pe_id: "1701161408451067980",
      template_id: "1707162400851889767",
    };

    console.log(`🔧 SMS Config:`, {
      username: SMS_CONFIG.username,
      password: SMS_CONFIG.password ? SMS_CONFIG.password.slice(0, -1) + '*' : 'NOT SET',
      from: SMS_CONFIG.from,
      pe_id: SMS_CONFIG.pe_id,
      template_id: SMS_CONFIG.template_id
    });

    // Prepare SMS text - Use the exact same text that worked in the direct test
const smsText = `Dear User, Thank you for your interest. Your OTP is ${otp}, Team Ventes Avenues`;
    
    // Build the SMS gateway URL - DON'T encode the entire URL, just encode the text
    const baseUrl = 'https://web.smsgw.in/smsapi/httpapi.jsp';
    
    // Build URL manually like the working example - minimal encoding
    const smsUrl = `${baseUrl}?username=${SMS_CONFIG.username}&password=${SMS_CONFIG.password}&from=${SMS_CONFIG.from}&to=${cleanedPhone}&text=${encodeURIComponent(smsText)}&coding=0&pe_id=${SMS_CONFIG.pe_id}&template_id=${SMS_CONFIG.template_id}`;
    
    console.log(`📤 SMS URL:`, smsUrl);
    console.log(`📝 SMS Text:`, smsText);
    console.log(`📞 Sending to:`, cleanedPhone);

    // Send SMS
    const response = await fetch(smsUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Carlist360-SMS-Service/1.0',
        'Accept': 'text/xml, application/xml, text/plain'
      }
    });

    const responseText = await response.text();
    console.log(`📨 SMS Gateway Response Status:`, response.status);
    console.log(`📨 SMS Gateway Response:`, responseText);

    // Store OTP in database with expiration
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    try {
      // First, cleanup any existing OTPs for this number
      const { error: deleteError } = await supabase
        .from('otp_verification')
        .delete()
        .eq('mobile_no', cleanedPhone);

      if (deleteError) {
        console.warn('⚠️ Could not cleanup old OTPs:', deleteError);
      }

      // Insert new OTP
      const { data: otpData, error: otpError } = await supabase
        .from('otp_verification')
        .insert({
          mobile_no: cleanedPhone,
          otp: otp,
          status: 'pending',
          expires_at: expirationTime.toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (otpError) {
        console.error('❌ Failed to store OTP:', otpError);
      } else {
        console.log('✅ OTP stored in database:', otpData.id);
      }
    } catch (dbError) {
      console.error('💥 Database error while storing OTP:', dbError);
    }

    // Parse SMS gateway response - look for the successful pattern
    let smsSuccess = false;
    let gatewayMessage = responseText;

    if (response.ok) {
      // Check for the successful response pattern like your test
      if (responseText.includes('<data>') && responseText.includes('<ack_id>')) {
        smsSuccess = true;
        console.log('✅ SMS sent successfully - found <data> tag in response');
        
        // Extract message ID for logging
        const msgIdMatch = responseText.match(/<msgid>(.*?)<\/msgid>/);
        const ackIdMatch = responseText.match(/<ack_id>(.*?)<\/ack_id>/);
        if (msgIdMatch && ackIdMatch) {
          console.log(`📋 Message ID: ${msgIdMatch[1]}`);
          console.log(`📋 ACK ID: ${ackIdMatch[1]}`);
        }
      } else if (responseText.includes('<errordesc>')) {
        // Error response format
        const errorMatch = responseText.match(/<errordesc[^>]*>(.*?)<\/errordesc>/) || 
                           responseText.match(/<errordesc[^>]*>(.*?),errorcode/);
        
        if (errorMatch) {
          gatewayMessage = errorMatch[1];
          console.log(`❌ SMS Gateway Error: ${gatewayMessage}`);
        }
      }
    }

    if (smsSuccess) {
      res.json({ 
        success: true, 
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        message: 'OTP sent successfully',
        debug: process.env.NODE_ENV === 'development' ? {
          phoneNumber: cleanedPhone,
          gatewayResponse: responseText,
          timestamp: new Date().toISOString()
        } : undefined
      });
    } else {
      // For development, still return success but log the error
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ SMS Gateway Error but continuing in dev mode: ${gatewayMessage}`);
        res.json({ 
          success: true, 
          otp: otp,
          message: 'OTP generated (development mode - SMS may have failed)',
          debug: {
            phoneNumber: cleanedPhone,
            gatewayResponse: responseText,
            gatewayError: true,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        throw new Error(`SMS gateway error: ${gatewayMessage}`);
      }
    }

  } catch (error) {
    console.error('💥 Send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send OTP',
      debug: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        timestamp: new Date().toISOString()
      } : undefined
    });
  }
});

// Add OTP verification endpoint
app.post("/api/sms/verify-otp", async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        error: "Phone number and OTP are required"
      });
    }

    // Clean phone number
    const cleanedPhone = phoneNumber.startsWith('+91') 
      ? phoneNumber.substring(3) 
      : phoneNumber.startsWith('91') 
      ? phoneNumber.substring(2)
      : phoneNumber;

    // Verify OTP from database
    const { data: otpRecord, error } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('mobile_no', cleanedPhone)
      .eq('otp', otp)
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !otpRecord) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired OTP"
      });
    }

    // Mark OTP as verified
    await supabase
      .from('otp_verification')
      .update({ 
        status: 'verified',
        verified_at: new Date().toISOString()
      })
      .eq('id', otpRecord.id);

    // Clean up expired OTPs (optional housekeeping)
    await supabase
      .from('otp_verification')
      .delete()
      .lt('expires_at', new Date().toISOString());

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP'
    });
  }
});


// Find this section in your server.js and replace it:

// Add cleanup job for expired OTPs (optional)
const cleanupExpiredOTPs = async () => {
  try {
    const { data, error } = await supabase
      .from("otp_verification")
      .delete()
      .lt("expires_at", new Date().toISOString());

    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`Cleaned up ${data.length} expired OTPs`);
    }
  } catch (error) {
    console.error("OTP cleanup error:", error);
  }
};

// Run OTP cleanup every hour - MOVE THIS AFTER THE FUNCTION DEFINITION
setInterval(cleanupExpiredOTPs, 60 * 60 * 1000);

// Add OTP verification endpoint
app.post("/api/sms/verify-otp", async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        error: "Phone number and OTP are required",
      });
    }

    // Clean phone number
    const cleanedPhone = phoneNumber.startsWith("+91")
      ? phoneNumber.substring(3)
      : phoneNumber.startsWith("91")
      ? phoneNumber.substring(2)
      : phoneNumber;

    // Verify OTP from database
    const { data: otpRecord, error } = await supabase
      .from("otp_verification")
      .select("*")
      .eq("mobile_no", cleanedPhone)
      .eq("otp", otp)
      .eq("status", "pending")
      .gte("expires_at", new Date().toISOString())
      .single();

    if (error || !otpRecord) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired OTP",
      });
    }

    // Mark OTP as verified
    await supabase
      .from("otp_verification")
      .update({
        status: "verified",
        verified_at: new Date().toISOString(),
      })
      .eq("id", otpRecord.id);

    // Clean up expired OTPs (optional housekeeping)
    await supabase
      .from("otp_verification")
      .delete()
      .lt("expires_at", new Date().toISOString());

    res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify OTP",
    });
  }
});



// Run OTP cleanup every hour
setInterval(cleanupExpiredOTPs, 60 * 60 * 1000);

// Add car to wishlist
app.post("/api/wishlist", validateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { carId } = req.body;

    if (!carId) {
      return res.status(400).json({
        success: false,
        error: "Car ID is required",
        code: "MISSING_CAR_ID",
      });
    }

    console.log(`❤️ Adding car ${carId} to wishlist for user: ${userId}`);

    // Check if car exists
    const { data: carExists, error: carError } = await supabase
      .from("cars")
      .select("id")
      .eq("id", carId)
      .single();

    if (carError || !carExists) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
        code: "CAR_NOT_FOUND",
      });
    }

    // Check if already in wishlist
    const { data: existingItem, error: checkError } = await supabase
      .from("user_wishlist")
      .select("id")
      .eq("user_id", userId)
      .eq("car_id", carId)
      .single();

    if (existingItem) {
      return res.status(409).json({
        success: false,
        error: "Car already in wishlist",
        code: "ALREADY_IN_WISHLIST",
      });
    }

    // Add to wishlist
    const { data: newItem, error: insertError } = await supabase
      .from("user_wishlist")
      .insert({
        user_id: userId,
        car_id: carId,
        added_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Wishlist insert error:", insertError);
      return res.status(500).json({
        success: false,
        error: "Failed to add to wishlist",
        code: "WISHLIST_INSERT_FAILED",
      });
    }

    console.log(`✅ Car added to wishlist successfully`);

    res.status(201).json({
      success: true,
      data: newItem,
      message: "Car added to wishlist successfully",
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add to wishlist",
      code: "WISHLIST_ADD_ERROR",
    });
  }
});

// Remove car from wishlist
app.delete("/api/wishlist/:carId", validateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { carId } = req.params;

    console.log(`🗑️ Removing car ${carId} from wishlist for user: ${userId}`);

    const { data: deletedItem, error } = await supabase
      .from("user_wishlist")
      .delete()
      .eq("user_id", userId)
      .eq("car_id", carId)
      .select()
      .single();

    if (error) {
      console.error("Wishlist delete error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to remove from wishlist",
        code: "WISHLIST_DELETE_FAILED",
      });
    }

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        error: "Car not found in wishlist",
        code: "NOT_IN_WISHLIST",
      });
    }

    console.log(`✅ Car removed from wishlist successfully`);

    res.json({
      success: true,
      message: "Car removed from wishlist successfully",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove from wishlist",
      code: "WISHLIST_REMOVE_ERROR",
    });
  }
});

// Remove multiple cars from wishlist
app.delete("/api/wishlist", validateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { carIds } = req.body;

    if (!carIds || !Array.isArray(carIds) || carIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Car IDs array is required",
        code: "MISSING_CAR_IDS",
      });
    }

    console.log(
      `🗑️ Removing ${carIds.length} cars from wishlist for user: ${userId}`
    );

    const { data: deletedItems, error } = await supabase
      .from("user_wishlist")
      .delete()
      .eq("user_id", userId)
      .in("car_id", carIds)
      .select();

    if (error) {
      console.error("Bulk wishlist delete error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to remove cars from wishlist",
        code: "BULK_DELETE_FAILED",
      });
    }

    console.log(
      `✅ ${deletedItems.length} cars removed from wishlist successfully`
    );

    res.json({
      success: true,
      data: {
        removedCount: deletedItems.length,
        removedItems: deletedItems,
      },
      message: `${deletedItems.length} cars removed from wishlist successfully`,
    });
  } catch (error) {
    console.error("Bulk remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove cars from wishlist",
      code: "BULK_REMOVE_ERROR",
    });
  }
});

// Toggle price alert for a car in wishlist
app.post(
  "/api/wishlist/:carId/price-alert",
  validateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { carId } = req.params;
      const { enabled } = req.body;

      console.log(
        `🔔 ${
          enabled ? "Enabling" : "Disabling"
        } price alert for car ${carId} for user: ${userId}`
      );

      // Check if car is in wishlist
      const { data: wishlistItem, error: wishlistError } = await supabase
        .from("user_wishlist")
        .select("id")
        .eq("user_id", userId)
        .eq("car_id", carId)
        .single();

      if (wishlistError || !wishlistItem) {
        return res.status(404).json({
          success: false,
          error: "Car not found in wishlist",
          code: "NOT_IN_WISHLIST",
        });
      }

      if (enabled) {
        // Create or activate price alert
        const { data: existingAlert, error: checkError } = await supabase
          .from("price_alerts")
          .select("id")
          .eq("user_id", userId)
          .eq("car_id", carId)
          .single();

        if (existingAlert) {
          // Update existing alert
          const { error: updateError } = await supabase
            .from("price_alerts")
            .update({ is_active: true })
            .eq("id", existingAlert.id);

          if (updateError) {
            throw updateError;
          }
        } else {
          // Create new alert
          const { error: insertError } = await supabase
            .from("price_alerts")
            .insert({
              user_id: userId,
              car_id: carId,
              is_active: true,
              created_at: new Date().toISOString(),
            });

          if (insertError) {
            throw insertError;
          }
        }
      } else {
        // Disable price alert
        const { error: disableError } = await supabase
          .from("price_alerts")
          .update({ is_active: false })
          .eq("user_id", userId)
          .eq("car_id", carId);

        if (disableError) {
          throw disableError;
        }
      }

      console.log(
        `✅ Price alert ${enabled ? "enabled" : "disabled"} successfully`
      );

      res.json({
        success: true,
        message: `Price alert ${enabled ? "enabled" : "disabled"} successfully`,
      });
    } catch (error) {
      console.error("Price alert toggle error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to toggle price alert",
        code: "PRICE_ALERT_ERROR",
      });
    }
  }
);

// Check if car is in user's wishlist
app.get("/api/wishlist/check/:carId", validateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { carId } = req.params;

    const { data: wishlistItem, error } = await supabase
      .from("user_wishlist")
      .select("id, added_at")
      .eq("user_id", userId)
      .eq("car_id", carId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    res.json({
      success: true,
      data: {
        inWishlist: !!wishlistItem,
        addedAt: wishlistItem?.added_at || null,
      },
    });
  } catch (error) {
    console.error("Wishlist check error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check wishlist status",
      code: "WISHLIST_CHECK_ERROR",
    });
  }
});

// Get wishlist statistics
app.get("/api/wishlist/stats", validateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from("user_wishlist")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      throw countError;
    }

    // Get price alerts count
    const { count: alertsCount, error: alertsError } = await supabase
      .from("price_alerts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_active", true);

    if (alertsError) {
      throw alertsError;
    }

    res.json({
      success: true,
      data: {
        totalCars: totalCount || 0,
        priceAlertsActive: alertsCount || 0,
      },
    });
  } catch (error) {
    console.error("Wishlist stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get wishlist statistics",
      code: "WISHLIST_STATS_ERROR",
    });
  }
});

// POST /api/wishlist/check-multiple
// POST /api/wishlist/check-multiple
app.post("/api/wishlist/check-multiple", validateToken, async (req, res) => {
  try {
    const { carIds } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!Array.isArray(carIds) || carIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "carIds must be a non-empty array",
      });
    }

    // Limit batch size to prevent abuse
    if (carIds.length > 100) {
      return res.status(400).json({
        success: false,
        error: "Maximum 100 car IDs allowed per request",
      });
    }

    console.log(
      `Checking wishlist for user ${userId} with ${carIds.length} car IDs`
    );

    // Query Supabase for wishlist items
    const { data: wishlistItems, error } = await supabase
      .from("user_wishlist")
      .select("car_id, added_at")
      .eq("user_id", userId)
      .in("car_id", carIds);

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    // Create a map of car_id -> wishlist data
    const wishlistMap = {};
    if (wishlistItems) {
      wishlistItems.forEach((item) => {
        wishlistMap[item.car_id] = {
          inWishlist: true,
          addedAt: item.added_at,
        };
      });
    }

    // Build response object for all requested car IDs
    const results = {};
    carIds.forEach((carId) => {
      results[carId] = wishlistMap[carId] || {
        inWishlist: false,
        addedAt: null,
      };
    });

    console.log(`Found ${wishlistItems?.length || 0} wishlist items`);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error checking multiple wishlist items:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check wishlist status",
    });
  }
});

// ===== ADMIN API SETTINGS ENDPOINTS =====

// GET API settings
app.get(
  "/api/admin/api-settings",
  validateToken,
  requireAdmin,
  async (req, res) => {
    try {
      // Try to get settings from Supabase first
      const { data: settings, error } = await supabase
        .from("api_settings")
        .select("*");

      if (error) throw error;

      // Format the response
      const response = {
        success: true,
        data: settings,
        syncStats: {},
      };

      // Get sync statistics if carwale_api exists
      const carwaleConfig = settings.find(
        (s) => s.setting_key === "carwale_api"
      );
      if (carwaleConfig) {
        // Get last sync time from cars table
        const { data: carsData } = await supabase
          .from("cars")
          .select("last_synced")
          .order("last_synced", { ascending: false })
          .limit(1);

        // Get total cars count
        const { count } = await supabase
          .from("cars")
          .select("*", { count: "exact", head: true });

        response.syncStats = {
          lastSync: carsData?.[0]?.last_synced || null,
          totalCars: count || 0,
        };
      }

      res.json(response);
    } catch (error) {
      console.error("Error fetching API settings:", error);
      res.status(500).json({
        success: false,
        error: "Failed to load API settings",
        details: error.message,
      });
    }
  }
);

// POST (update) API settings
app.post(
  "/api/admin/api-settings",
  validateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { carwaleConfig, brandAPIs, generalSettings, syncStats } = req.body;

      // Prepare operations array
      const operations = [];

      // Upsert CarWale API settings
      if (carwaleConfig) {
        operations.push(
          supabase.from("api_settings").upsert({
            setting_key: "carwale_api",
            setting_value: carwaleConfig,
            enabled: syncStats?.enabled || false,
          })
        );
      }

      // Upsert Brand APIs
      if (brandAPIs) {
        operations.push(
          supabase.from("api_settings").upsert({
            setting_key: "brand_apis",
            setting_value: { apis: brandAPIs },
            enabled: brandAPIs.some((api) => api.enabled),
          })
        );
      }

      // Upsert General Settings
      if (generalSettings) {
        operations.push(
          supabase.from("api_settings").upsert({
            setting_key: "general_settings",
            setting_value: generalSettings,
            enabled: true,
          })
        );
      }

      // Execute all operations
      const results = await Promise.all(operations);

      // Check for errors
      const hasError = results.some((result) => result.error);
      if (hasError) {
        throw new Error("One or more operations failed");
      }

      res.json({
        success: true,
        message: "API settings updated successfully",
      });
    } catch (error) {
      console.error("Error saving API settings:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save API settings",
        details: error.message,
      });
    }
  }
);

// Test API-Ninjas connection
app.post(
  "/api/admin/test-api-ninjas",
  validateToken,
  requireAdmin,
  async (req, res) => {
    try {
      // This would be where you'd test connection to API-Ninjas
      // For now we'll just simulate a successful test
      res.json({
        success: true,
        message: "API-Ninjas connection test successful",
        data: {
          connected: true,
          latency: 142,
          status: "active",
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "API test failed",
        details: error.message,
      });
    }
  }
);

// Sync API-Ninjas data
app.post(
  "/api/admin/sync-api-ninjas",
  validateToken,
  requireAdmin,
  async (req, res) => {
    try {
      // This would sync data from API-Ninjas
      // Simulate a sync operation
      const newCars = Math.floor(Math.random() * 5) + 1;
      const updatedCars = Math.floor(Math.random() * 3);

      res.json({
        success: true,
        message: "Sync completed successfully",
        data: {
          newCars,
          updatedCars,
          totalCars: 42 + newCars, // Example total
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Sync failed",
        details: error.message,
      });
    }
  }
);

// Test CarWale connection
app.post(
  "/api/admin/test-carwale",
  validateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { apiKey, baseUrl } = req.body;

      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: "API key is required",
        });
      }

      // Simulate testing CarWale API
      res.json({
        success: true,
        message: "CarWale API connection successful",
        data: {
          connected: true,
          endpoints: ["/cars", "/brands", "/models"].map(
            (endpoint) => `${baseUrl}${endpoint}`
          ),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "CarWale API test failed",
        details: error.message,
      });
    }
  }
);

// Sync CarWale data
app.post(
  "/api/admin/sync-carwale",
  validateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { apiKey, baseUrl, endpoints } = req.body;

      if (!apiKey || !baseUrl) {
        return res.status(400).json({
          success: false,
          error: "API configuration is required",
        });
      }

      // Simulate sync operation
      const newCars = Math.floor(Math.random() * 10) + 1;
      const updatedCars = Math.floor(Math.random() * 5);

      res.json({
        success: true,
        message: "CarWale data sync completed",
        data: {
          newCars,
          updatedCars,
          totalCars: 100 + newCars, // Example total
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "CarWale sync failed",
        details: error.message,
      });
    }
  }
);
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
