import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authServiceProvider';

// Define types for context
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  signIn: (username: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signUp: (username: string, password: string, attributes: Record<string, string>) => Promise<any>;
  confirmSignUp: (username: string, code: string) => Promise<any>;
  forgotPassword: (username: string) => Promise<any>;
  confirmForgotPassword: (username: string, code: string, newPassword: string) => Promise<any>;
  getIdToken: () => Promise<string | null>;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  signIn: async () => null,
  signOut: async () => {},
  signUp: async () => null,
  confirmSignUp: async () => null,
  forgotPassword: async () => null,
  confirmForgotPassword: async () => null,
  getIdToken: async () => null
});

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);

  // Check auth state on initial load
  useEffect(() => {
    checkAuthState();
  }, []);

  // Function to check authentication state
  const checkAuthState = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      const isUserAuthenticated = await authService.isAuthenticated();
      
      if (currentUser && isUserAuthenticated) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in
  const signIn = async (username: string, password: string) => {
    try {
      const user = await authService.signIn(username, password);
      
      // Explicitly check if authentication was successful
      const isUserAuthenticated = await authService.isAuthenticated();
      if (!isUserAuthenticated) {
        setIsAuthenticated(false);
        setUser(null);
        throw new Error('Authentication failed: Valid credentials required');
      }
      
      await checkAuthState();
      return user;
    } catch (error) {
      console.error('Error signing in:', error);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Sign up
  const signUp = async (username: string, password: string, attributes: Record<string, string>) => {
    try {
      // Get the email from attributes or default to username
      const email = attributes.email || username;
      
      // Call the register method if it exists (needed for Cognito)
      if (typeof authService.register === 'function') {
        // Register the user with Cognito
        await authService.register(username, password, email);
      }
      
      // Always attempt to sign in after registration
      // For mock auth, this creates the user
      // For Cognito, this logs in after registration
      return await authService.signIn(username, password);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // Confirm sign up
  const confirmSignUp = async (username: string, code: string) => {
    // For our MVP implementation, we'll just return a success response
    // In a real implementation with Cognito, this would call the actual confirm sign-up API
    return { success: true };
  };

  // Forgot password
  const forgotPassword = async (username: string) => {
    // For our MVP implementation, we'll just return a success response
    // In a real implementation with Cognito, this would call the actual forgot password API
    return { success: true };
  };

  // Confirm forgot password
  const confirmForgotPassword = async (username: string, code: string, newPassword: string) => {
    // For our MVP implementation, we'll just return a success response
    // In a real implementation with Cognito, this would call the actual confirm forgot password API
    return { success: true };
  };

  // Get ID token for API calls
  const getIdToken = async (): Promise<string | null> => {
    try {
      return authService.getAuthToken();
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  };

  // Value object passed to provider
  const value = {
    isAuthenticated,
    isLoading,
    user,
    signIn,
    signOut,
    signUp,
    confirmSignUp,
    forgotPassword,
    confirmForgotPassword,
    getIdToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
