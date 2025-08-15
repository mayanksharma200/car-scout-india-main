// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Simple memory storage for development
const memoryStorage = {
  data: {} as Record<string, string>,
  getItem: (key: string) => memoryStorage.data[key] || null,
  setItem: (key: string, value: string) => { memoryStorage.data[key] = value; },
  removeItem: (key: string) => { delete memoryStorage.data[key]; }
};

// Check localStorage availability with comprehensive testing
const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;

    // Check if localStorage object exists
    if (!window.localStorage) return false;

    // Test actual read/write operations
    const test = '__supabase_storage_test__';
    window.localStorage.setItem(test, 'test');
    const result = window.localStorage.getItem(test);
    window.localStorage.removeItem(test);

    return result === 'test';
  } catch (error) {
    // Log the specific error for debugging
    console.log('🔍 localStorage not available:', error.message);
    return false;
  }
};

// Environment setup
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://gfjhsljeezfdkknhsrxx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmamhzbGplZXpmZGtrbmhzcnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzUyOTQsImV4cCI6MjA2OTUxMTI5NH0.fuqHH9yWDj5zlrljsuFgGT9J-stzz8pzlfIJpjEFcao";

const isDevelopment = import.meta.env.DEV;
const storageAvailable = isLocalStorageAvailable();

console.log("🔧 Supabase Environment:", { isDevelopment, storageAvailable });

// Create Supabase client with proper error handling
let supabase: ReturnType<typeof createClient<Database>> | null = null;

try {
  console.log("🔧 Creating Supabase client...");
  
  // Use proper storage configuration for authentication
  supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: storageAvailable ? undefined : memoryStorage, // Use localStorage if available, fallback to memory
      persistSession: true,  // Enable session persistence
      autoRefreshToken: true, // Enable auto-refresh
      detectSessionInUrl: true, // Enable session detection in URL for OAuth
    },
    global: {
      headers: {
        'X-Client-Info': 'car-marketplace'
      }
    }
  });
  
  console.log("✅ Supabase client created successfully");
} catch (error) {
  console.error("❌ Failed to create Supabase client:", error);
  supabase = null;
}

// Simple wrapper function
export const getSupabase = () => {
  if (!supabase) {
    console.warn("⚠️ Supabase client not available");
    return null;
  }
  return supabase;
};

// Safe database operation wrapper with better error handling
export const safeQuery = async <T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> => {
  try {
    const client = getSupabase();
    if (!client) {
      return { data: null, error: { message: "Database not available" } };
    }
    
    const result = await operation();
    
    // Check if result exists and has expected structure
    if (!result) {
      return { data: null, error: { message: "No response from database" } };
    }
    
    // Check for localStorage/SecurityError issues
    if (result.error) {
      const errorMessage = result.error.message || '';
      if (errorMessage.includes('SecurityError') || 
          errorMessage.includes('localStorage') ||
          errorMessage.includes('denied')) {
        console.warn("🔇 Storage access denied, returning mock data");
        return { data: null, error: { message: "Storage access denied" } };
      }
    }
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Handle localStorage/SecurityError silently
    if (errorMessage.includes('SecurityError') || 
        errorMessage.includes('localStorage') ||
        errorMessage.includes('denied')) {
      console.warn("🔇 Storage access denied, returning mock data");
      return { data: null, error: { message: "Storage access denied" } };
    }
    
    console.error("Database operation failed:", error);
    return { 
      data: null, 
      error: { 
        message: errorMessage
      } 
    };
  }
};

// Export the client and utilities
export { supabase, isLocalStorageAvailable };

// Legacy exports for compatibility
export const isSupabaseConfigured = !!supabase;
export const createSafeSupabaseWrapper = getSupabase;
export const supabaseError = supabase ? null : "Supabase client not initialized";
export const safeStorage = memoryStorage;
