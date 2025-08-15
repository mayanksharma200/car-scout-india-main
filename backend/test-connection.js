// backend/test-connection.js
// Run this to test your Supabase connection

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://gfjhsljeezfdkknhsrxx.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmamhzbGplZXpmZGtrbmhzcnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzUyOTQsImV4cCI6MjA2OTUxMTI5NH0.fuqHH9yWDj5zlrljsuFgGT9J-stzz8pzlfIJpjEFcao";

console.log("Testing Supabase connection...");
console.log("URL:", SUPABASE_URL);
console.log(
  "Key (first 20 chars):",
  SUPABASE_ANON_KEY.substring(0, 20) + "..."
);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    // Test 1: Try to fetch cars table structure
    console.log("\n1. Testing cars table access...");
    const { data: cars, error: carsError } = await supabase
      .from("cars")
      .select("*")
      .limit(1);

    if (carsError) {
      console.error("❌ Cars table error:", carsError);
    } else {
      console.log("✅ Cars table accessible!");
      console.log("Sample data:", cars);
    }

    // Test 2: Try to count cars
    console.log("\n2. Counting cars...");
    const { count, error: countError } = await supabase
      .from("cars")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Count error:", countError);
    } else {
      console.log(`✅ Found ${count} cars in database`);
    }

    // Test 3: Check if we can query with filters
    console.log("\n3. Testing filtered query...");
    const { data: activeCars, error: activeError } = await supabase
      .from("cars")
      .select("id, brand, model")
      .eq("status", "active")
      .limit(5);

    if (activeError) {
      console.error("❌ Filter query error:", activeError);
    } else {
      console.log("✅ Filter query works!");
      console.log("Active cars:", activeCars);
    }

    // Test 4: Check leads table
    console.log("\n4. Testing leads table access...");
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("id")
      .limit(1);

    if (leadsError) {
      console.error("❌ Leads table error:", leadsError);
    } else {
      console.log("✅ Leads table accessible!");
    }
  } catch (error) {
    console.error("\n❌ Unexpected error:", error);
  }
}

testConnection();
