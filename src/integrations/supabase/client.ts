// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { safeLocalStorage } from "@/utils/safeStorage";

// Use environment variables if available, otherwise fallback to demo credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://gfjhsljeezfdkknhsrxx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmamhzbGplZXpmZGtrbmhzcnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzUyOTQsImV4cCI6MjA2OTUxMTI5NH0.fuqHH9yWDj5zlrljsuFgGT9J-stzz8pzlfIJpjEFcao";

// Check if Supabase is properly configured
const isSupabaseConfigured = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY &&
  SUPABASE_URL !== "your_supabase_project_url" &&
  SUPABASE_PUBLISHABLE_KEY !== "your_supabase_anon_key";

export const supabase = isSupabaseConfigured ? createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: safeLocalStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
) : null;

export { isSupabaseConfigured };
