import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SystemStatus from "@/components/SystemStatus";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SystemStatus />
      <BrowserRouter>
        <Routes>
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
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/cars" element={<CarManagement />} />
          <Route path="/admin/leads" element={<LeadManagement />} />
          <Route path="/admin/content" element={<ContentManagement />} />
          <Route path="/admin/api-settings" element={<APISettings />} />
          
          {/* Legal Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
