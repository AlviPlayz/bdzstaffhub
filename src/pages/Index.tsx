
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import CyberBackground from '@/components/CyberBackground';
import Dashboard from '@/pages/Dashboard';

const Index: React.FC = () => {
  return (
    <CyberBackground>
      <Navbar />
      <Dashboard />
    </CyberBackground>
  );
};

export default Index;
