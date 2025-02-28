import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, register as apiRegister, refreshToken, logout as apiLogout } from "@/api/auth";
import { getOnboardingStatus } from '@/api/onboarding';
import { User } from '@/types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  onboardingCompleted: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkOnboardingStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        setIsAuthenticated(true);
        // Optionally fetch user data here
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      
      if (response.success) {
        const { accessToken, refreshToken } = response.data;
        
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        
        setIsAuthenticated(true);
        // Optionally set user data if returned from login
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log('Registering with:', { email, password, name }); // Debug the data being sent
      const response = await apiRegister({ email, password, name });
      if (response.success) {
        const { accessToken, refreshToken } = response.data;
        
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        
        setIsAuthenticated(true);
        setUser(response.data.user); // Set user data if available
      }
      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout API to invalidate tokens on server
      await apiLogout();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Clear tokens regardless of API success
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      const response = await getOnboardingStatus();
      setOnboardingCompleted(response.data.completed);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    onboardingCompleted,
    login,
    register,
    logout,
    checkOnboardingStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}