import { useMemo } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { createApiClient, type ApiClient } from '@/services/api';

export const useAdminAuthenticatedApi = (): ApiClient => {
    const { getAuthHeaders } = useAdminAuth();

    const api = useMemo(() => {
        const client = createApiClient({
            getAuthHeaders,
            // Admin auth context currently handles session validity differently
            // For now, we assume the token is valid if present, or let the API fail with 401
            isTokenExpired: () => false,
            refreshTokens: async () => true,
        });

        return client;
    }, [getAuthHeaders]);

    return api;
};

export default useAdminAuthenticatedApi;
