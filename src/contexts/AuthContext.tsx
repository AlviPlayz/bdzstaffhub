
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
  useEffect(() => {
    const adminStatus = localStorage.getItem('bdzStaffHub_admin');
    
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const login = (accessCode: string): boolean => {
    if (accessCode === ADMIN_ACCESS_CODE) {
      setIsAdmin(true);
      localStorage.setItem('bdzStaffHub_admin', 'true');
      return true;
    } else {
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('bdzStaffHub_admin');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
