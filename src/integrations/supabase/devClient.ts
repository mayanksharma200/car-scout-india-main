// src/integrations/supabase/devClient.ts
// Development-specific Supabase client that bypasses auth issues

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Simple no-op storage for development
const noOpStorage = {
  getItem: (): null => null,
  setItem: (): void => {},
  removeItem: (): void => {},
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://gfjhsljeezfdkknhsrxx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmamhzbGplZXpmZGtrbmhzcnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzUyOTQsImV4cCI6MjA2OTUxMTI5NH0.fuqHH9yWDj5zlrljsuFgGT9J-stzz8pzlfIJpjEFcao";

// Create minimal Supabase client for development
export const createDevSupabaseClient = () => {
  try {
    console.log("🚀 Creating development Supabase client...");
    
    const client = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          storage: noOpStorage,
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'X-Client-Info': 'car-marketplace-dev'
          }
        }
      }
    );
    
    console.log("✅ Development Supabase client created successfully");
    return client;
  } catch (error) {
    console.error("❌ Failed to create development client:", error);
    return null;
  }
};

// Export for use in development
export const devSupabase = createDevSupabaseClient();