/**
 * Authentication related type definitions
 */

// User type definition
export interface User {
  id: string;
  username: string;
  email?: string;
  isAuthenticated: boolean;
  attributes?: Record<string, any>;
}

// Auth service implementation type
export type AuthImplementationType = 'mock' | 'cognito';

// Auth service interface
export interface AuthService {
  // Get current authenticated user
  getCurrentUser: () => Promise<User | null>;
  
  // Sign in with username and password
  signIn: (username: string, password: string) => Promise<User>;
  
  // Sign out user
  signOut: () => Promise<void>;
  
  // Register new user
  register: (username: string, password: string, email: string) => Promise<boolean>;
  
  // Confirm registration with code
  confirmRegistration: (username: string, code: string) => Promise<boolean>;
  
  // Request password reset
  forgotPassword: (username: string) => Promise<boolean>;
  
  // Confirm new password with code
  confirmNewPassword: (username: string, code: string, newPassword: string) => Promise<boolean>;
  
  // Check if user is authenticated
  isAuthenticated: () => Promise<boolean>;
  
  // Get auth token for API requests
  getAuthToken: () => Promise<string | null>;
}
