/**
 * Real AWS Cognito Authentication Service using AWS Amplify v5
 * 
 * This service implements the AuthService interface using the AWS Amplify v5 API
 * to interact with AWS Cognito.
 */

import { signIn, signOut, signUp, confirmSignUp } from '@aws-amplify/auth';
import { getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';
import { resetPassword, confirmResetPassword } from '@aws-amplify/auth';
import { AuthService, User, AuthImplementationType } from '../types/auth';

// Type identifier for this auth implementation
export const type: AuthImplementationType = 'cognito';

/**
 * Amplify Auth Service Implementation
 */
const amplifyAuthService: AuthService = {
  // Get current authenticated user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userInfo = await getCurrentUser();
      const { username, userId, signInDetails } = userInfo;
      
      // Extract email from signInDetails if available
      const email = signInDetails?.loginId || '';
      
      // Get user attributes to find preferred username or email
      // We don't want to display the userId as the username
      let displayUsername = "User";
      
      try {
        // Try to get a friendly username first from attributes
        const { tokens } = await fetchAuthSession();
        if (tokens?.idToken) {
          // Extract claims from JWT which may contain better username info
          const payload = tokens.idToken.payload;
          displayUsername = String(payload.preferred_username || payload.email || payload['cognito:username'] || 'User');
          console.log('Using name from token claims:', displayUsername);
        }
      } catch (attrError) {
        console.log('Could not get user attributes:', attrError);
      }
      
      return {
        id: userId,
        username: displayUsername,
        email: email,
        isAuthenticated: true,
        attributes: { 
          email,
          sub: userId
        }
      };
    } catch (error) {
      console.log('No current user', error);
      return null;
    }
  },

  // Sign in with username and password
  signIn: async (username: string, password: string): Promise<User> => {
    try {
      console.log('Attempting to sign in with:', { username });
      
      // Try to sign in with provided username
      const { isSignedIn } = await signIn({ username, password });
      
      if (isSignedIn) {
        console.log('Sign in successful');
        const userInfo = await amplifyAuthService.getCurrentUser();
        if (userInfo) {
          return userInfo;
        }
      }
      
      // If we couldn't get the user info but sign in succeeded
      return {
        id: username,
        username,
        email: username,
        isAuthenticated: isSignedIn,
        attributes: { email: username }
      };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },
  
  // Sign out user
  signOut: async (): Promise<void> => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },
  
  // Register new user
  register: async (username: string, password: string, email: string): Promise<boolean> => {
    try {
      // Use email as the username if they match, otherwise use the provided username
      // AWS Cognito requires a unique username which may be different from email
      const signUpUsername = username.includes('@') ? username : email;
      
      console.log('Registering user with:', { signUpUsername, email });
      
      const { isSignUpComplete } = await signUp({
        username: signUpUsername,
        password,
        options: {
          userAttributes: {
            email: email,
            // Adding preferred_username to help with sign-in later
            preferred_username: username
          },
          // Auto sign-in if allowed by User Pool settings
          autoSignIn: true
        }
      });
      
      console.log('Sign up complete:', isSignUpComplete);
      return isSignUpComplete;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },
  
  // Confirm registration with code
  confirmRegistration: async (username: string, code: string): Promise<boolean> => {
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username,
        confirmationCode: code
      });
      return isSignUpComplete;
    } catch (error) {
      console.error('Error confirming registration:', error);
      throw error;
    }
  },
  
  // Request password reset
  forgotPassword: async (username: string): Promise<boolean> => {
    try {
      await resetPassword({ username });
      return true;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  },
  
  // Confirm new password with code
  confirmNewPassword: async (username: string, code: string, newPassword: string): Promise<boolean> => {
    try {
      await confirmResetPassword({
        username,
        confirmationCode: code,
        newPassword
      });
      return true;
    } catch (error) {
      console.error('Error confirming new password:', error);
      throw error;
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const currentUser = await getCurrentUser();
      return !!currentUser;
    } catch (error) {
      return false;
    }
  },
  
  // Get auth token for API requests
  getAuthToken: async (): Promise<string | null> => {
    try {
      const { tokens } = await fetchAuthSession();
      return tokens?.idToken?.toString() || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }
};

export default amplifyAuthService;
