import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import authService from '../lib/authService';
import type { AuthState, User } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ 
    success: boolean; 
    message: string; 
    requiresMFA?: boolean; 
    mfaData?: any; 
  }>;
  signup: (userData: any) => Promise<{ success: boolean; message: string }>;
  verifyMFA: (email: string, mfaToken: string) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const INACTIVITY_LIMIT_MS = 5 * 60 * 60 * 1000; // 5 hours
const LAST_ACTIVITY_KEY = "last_activity_at_ms";

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = () => {
      const token = authService.getToken();
      const user = authService.getCurrentUser();
      
      if (token && user) {
        setAuthState({
          isAuthenticated: true,
          user,
          token,
          loading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
        });
      }
    };

    checkAuth();
  }, []);

  // Auto logout after 5 hours of inactivity.
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const now = Date.now();
    const existing = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!existing) {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    }

    const markActivity = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    };

    const checkInactivity = () => {
      const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
      const lastActivity = raw ? Number(raw) : Date.now();

      if (Date.now() - lastActivity >= INACTIVITY_LIMIT_MS) {
        authService.logout();
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
        });
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, markActivity, { passive: true })
    );
    // Keep tabs in sync: activity in one tab extends session for all tabs.
    window.addEventListener("storage", checkInactivity);

    const intervalId = window.setInterval(checkInactivity, 60 * 1000);
    checkInactivity();

    return () => {
      activityEvents.forEach((eventName) =>
        window.removeEventListener(eventName, markActivity)
      );
      window.removeEventListener("storage", checkInactivity);
      window.clearInterval(intervalId);
    };
  }, [authState.isAuthenticated]);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await authService.login({ user_email: email, password });
      
      // Only set authentication state if login is successful and no MFA is required
      if (result.success && result.user && !result.requiresMFA) {
        setAuthState({
          isAuthenticated: true,
          user: result.user,
          token: authService.getToken(),
          loading: false,
        });
      }
      
      setAuthState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, message: 'An unexpected error occurred' };
    }
  };

  const signup = async (userData: any) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await authService.signup(userData);
      setAuthState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, message: 'An unexpected error occurred' };
    }
  };

  const verifyMFA = async (email: string, mfaToken: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await authService.verifyMFA(email, mfaToken);
      
      if (result.success && result.user) {
        setAuthState({
          isAuthenticated: true,
          user: result.user,
          token: authService.getToken(),
          loading: false,
        });
      }
      
      setAuthState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, message: 'An unexpected error occurred' };
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
    });
  };

  const updateUser = (user: User) => {
    authService.updateUserData(user);
    setAuthState(prev => ({
      ...prev,
      user,
    }));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    verifyMFA,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
