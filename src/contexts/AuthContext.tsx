
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (accessCode: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  login: () => false,
  logout: () => {},
});

const ADMIN_ACCESS_CODE = 'APV09'; // Admin access code as specified

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user was previously authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem('bdzStaffHub_auth');
    const adminStatus = localStorage.getItem('bdzStaffHub_admin');
    
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setIsAdmin(adminStatus === 'true');
    }
  }, []);

  const login = (accessCode: string): boolean => {
    if (accessCode === ADMIN_ACCESS_CODE) {
      setIsAuthenticated(true);
      setIsAdmin(true);
      localStorage.setItem('bdzStaffHub_auth', 'true');
      localStorage.setItem('bdzStaffHub_admin', 'true');
      return true;
    } else {
      // For demo purposes, allow any non-empty access code for regular access
      if (accessCode.trim() !== '') {
        setIsAuthenticated(true);
        setIsAdmin(false);
        localStorage.setItem('bdzStaffHub_auth', 'true');
        localStorage.setItem('bdzStaffHub_admin', 'false');
        return true;
      }
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('bdzStaffHub_auth');
    localStorage.removeItem('bdzStaffHub_admin');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
