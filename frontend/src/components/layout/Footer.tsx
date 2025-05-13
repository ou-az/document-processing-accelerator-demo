import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Document Processing Accelerator</h3>
            <p>An intelligent document processing solution powered by AWS and OpenAI.</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Dashboard</a></li>
              <li><a href="/documents">Documents</a></li>
              <li><a href="/settings">Settings</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Resources</h3>
            <ul>
              <li><a href="/help">Help Center</a></li>
              <li><a href="/docs">API Documentation</a></li>
              <li><a href="/support">Support</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Document Processing Accelerator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
