/**
 * Auth Service Provider
 *
 * This file acts as a provider for the authentication service.
 * It determines which auth service to use based on environment variables.
 */

// Import auth services
import mockAuthService from './mockAuthService';
import amplifyAuthService, { type as amplifyType } from './amplifyAuthService';

// Environment checks
const isProduction = process.env.NODE_ENV === 'production';
const useCognito = process.env.REACT_APP_USE_COGNITO === 'true';

// Determine which auth service to use
const authService = (isProduction || useCognito) ? amplifyAuthService : mockAuthService;

// Additional methods to help with the transition between mock and real implementations
const getAuthImplementation = () => {
  const implementationType = (isProduction || useCognito) ? amplifyType : 'mock';
  return {
    type: implementationType,
    service: authService
  };
};

export {
  authService as default,
  getAuthImplementation,
  mockAuthService
};
