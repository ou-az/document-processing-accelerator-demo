import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LoginForm.css'; // Reusing the same styles

interface RegisterFormProps {
  onRegisterSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { signIn, signUp } = useAuth(); // Use auth methods from context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsRegistered(false);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // Create user attributes object
      const attributes = {
        email: email,
      };

      // First try to register the user
      if (signUp) {
        try {
          console.log('Registering user:', email);
          await signUp(email, password, attributes);
          setIsRegistered(true);
          console.log('Registration successful');
          
          // Then try to sign in
          try {
            console.log('Attempting to sign in after registration');
            await signIn(email, password);
            onRegisterSuccess();
          } catch (signInError) {
            console.error('Sign in after registration failed:', signInError);
            setError('Account created but sign-in failed. Please go to login page.');
          }
        } catch (signUpError: any) {
          // Handle specific Cognito errors
          if (signUpError.name === 'UsernameExistsException') {
            setError('An account with this email already exists.');
          } else {
            setError(`Registration failed: ${signUpError.message || 'Please try again.'}`);
          }
          console.error('Registration error:', signUpError);
        }
      } else {
        // Fallback for mock auth
        await signIn(email, password);
        onRegisterSuccess();
      }
    } catch (error: any) {
      setError(`Registration failed: ${error.message || 'Please try again.'}`);
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} className="login-form">
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={8}
          />
          <small>Password must be at least 8 characters</small>
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
