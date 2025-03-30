
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { StaffProvider } from "@/contexts/StaffContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ModeratorsPage from "./pages/ModeratorsPage";
import BuildersPage from "./pages/BuildersPage";
import ManagersPage from "./pages/ManagersPage";
import AdminPage from "./pages/AdminPage";
import CyberBackground from "./components/CyberBackground";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <CyberBackground>
      <Navbar />
      {children}
    </CyberBackground>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <StaffProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route 
                path="/moderators" 
                element={
                  <AppLayout>
                    <ModeratorsPage />
                  </AppLayout>
                } 
              />
              <Route 
                path="/builders" 
                element={
                  <AppLayout>
                    <BuildersPage />
                  </AppLayout>
                } 
              />
              <Route 
                path="/managers" 
                element={
                  <AppLayout>
                    <ManagersPage />
                  </AppLayout>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <AppLayout>
                    <AdminPage />
                  </AppLayout>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </StaffProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
