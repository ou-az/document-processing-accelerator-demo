import React, { useState } from 'react';
// Import Link instead of useNavigate for more direct navigation
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAuthImplementation } from '../../services/authServiceProvider';
import './Header.css';

const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // No longer need navigate as we're using direct links and window.location
  
  // Get current auth implementation type (mock or cognito)
  const { type: authType } = getAuthImplementation();
  
  // Get user data from Auth Context
  const { user, signOut, isAuthenticated } = useAuth();
  
  // Calculate user initials for avatar
  const displayName = user?.username || user?.email || 'Guest';
  const userInitials = displayName.substring(0, 2).toUpperCase();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      // The redirect will happen automatically via the AuthContext
    } catch (error) {
      console.error('Error signing out:', error);
      window.location.href = '/login';
    }
  };
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Document Processor</span>
          {process.env.NODE_ENV !== 'production' && (
            <span className="auth-mode">[{authType}]</span>
          )}
        </div>
        <nav className="main-nav">
          <ul>
            <li className="active"><Link to="/">Dashboard</Link></li>
            <li><Link to="/documents">Documents</Link></li>
            <li><Link to="/settings">Settings</Link></li>
          </ul>
        </nav>
        <div className="user-menu">
          <button 
            className="user-button" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="user-avatar">{userInitials}</span>
            <span className="user-name">{displayName}</span>
          </button>
          {dropdownOpen && (
            <div className="user-dropdown">
              <ul>
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/settings">Settings</Link></li>
                <li className="divider"></li>
                <li><button onClick={handleSignOut}>Sign Out</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
