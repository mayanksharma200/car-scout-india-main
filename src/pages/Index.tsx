import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BrandGrid from "@/components/BrandGrid";
import FeaturedCars from "@/components/FeaturedCars";
import CompareSection from "@/components/CompareSection";
import EMICalculator from "@/components/EMICalculator";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import AdDebugger from "@/components/AdDebugger"; // Import the debug component

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Handle OAuth callback
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = urlParams.get("access_token");
      const refreshToken = urlParams.get("refresh_token");
      const providerToken = urlParams.get("provider_token");

      if (accessToken && refreshToken) {
        try {
          console.log("Processing OAuth callback...");

          // Set the session with the tokens from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("OAuth callback error:", error);
            toast({
              title: "Authentication Error",
              description: "Failed to complete sign-in. Please try again.",
              variant: "destructive",
            });
          } else {
            console.log("OAuth callback successful:", data);

            // Determine provider from the user data
            const provider = data.user?.app_metadata?.provider || "OAuth";
            const providerName =
              provider === "google"
                ? "Google"
                : provider === "facebook"
                ? "Facebook"
                : provider.charAt(0).toUpperCase() + provider.slice(1);

            toast({
              title: "Welcome!",
              description: `You have successfully signed in with ${providerName}.`,
            });

            // Clean up the URL by removing the hash
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          }
        } catch (err) {
          console.error("OAuth callback exception:", err);
          toast({
            title: "Authentication Error",
            description: "An unexpected error occurred during sign-in.",
            variant: "destructive",
          });
        }
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />

      <div className="my-8">
        <AdBanner placement="below_hero" className="mb-8" />
      </div>

      <BrandGrid />

      <div className="my-8">
        <AdBanner placement="between_brands_1" className="mb-8" />
      </div>

      <FeaturedCars />

      <div className="my-8">
        <AdBanner placement="between_brands_2" className="mb-8" />
      </div>

      <CompareSection />
      <EMICalculator />

      <div className="my-8">
        <AdBanner placement="above_footer" className="mb-8" />
      </div>

      <Footer />

      {/* Debug component - remove in production */}
      {process.env.NODE_ENV === "development" && <AdDebugger />}
    </div>
  );
};

export default Index;
