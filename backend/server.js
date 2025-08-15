// backend/server.js
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: "No valid authorization token provided"
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Authentication failed"
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (!error && user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without auth if optional
    next();
  }
};

// Initialize Supabase client with service role key for full access
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Get featured cars (for homepage) - MUST BE BEFORE /:id
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
      message: error.message,
    });
  }
});

// Search cars - MUST BE BEFORE /:id
app.get("/api/cars/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .or(`brand.ilike.%${q}%,model.ilike.%${q}%,variant.ilike.%${q}%`)
      .eq("status", "active")
      .limit(20);

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      query: q,
    });
  } catch (error) {
    console.error("Error searching cars:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search cars",
      message: error.message,
    });
  }
});

// Get all cars
app.get("/api/cars", async (req, res) => {
  try {
    const {
      status,
      brand,
      model,
      minPrice,
      maxPrice,
      limit = 20,
      offset = 0,
    } = req.query;

    let query = supabase.from("cars").select("*");

    // Apply filters
    if (status) query = query.eq("status", status);
    if (brand) query = query.eq("brand", brand);
    if (model) query = query.eq("model", model);
    if (minPrice) query = query.gte("price_min", minPrice);
    if (maxPrice) query = query.lte("price_max", maxPrice);

    // Apply pagination
    query = query
      .order("brand", { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch cars",
      message: error.message,
    });
  }
});

// Get single car by ID - MUST BE AFTER /featured and /search
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

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching car:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch car",
      message: error.message,
    });
  }
});

// Test user creation for development
app.post("/api/auth/create-test-user", async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: "Not allowed in production"
      });
    }

    const testEmail = "test@autoscope.com";
    const testPassword = "test123456";

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          firstName: "Test",
          lastName: "User"
        }
      }
    });

    if (error) throw error;

    res.json({
      success: true,
      data: {
        email: testEmail,
        password: testPassword,
        user: data.user
      },
      message: "Test user created successfully"
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

// Authentication endpoints
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.json({
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(400).json({
      success: false,
      error: "Login failed",
      message: error.message,
    });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, userData } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
      message: "Signup successful",
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(400).json({
      success: false,
      error: "Signup failed",
      message: error.message,
    });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(400).json({
      success: false,
      error: "Logout failed",
      message: error.message,
    });
  }
});

app.get("/api/auth/session", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "No authorization header",
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error } = await supabase.auth.getUser(token);

    if (error) throw error;

    res.json({
      success: true,
      data: {
        user: data.user,
      },
    });
  } catch (error) {
    console.error("Error getting session:", error);
    res.status(401).json({
      success: false,
      error: "Invalid session",
      message: error.message,
    });
  }
});

// Google OAuth endpoints
app.get("/api/auth/google", async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${req.protocol}://${req.get('host')}/api/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });

    if (error) throw error;

    res.redirect(data.url);
  } catch (error) {
    console.error("Error with Google OAuth:", error);
    res.status(400).json({
      success: false,
      error: "Google OAuth failed",
      message: error.message,
    });
  }
});

app.get("/api/auth/callback", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "No authorization code provided",
      });
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code.toString());

    if (error) throw error;

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?auth=success`);
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    // Redirect to frontend with error
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?auth=error&message=${encodeURIComponent(error.message)}`);
  }
});

// Create lead
app.post("/api/leads", async (req, res) => {
  try {
    const leadData = req.body;

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
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Endpoints available:`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/api/cars`);
  console.log(`   GET  http://localhost:${PORT}/api/cars/featured`);
  console.log(`   GET  http://localhost:${PORT}/api/cars/search?q=query`);
  console.log(`   GET  http://localhost:${PORT}/api/cars/:id`);
  console.log(`   POST http://localhost:${PORT}/api/leads`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST http://localhost:${PORT}/api/auth/signup`);
  console.log(`   POST http://localhost:${PORT}/api/auth/logout`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/session`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/google`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/callback`);
});
