
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, BarChart3, Shield, Hammer, Trophy, Home } from 'lucide-react';
import AdminAccessModal from '@/components/AdminAccessModal';

const Navbar: React.FC = () => {
  const {
    isAuthenticated,
    isAdmin,
    logout
  } = useAuth();
  const location = useLocation();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [{
    path: '/',
    label: 'Dashboard',
    icon: <BarChart3 size={18} />
  }, {
    path: '/moderators',
    label: 'Moderators',
    icon: <Shield size={18} />
  }, {
    path: '/builders',
    label: 'Builders',
    icon: <Hammer size={18} />
  }, {
    path: '/managers',
    label: 'Managers',
    icon: <Trophy size={18} />
  }];
  
  const handleAdminClick = (e: React.MouseEvent) => {
    if (!isAdmin) {
      e.preventDefault();
      setShowAdminModal(true);
    }
  };
  
  if (!isAuthenticated) return null;
  
  return <>
      <nav className="bg-cyber-darkblue border-b border-cyber-cyan shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <span className="font-digital text-xl cyber-text-glow text-cyber-cyan">BDZ</span>
                <span className="font-cyber text-white">STAFF HUB</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => <Link key={item.path} to={item.path} className={`flex items-center gap-1 px-4 py-2 text-sm font-cyber transition-all duration-200 
                    ${isActive(item.path) ? 'text-cyber-cyan cyber-text-glow border-b-2 border-cyber-cyan' : 'text-white hover:text-cyber-cyan'}`}>
                  {item.icon}
                  {item.label}
                </Link>)}
              
              <Link to={isAdmin ? "/admin" : "#"} onClick={handleAdminClick} className={`flex items-center gap-1 px-4 py-2 text-sm font-cyber transition-all duration-200
                  ${isActive('/admin') ? 'text-cyber-cyan cyber-text-glow border-b-2 border-cyber-cyan' : 'text-white hover:text-cyber-cyan'}`}>
                <User size={18} />
                Admin Panel
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-1 text-white hover:text-cyber-cyan text-sm font-cyber px-3 py-1 border border-cyber-cyan rounded-md transition-all duration-200 hover:bg-cyber-cyan/10 mr-2">
                <Home size={16} />
                Home
              </Link>
              
            </div>
          </div>
        </div>
        
        <div className="md:hidden bg-cyber-darkblue border-t border-cyber-cyan py-2">
          <div className="flex justify-between px-4">
            {navItems.map(item => <Link key={item.path} to={item.path} className={`flex flex-col items-center text-xs font-cyber
                  ${isActive(item.path) ? 'text-cyber-cyan cyber-text-glow' : 'text-white hover:text-cyber-cyan'}`}>
                {item.icon}
                <span className="mt-1">{item.label}</span>
              </Link>)}
            
            <Link to={isAdmin ? "/admin" : "#"} onClick={handleAdminClick} className={`flex flex-col items-center text-xs font-cyber
                ${isActive('/admin') ? 'text-cyber-cyan cyber-text-glow' : 'text-white hover:text-cyber-cyan'}`}>
              <User size={18} />
              <span className="mt-1">Admin</span>
            </Link>
          </div>
        </div>
      </nav>

      <AdminAccessModal 
        isOpen={showAdminModal} 
        onClose={() => setShowAdminModal(false)} 
        onSuccess={() => {
          setShowAdminModal(false);
          window.location.href = '/admin';
        }} 
        onFailure={() => {
          console.log('Admin access denied');
          setShowAdminModal(false);
        }} 
      />
    </>;
};

export default Navbar;
