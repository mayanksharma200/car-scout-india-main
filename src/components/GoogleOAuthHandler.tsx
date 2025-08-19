import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const GoogleOAuthHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveTokens, clearTokens } = useUserAuth();

  const backendUrl =
    import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  useEffect(() => {
    const handleGoogleOAuth = async () => {
      try {
        console.log("🔐 Processing Google OAuth callback...");

        // Get Supabase session from URL hash or query params
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const queryParams = searchParams;

        // Check for error first
        const error = hashParams.get("error") || queryParams.get("error");
        const errorDescription =
          hashParams.get("error_description") ||
          queryParams.get("error_description");

        if (error) {
          throw new Error(errorDescription || error);
        }

        // Get tokens from URL
        const accessToken =
          hashParams.get("access_token") || queryParams.get("access_token");
        const refreshToken =
          hashParams.get("refresh_token") || queryParams.get("refresh_token");
        const expiresIn =
          hashParams.get("expires_in") || queryParams.get("expires_in");
        const tokenType =
          hashParams.get("token_type") ||
          queryParams.get("token_type") ||
          "bearer";

        console.log("🔑 OAuth tokens found:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          expiresIn,
          tokenType,
        });

        if (!accessToken) {
          throw new Error("No access token received from Google OAuth");
        }

        // Get user data from Supabase
        let userData;
        try {
          const { supabase } = await import("@/integrations/supabase/client");

          // Set the session in Supabase client
          if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

            if (sessionError) {
              throw new Error(`Session error: ${sessionError.message}`);
            }

            userData = sessionData?.user;
          } else {
            // Fallback: get user data directly
            const {
              data: { user },
              error: userError,
            } = await supabase.auth.getUser(accessToken);
            if (userError) {
              throw new Error(`User fetch error: ${userError.message}`);
            }
            userData = user;
          }
        } catch (supabaseError) {
          console.error("Supabase error:", supabaseError);
          throw new Error("Failed to authenticate with Supabase");
        }

        if (!userData) {
          throw new Error("No user data received from authentication");
        }

        console.log("👤 User data received:", {
          id: userData.id,
          email: userData.email,
          provider: userData.app_metadata?.provider,
        });

        // Convert Google OAuth to backend session
        const conversionResponse = await fetch(
          `${backendUrl}/auth/google-oauth`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              supabaseUserId: userData.id,
              email: userData.email,
              userData: {
                firstName:
                  userData.user_metadata?.given_name ||
                  userData.user_metadata?.full_name?.split(" ")[0] ||
                  userData.email?.split("@")[0],
                lastName:
                  userData.user_metadata?.family_name ||
                  userData.user_metadata?.full_name?.split(" ")[1] ||
                  "",
                emailVerified: userData.email_confirmed_at ? true : false,
                provider: "google",
              },
            }),
          }
        );

        const conversionResult = await conversionResponse.json();
        console.log("🔄 Backend conversion response:", conversionResult);

        if (!conversionResponse.ok || !conversionResult.success) {
          throw new Error(
            conversionResult.error || "Backend conversion failed"
          );
        }

        // Save tokens and user data to cookies
        const tokenData = {
          accessToken: conversionResult.data.accessToken,
          expiresIn: conversionResult.data.expiresIn,
          tokenType: conversionResult.data.tokenType || "Bearer",
        };

        console.log("💾 Saving Google OAuth session to cookies...");
        saveTokens(tokenData, conversionResult.data.user);

        // Show success message
        toast({
          title: "Login Successful",
          description: (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Welcome to AutoScope! You're now signed in with Google.
            </div>
          ),
        });

        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // Redirect to intended destination
        const redirectPath =
          sessionStorage.getItem("oauth_redirect_path") || "/";
        sessionStorage.removeItem("oauth_redirect_path");

        console.log("🚀 Redirecting to:", redirectPath);
        navigate(redirectPath, { replace: true });
      } catch (error: any) {
        console.error("❌ Google OAuth error:", error);

        // Clear any partial session data
        clearTokens();

        let errorMessage = "Google authentication failed";
        let errorTitle = "Authentication Error";

        if (error.message.includes("access_denied")) {
          errorMessage =
            "Google authentication was cancelled. Please try again if you want to sign in.";
          errorTitle = "Authentication Cancelled";
        } else if (error.message.includes("network")) {
          errorMessage =
            "Network error during authentication. Please check your connection and try again.";
        } else if (error.message.includes("Session error")) {
          errorMessage =
            "Authentication session error. Please try signing in again.";
        } else if (error.message.includes("Backend conversion failed")) {
          errorMessage =
            "Server error during sign-in. Please try again or contact support.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast({
          variant: "destructive",
          title: errorTitle,
          description: (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </div>
          ),
        });

        // Redirect to login page after error
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      }
    };

    // Only run if we have URL parameters that suggest OAuth callback
    const hasOAuthParams =
      window.location.hash.includes("access_token") ||
      searchParams.has("access_token") ||
      searchParams.has("code") ||
      window.location.hash.includes("error");

    if (hasOAuthParams) {
      handleGoogleOAuth();
    } else {
      console.log("⚠️ No OAuth parameters found, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, toast, saveTokens, clearTokens, backendUrl]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-primary-foreground mb-2">
          Completing Sign In
        </h2>
        <p className="text-primary-foreground/70">
          Please wait while we finish setting up your account...
        </p>
        <div className="mt-6 text-sm text-primary-foreground/60">
          This may take a few moments
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthHandler;
