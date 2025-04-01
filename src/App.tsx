
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StaffProvider } from './contexts/StaffContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { initializeStorage } from './integrations/supabase/storage';

// Pages
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import ModeratorsPage from './pages/ModeratorsPage';
import BuildersPage from './pages/BuildersPage';
import ManagersPage from './pages/ManagersPage';
import StaffDetailPage from './pages/StaffDetailPage';
import AdminPage from './pages/AdminPage';
import NotFound from './pages/NotFound';

// Initialize the query client
const queryClient = new QueryClient();

const App: React.FC = () => {
  useEffect(() => {
    // Initialize storage buckets when the app loads
    initializeStorage();
  }, []);

  return (
    <ThemeProvider attribute="class">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StaffProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/moderators" element={<ModeratorsPage />} />
                <Route path="/builders" element={<BuildersPage />} />
                <Route path="/managers" element={<ManagersPage />} />
                <Route path="/staff/:id" element={<StaffDetailPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" />} />
              </Routes>
            </Router>
            <Toaster />
          </StaffProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
