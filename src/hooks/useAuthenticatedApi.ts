import { useEffect, useMemo } from 'react';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { createApiClient } from '@/utils/apiClient';

export const useAuthenticatedApi = () => {
  const { getAuthHeaders, isTokenExpired, refreshTokens, isAuthenticated } = useUserAuth();

  const api = useMemo(() => {
    const client = createApiClient({
      getAuthHeaders,
      isTokenExpired,
      refreshTokens,
    });
    
    return client;
  }, [getAuthHeaders, isTokenExpired, refreshTokens]);

  useEffect(() => {
    console.log('🔗 API client auth status:', {
      isAuthenticated,
      hasAuthMethods: !!(getAuthHeaders && isTokenExpired && refreshTokens)
    });
  }, [isAuthenticated, getAuthHeaders, isTokenExpired, refreshTokens]);

  return api;
};

export default useAuthenticatedApi;