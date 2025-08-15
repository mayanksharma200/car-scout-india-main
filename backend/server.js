// backend/server.js
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
});
