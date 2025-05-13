import React, { useState } from 'react';
import DocumentUpload from '../components/documents/DocumentUpload';
import DocumentList from '../components/documents/DocumentList';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = (documentId: string) => {
    console.log(`Document ${documentId} uploaded successfully`);
    // Trigger a refresh of the document list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Document Processing Accelerator</h1>
        <p className="dashboard-subtitle">Upload your documents and let AI extract the data for you</p>
      </div>

      <div className="upload-section">
        <h2>Upload Document</h2>
        <DocumentUpload onUploadComplete={handleUploadComplete} />
      </div>

      <DocumentList refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default Dashboard;
