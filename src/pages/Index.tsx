
import React from 'react';
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
