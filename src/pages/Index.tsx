
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import LoginForm from '@/components/LoginForm';
import CyberBackground from '@/components/CyberBackground';
import Dashboard from '@/pages/Dashboard';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <CyberBackground>
      {isAuthenticated ? (
        <>
          <Navbar />
          <Dashboard />
        </>
      ) : (
        <LoginForm />
      )}
    </CyberBackground>
  );
};

export default Index;
