import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { User, UserPlus } from 'lucide-react';

const DevAuthHelper = () => {
  const [creating, setCreating] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const { toast } = useToast();
  const { signIn, user } = useAuth();

  // Only show in local development (not on deployed environments like fly.dev)
  const isLocalDevelopment = import.meta.env.DEV &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('local'));

  if (!isLocalDevelopment) {
    return null;
  }

  const createTestUser = async () => {
    setCreating(true);
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${backendUrl}/auth/create-test-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Test User Created",
          description: `Email: ${result.data.email}, Password: ${result.data.password}`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Failed to Create Test User",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const signInTestUser = async () => {
    setSigningIn(true);
    try {
      const { error } = await signIn("test@autoscope.com", "test123456");
      
      if (error) {
        throw error;
      }

      toast({
        title: "Signed In",
        description: "Successfully signed in as test user",
      });
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-yellow-50 border-yellow-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="w-4 h-4" />
          Development Auth Helper
        </CardTitle>
        <CardDescription className="text-xs">
          Quick authentication tools for development
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {user ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Signed in as: {user.email}
            </Badge>
          </div>
        ) : (
          <div className="space-y-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={createTestUser}
              disabled={creating}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {creating ? "Creating..." : "Create Test User"}
            </Button>
            <Button 
              size="sm" 
              onClick={signInTestUser}
              disabled={signingIn}
              className="w-full"
            >
              <User className="w-4 h-4 mr-2" />
              {signingIn ? "Signing In..." : "Sign In Test User"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Email: test@autoscope.com<br />
              Password: test123456
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DevAuthHelper;
