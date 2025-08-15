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


const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Handle OAuth callback
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');

      if (accessToken && refreshToken) {
        try {
          console.log('🔐 Processing OAuth callback...');

          // Set the session with the tokens from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('OAuth callback error:', error);
            toast({
              title: "Authentication Error",
              description: "Failed to complete sign-in. Please try again.",
              variant: "destructive",
            });
          } else {
            console.log('✅ OAuth callback successful:', data);
            toast({
              title: "Welcome!",
              description: "You have successfully signed in with Google.",
            });

            // Clean up the URL by removing the hash
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (err) {
          console.error('OAuth callback exception:', err);
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
      <BrandGrid />
      <FeaturedCars />
      <CompareSection />
      <EMICalculator />
      <Footer />
    </div>
  );
};

export default Index;
