import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import './AuthPage.css';

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to redirect after successful auth
  const from = location.state?.from?.pathname || '/';

  const handleAuthSuccess = () => {
    // Redirect to the page user was trying to access, or dashboard
    navigate(from, { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </div>
          <div 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Create Account
          </div>
        </div>
        <div className="auth-content">
          {activeTab === 'login' ? (
            <LoginForm onLoginSuccess={handleAuthSuccess} />
          ) : (
            <RegisterForm onRegisterSuccess={handleAuthSuccess} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
