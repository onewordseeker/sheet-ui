import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing authentication on app load
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        sessionStorage.clear();
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData, token, rememberMe = false) => {
    setUser(userData);
    
    if (rememberMe) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('userData', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();
    navigate('/auth/sign-in');
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    const currentUser = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      const updatedUser = { ...userData, ...updatedUserData };
      
      if (localStorage.getItem('userData')) {
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem('userData', JSON.stringify(updatedUser));
      }
    }
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return !!token && !!user;
  };

  const getToken = () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
