import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Brand from "./pages/Brand";
import BrandMap from "./pages/BrandMap";
import TrustedPartners from "./pages/TrustedPartners";
import Blog from "./pages/Blog";
import TrustedPartnerDetail from "./pages/TrustedPartnerDetail";
import TopIslandTabs from "./components/TopIslandTabs";
import TopRightActions from "./components/TopRightActions";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TopIslandTabs />
          <TopRightActions />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/brand/:slug" element={<Brand />} />
            <Route path="/brand/:slug/map" element={<BrandMap />} />
            <Route path="/trusted-partners" element={<TrustedPartners />} />
            <Route path="/trusted-partners/:slug" element={<TrustedPartnerDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
