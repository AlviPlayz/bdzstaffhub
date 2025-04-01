
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { StaffProvider } from "@/contexts/StaffContext";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ModeratorsPage from "./pages/ModeratorsPage";
import BuildersPage from "./pages/BuildersPage";
import ManagersPage from "./pages/ManagersPage";
import AdminPage from "./pages/AdminPage";
import StaffDetailPage from "./pages/StaffDetailPage";
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

const App = () => {
  // Initialize Supabase storage for staff avatars
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Check if the bucket exists, if not create it
        const { data: buckets } = await supabase.storage.listBuckets();
        const staffAvatarsBucket = buckets?.find(bucket => bucket.name === 'staff-avatars');
        
        if (!staffAvatarsBucket) {
          console.log('Creating staff-avatars bucket');
          await supabase.storage.createBucket('staff-avatars', {
            public: true
          });
        }
      } catch (error) {
        console.error('Error initializing storage:', error);
      }
    };
    
    initializeStorage();
  }, []);

  return (
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
                <Route 
                  path="/staff/:id" 
                  element={
                    <AppLayout>
                      <StaffDetailPage />
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
};

export default App;
