// hooks/useAuthenticatedApi.ts
import { useEffect, useMemo } from 'react';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { createApiClient } from '@/utils/apiClient';

/**
 * Hook that provides an authenticated API client instance
 * Automatically handles token refresh and authentication headers
 */
export const useAuthenticatedApi = () => {
  const { getAuthHeaders, isTokenExpired, refreshTokens, isAuthenticated } = useUserAuth();

  // Create API client instance with auth methods
  const api = useMemo(() => {
    const client = createApiClient({
      getAuthHeaders,
      isTokenExpired,
      refreshTokens,
    });
    
    return client;
  }, [getAuthHeaders, isTokenExpired, refreshTokens]);

  // Log authentication status for debugging
  useEffect(() => {
    console.log('🔗 API client auth status:', {
      isAuthenticated,
      hasAuthMethods: !!(getAuthHeaders && isTokenExpired && refreshTokens)
    });
  }, [isAuthenticated, getAuthHeaders, isTokenExpired, refreshTokens]);

  return api;
};

// Export for use in components
export default useAuthenticatedApi;