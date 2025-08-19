// App.tsx
// No localStorage polyfill import needed here anymore
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SystemStatus from "@/components/SystemStatus";
import EnvironmentBanner from "@/components/EnvironmentBanner";
import DevAuthHelper from "@/components/DevAuthHelper";
import { SupabaseAuthSync } from "@/components/SupabaseAuthSync";

import AuthStatus from "@/components/AuthStatus";
import { TokenAuthProvider } from "@/contexts/TokenAuthContext";
import { UserAuthProvider } from "@/contexts/UserAuthContext";

import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import Index from "./pages/Index";
import CarListing from "./pages/CarListing";
import CarDetail from "./pages/CarDetail";
import Compare from "./pages/Compare";
import EMICalculatorPage from "./pages/EMICalculatorPage";
import News from "./pages/News";
import LoanApplication from "./pages/LoanApplication";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Wishlist from "./pages/Wishlist";
import ReviewsPage from "./pages/ReviewsPage";
import GalleryPage from "./pages/GalleryPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRouteGuard from "./components/AdminRouteGuard";
import AdminSetup from "./components/AdminSetup";
import CarManagement from "./pages/CarManagement";
import LeadManagement from "./pages/LeadManagement";
import APISettings from "./pages/APISettings";
import ContentManagement from "./pages/ContentManagement";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import RefundPolicy from "./pages/RefundPolicy";
import Disclaimer from "./pages/Disclaimer";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on localStorage or security errors
        if (
          error instanceof Error &&
          (error.message.includes("localStorage") ||
            error.message.includes("SecurityError") ||
            error.message.includes("Storage access denied") ||
            error.message.includes("The request was denied"))
        ) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false, // Disable refetch on window focus
    },
  },
});

const App = () => {
  console.log("🚀 App starting up...");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SystemStatus />
        <EnvironmentBanner />
        <BrowserRouter>
          {/* Add SupabaseAuthSync at the top level to sync auth state */}
          <UserAuthProvider>
            <SupabaseAuthSync />

            {/* Wrap the entire app with UserAuthProvider for regular user authentication */}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/cars" element={<CarListing />} />
              <Route path="/cars/:slug" element={<CarDetail />} />
              <Route path="/cars/:slug/reviews" element={<ReviewsPage />} />
              <Route path="/cars/:slug/gallery" element={<GalleryPage />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/emi-calculator" element={<EMICalculatorPage />} />
              <Route path="/news" element={<News />} />
              <Route path="/loan-application" element={<LoanApplication />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/wishlist" element={<Wishlist />} />

              {/* Legal Pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/contact" element={<Contact />} />

              {/* Admin Routes - Wrapped with separate TokenAuthProvider for admin authentication */}
              <Route
                path="/admin/*"
                element={
                  <TokenAuthProvider>
                    <Routes>
                      {/* Admin Login - No guard needed */}
                      <Route path="login" element={<AdminLogin />} />

                      {/* Protected Admin Routes */}
                      <Route
                        path=""
                        element={
                          <AdminRouteGuard>
                            <AdminDashboard />
                          </AdminRouteGuard>
                        }
                      />

                      <Route
                        path="cars"
                        element={
                          <AdminRouteGuard>
                            <CarManagement />
                          </AdminRouteGuard>
                        }
                      />

                      <Route
                        path="leads"
                        element={
                          <AdminRouteGuard>
                            <LeadManagement />
                          </AdminRouteGuard>
                        }
                      />

                      <Route
                        path="content"
                        element={
                          <AdminRouteGuard>
                            <ContentManagement />
                          </AdminRouteGuard>
                        }
                      />

                      <Route
                        path="api-settings"
                        element={
                          <AdminRouteGuard>
                            <APISettings />
                          </AdminRouteGuard>
                        }
                      />
                    </Routes>
                  </TokenAuthProvider>
                }
              />

              {/* Catch-all route - must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserAuthProvider>
        </BrowserRouter>

        {/* Development Tools */}
        {/* <AuthStatus /> */}
        <DevAuthHelper />
        <AdminSetup />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
