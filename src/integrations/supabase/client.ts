// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { safeLocalStorage, isLocalStorageAvailable } from "@/utils/safeStorage";

// Use environment variables if available, otherwise fallback to demo credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://gfjhsljeezfdkknhsrxx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmamhzbGplZXpmZGtrbmhzcnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzUyOTQsImV4cCI6MjA2OTUxMTI5NH0.fuqHH9yWDj5zlrljsuFgGT9J-stzz8pzlfIJpjEFcao";

// Check if Supabase is properly configured
const isSupabaseConfigured = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY &&
  SUPABASE_URL !== "your_supabase_project_url" &&
  SUPABASE_PUBLISHABLE_KEY !== "your_supabase_anon_key";

// Create Supabase client with enhanced error handling
let supabase: any = null;
let supabaseError: string | null = null;

try {
  if (isSupabaseConfigured) {
    console.log("🔧 Initializing Supabase client...");
    console.log("📦 Storage available:", isLocalStorageAvailable() ? "localStorage" : "memory fallback");

    supabase = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          storage: safeLocalStorage,
          persistSession: isLocalStorageAvailable(), // Only persist if localStorage is available
          autoRefreshToken: isLocalStorageAvailable(), // Only auto-refresh if localStorage is available
          detectSessionInUrl: false, // Disable URL session detection to avoid security issues
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'X-Client-Info': 'car-marketplace-app'
          }
        }
      }
    );
    console.log("✅ Supabase client initialized successfully");
  } else {
    supabaseError = "Supabase not configured - missing URL or API key";
    console.warn("⚠️ " + supabaseError);
  }
} catch (error) {
  supabaseError = `Failed to initialize Supabase: ${error.message}`;
  console.error("❌ " + supabaseError);
  supabase = null;
}

// Enhanced wrapper for database operations with better error handling
const createSafeSupabaseWrapper = () => {
  if (!supabase) {
    return {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: { message: supabaseError || "Supabase not available" } }),
        insert: () => Promise.resolve({ data: null, error: { message: supabaseError || "Supabase not available" } }),
        update: () => Promise.resolve({ data: null, error: { message: supabaseError || "Supabase not available" } }),
        delete: () => Promise.resolve({ data: null, error: { message: supabaseError || "Supabase not available" } }),
      }),
      auth: {
        signUp: () => Promise.resolve({ data: null, error: { message: supabaseError || "Supabase not available" } }),
        signIn: () => Promise.resolve({ data: null, error: { message: supabaseError || "Supabase not available" } }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      }
    };
  }
  return supabase;
};

export { supabase, isSupabaseConfigured, createSafeSupabaseWrapper, supabaseError };
