
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean; // Kept for backward compatibility
  isAdmin: boolean;
  login: (accessCode: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: true, // Default everyone as authenticated
  isAdmin: false,
  login: () => false,
  logout: () => {},
});

const ADMIN_ACCESS_CODE = 'APV09'; // Admin access code as specified

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Everyone is authenticated by default
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user was previously authenticated as admin
  // Use sessionStorage instead of localStorage to ensure access is lost on refresh
  useEffect(() => {
    const adminStatus = sessionStorage.getItem('bdzStaffHub_admin');
    
    if (adminStatus === 'true') {
      setIsAdmin(true);
    } else {
      // Force reset admin status to ensure no one has admin access without entering the code
      setIsAdmin(false);
      sessionStorage.removeItem('bdzStaffHub_admin');
    }
  }, []);

  const login = (accessCode: string): boolean => {
    if (accessCode === ADMIN_ACCESS_CODE) {
      setIsAdmin(true);
      // Store admin status in sessionStorage (not localStorage) to ensure it's lost on refresh
      sessionStorage.setItem('bdzStaffHub_admin', 'true');
      return true;
    } else {
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('bdzStaffHub_admin');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
