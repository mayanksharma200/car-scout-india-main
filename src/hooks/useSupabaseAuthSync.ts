// components/SupabaseAuthSync.tsx - Updated with better error handling
import { useEffect } from 'react';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseAuthSync = () => {
  const { saveTokens, clearTokens } = useUserAuth();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('🔐 Initial Supabase session:', session, error);
        
        if (session?.user) {
          await syncSupabaseUserToContext(session.user);
        }
      } catch (error) {
        console.error('Failed to get initial session:', error);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Supabase auth event:', event, session);
        
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          await syncSupabaseUserToContext(session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('🔐 User signed out, clearing tokens');
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
      console.log('🔄 Syncing Supabase user to context:', supabaseUser);
      
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
        emailVerified: !!supabaseUser.email_confirmed_at,
        provider: supabaseUser.app_metadata?.provider || 'email'
      };

      console.log('📋 Converted user data:', userData);

      // Try to get tokens from your backend
      try {
        const response = await fetch('/api/auth/supabase-token', {
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
            console.log('✅ Supabase user synced to context with backend tokens');
            return;
          } else {
            console.warn('❌ Backend token generation failed:', result.error);
          }
        } else {
          console.warn('❌ Backend token request failed:', response.status);
        }
      } catch (backendError) {
        console.warn('❌ Backend token request error:', backendError);
      }

      // Fallback: Use Supabase session directly without backend tokens
      console.log('🔄 Using fallback token strategy');
      const tokenData = {
        accessToken: supabaseUser.access_token || 'supabase-session-token',
        expiresIn: 3600, // 1 hour
        tokenType: 'Bearer'
      };

      saveTokens(tokenData, userData);
      console.log('✅ Supabase user synced to context with fallback tokens');

    } catch (error) {
      console.error('❌ Failed to sync Supabase user:', error);
    }
  };

  return null;
};