/**
 * Authentication Service for the Document Processing Accelerator
 */

import AUTH_CONFIG from '../config/auth-config';

// Extract storage keys from config
const TOKEN_KEY = AUTH_CONFIG.storageKeys.token;
const USER_KEY = AUTH_CONFIG.storageKeys.user;

// Authentication service
export const authService = {
  // Sign in user
  signIn: async (username: string, password: string): Promise<any> => {
    try {
      // This is a placeholder for actual Cognito auth
      // In a real implementation, use AWS Amplify Auth or Amazon Cognito Identity SDK
      console.log(`Signing in user: ${username}`);
      
      // Mock successful authentication for development
      const mockToken = btoa(`${username}:${new Date().getTime()}`);
      const mockUser = { username, email: username };
      
      // Store authentication data
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      
      return mockUser;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },
  
  // Sign out user
  signOut: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return localStorage.getItem(TOKEN_KEY) !== null;
  },
  
  // Get current user
  getCurrentUser: (): any | null => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },
  
  // Get authentication token for API requests
  getAuthToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  }
};

export default authService;
