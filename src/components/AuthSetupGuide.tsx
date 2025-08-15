import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Key, Settings } from "lucide-react";

const AuthSetupGuide = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Google OAuth Setup Guide
          </CardTitle>
          <CardDescription>
            Follow these steps to enable Google authentication in your app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Key className="w-4 h-4" />
            <AlertDescription>
              You need to configure Google OAuth in your Supabase project for authentication to work properly.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Create Google OAuth App</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to <a href="https://console.developers.google.com/" target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></li>
                <li>Create a new project or select existing one</li>
                <li>Enable Google+ API</li>
                <li>Create OAuth 2.0 Client ID credentials</li>
                <li>Set authorized redirect URIs to: <code className="bg-muted px-1 rounded">https://your-project.supabase.co/auth/v1/callback</code></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Configure Supabase</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">Supabase Dashboard <ExternalLink className="w-3 h-3" /></a></li>
                <li>Navigate to Authentication → Settings → Auth Providers</li>
                <li>Enable Google provider</li>
                <li>Add your Google Client ID and Client Secret</li>
                <li>Save the configuration</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Environment Variables</h4>
              <p className="text-sm text-muted-foreground mb-2">Make sure your environment variables are set correctly:</p>
              <div className="bg-muted p-3 rounded text-sm font-mono">
                <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                <div>VITE_SUPABASE_ANON_KEY=your-anon-key</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthSetupGuide;
