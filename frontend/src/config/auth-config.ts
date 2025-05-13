/**
 * Authentication Configuration
 */

// Simple authentication configuration for development
// In production, this would be replaced with actual AWS Cognito settings
const AUTH_CONFIG = {
  // API endpoints for authentication
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  
  // Local storage keys
  storageKeys: {
    token: 'auth_token',
    user: 'auth_user'
  },
  
  // Mock token expiration time (24 hours)
  tokenExpirationMs: 24 * 60 * 60 * 1000,
  
  // Enable/disable authentication for development
  authEnabled: process.env.REACT_APP_AUTH_ENABLED !== 'false',
  
  // Default routes
  routes: {
    login: '/login',
    home: '/',
    unauthorized: '/unauthorized'
  }
};

export default AUTH_CONFIG;
