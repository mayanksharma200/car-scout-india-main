import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { detectEnvironment } from '@/utils/environmentDetector';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const env = detectEnvironment();

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');

        // Set a timeout to ensure loading doesn't get stuck
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('⏰ Auth initialization timeout, setting loading to false');
            setLoading(false);
          }
        }, 3000); // 3 second timeout

        // Check for existing session first
        const { data: { session }, error } = await supabase.auth.getSession();

        if (mounted) {
          clearTimeout(timeoutId);

          if (error) {
            console.warn('⚠️ Session check failed:', error.message);
            // Still set loading to false even if there's an error
            setLoading(false);
          } else {
            console.log('🔍 Initial session check:', { hasSession: !!session });
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`🔐 Auth event: ${event}`, { hasSession: !!session });
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          // Always ensure loading is false after any auth event
          setLoading(false);
        }
      }
    );

    // Initialize authentication
    initializeAuth();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData?: { firstName?: string, lastName?: string, phone?: string }) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Google sign-in exception:', err);
      return { data: null, error: err as any };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle
  };
};
