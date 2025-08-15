import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const AuthStatus = () => {
  const { user, loading, session } = useAuth();

  // Only show in local development (not on deployed environments like fly.dev)
  const isLocalDevelopment = import.meta.env.DEV &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('local'));

  if (!isLocalDevelopment) {
    return null;
  }

  return (
    <Card className="fixed top-4 right-4 w-80 z-50 bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {loading ? (
            <Clock className="w-4 h-4 animate-spin" />
          ) : user ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          Authentication Status
        </CardTitle>
        <CardDescription className="text-xs">
          Current authentication state
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Loading:</span>
            <Badge variant={loading ? "default" : "outline"} className="text-xs">
              {loading ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">User:</span>
            <Badge variant={user ? "default" : "outline"} className="text-xs">
              {user ? "Authenticated" : "Not authenticated"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Session:</span>
            <Badge variant={session ? "default" : "outline"} className="text-xs">
              {session ? "Active" : "None"}
            </Badge>
          </div>
          
          {user && (
            <div className="mt-3 p-2 bg-white rounded border">
              <p className="text-xs font-medium mb-1">User Details:</p>
              <p className="text-xs text-muted-foreground">
                Email: {user.email}<br />
                ID: {user.id?.slice(0, 8)}...<br />
                Created: {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthStatus;
