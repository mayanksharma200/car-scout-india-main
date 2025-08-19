// hooks/useSupabaseAuthSync.ts
import { useEffect } from 'react';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseAuthSync = () => {
  const { saveTokens, clearTokens } = useUserAuth();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await syncSupabaseUserToContext(session.user);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Supabase auth event:', event, session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await syncSupabaseUserToContext(session.user);
        } else if (event === 'SIGNED_OUT') {
          clearTokens();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [saveTokens, clearTokens]);

  const syncSupabaseUserToContext = async (supabaseUser: any) => {
    try {
      // Convert Supabase user to your context format
      const userData = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        firstName: supabaseUser.user_metadata?.first_name || 
                  supabaseUser.user_metadata?.given_name ||
                  supabaseUser.email?.split('@')[0],
        lastName: supabaseUser.user_metadata?.last_name || 
                 supabaseUser.user_metadata?.family_name ||
                 '',
        role: 'user',
        emailVerified: supabaseUser.email_confirmed_at !== null,
        provider: supabaseUser.app_metadata?.provider || 'email'
      };

      // For Google users, we need to get an access token from your backend
      const response = await fetch('https://car-scout-india-main-production.up.railway.app/api/auth/supabase-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supabaseUserId: supabaseUser.id,
          email: supabaseUser.email,
          userData: supabaseUser.user_metadata
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          saveTokens(result.data, userData);
        }
      }
    } catch (error) {
      console.error('Failed to sync Supabase user:', error);
    }
  };
};