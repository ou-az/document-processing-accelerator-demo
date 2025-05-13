/**
 * Mock Authentication Service
 * 
 * This service provides a mock implementation of the authentication service
 * for local development and testing purposes.
 */

import { AuthService, User, AuthImplementationType } from '../types/auth';

// Mock user data
const mockUsers = [
  {
    id: 'user-1',
    username: 'testuser@example.com',
    email: 'testuser@example.com',
    password: 'password123',
    isAuthenticated: false,
    attributes: {
      email: 'testuser@example.com',
      email_verified: true
    }
  }
];

// Current authenticated user
let currentUser: User | null = null;

// Type identifier for this auth implementation
export const type: AuthImplementationType = 'mock';

/**
 * Mock Authentication Service Implementation
 */
export const authService: AuthService = {
  // Get current authenticated user
  getCurrentUser: async (): Promise<User | null> => {
    return currentUser;
  },

  // Sign in with username and password
  signIn: async (username: string, password: string): Promise<User> => {
    const user = mockUsers.find(u => u.username === username && u.password === password);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    currentUser = {
      ...user,
      isAuthenticated: true
    };
    
    return currentUser;
  },
  
  // Sign out user
  signOut: async (): Promise<void> => {
    currentUser = null;
  },
  
  // Register new user
  register: async (username: string, password: string, email: string): Promise<boolean> => {
    const userExists = mockUsers.some(u => u.username === username || u.email === email);
    
    if (userExists) {
      throw new Error('User already exists');
    }
    
    mockUsers.push({
      id: `user-${mockUsers.length + 1}`,
      username,
      email,
      password,
      isAuthenticated: false,
      attributes: {
        email,
        email_verified: false
      }
    });
    
    return true;
  },
  
  // Confirm registration with code
  confirmRegistration: async (username: string, code: string): Promise<boolean> => {
    // In mock implementation, any code is valid
    const user = mockUsers.find(u => u.username === username);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    user.attributes.email_verified = true;
    return true;
  },
  
  // Request password reset
  forgotPassword: async (username: string): Promise<boolean> => {
    const user = mockUsers.find(u => u.username === username);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return true;
  },
  
  // Confirm new password with code
  confirmNewPassword: async (username: string, code: string, newPassword: string): Promise<boolean> => {
    // In mock implementation, any code is valid
    const user = mockUsers.find(u => u.username === username);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    user.password = newPassword;
    return true;
  },
  
  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    return !!currentUser;
  },
  
  // Get auth token for API requests
  getAuthToken: async (): Promise<string | null> => {
    if (!currentUser) {
      return null;
    }
    
    // Generate a mock token
    return `mock-token-${currentUser.id}-${Date.now()}`;
  }
};

export default authService;
