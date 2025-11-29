import { useUserAuth } from '@/contexts/UserAuthContext';

export const useUserRole = () => {
  const { user, loading } = useUserAuth();

  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  return {
    profile: user,
    loading,
    error: null,
    isAdmin,
    isUser,
    role: user?.role
  };
};
