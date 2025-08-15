import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading, error } = useUserRole();
  const location = useLocation();

  // Show loading state while checking authentication and role
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent className="space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Verifying admin access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Navigate 
        to="/admin/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel. 
              Please contact an administrator if you believe this is an error.
            </p>
            {error && (
              <p className="text-sm text-destructive">
                Error: {error}
              </p>
            )}
            <div className="pt-4">
              <button 
                onClick={() => window.history.back()}
                className="text-primary hover:underline"
              >
                ← Go Back
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render admin content for authorized users
  return <>{children}</>;
};

export default AdminRouteGuard;
