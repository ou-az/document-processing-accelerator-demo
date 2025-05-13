import React, { useRef, useState } from 'react';
import { useFileUpload } from '../../hooks/useFileUpload';

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadState, uploadFile } = useFileUpload();

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, JPEG, and PNG files are allowed.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size must be less than 10MB.');
      return;
    }

    const documentId = await uploadFile(file);
    
    if (documentId && onUploadComplete) {
      onUploadComplete(documentId);
    }
  };

  return (
    <div className="document-upload-container">
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploadState.isUploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
        />
        
        {!uploadState.isUploading && !uploadState.success && (
          <>
            <div className="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <p className="upload-text">
              Drag & drop your documents here or
              <button 
                className="browse-button"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </button>
            </p>
            <p className="upload-hint">Supported formats: PDF, JPEG, PNG</p>
          </>
        )}
        
        {uploadState.isUploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadState.progress}%` }}
              ></div>
            </div>
            <p className="progress-text">Uploading... {uploadState.progress}%</p>
          </div>
        )}
        
        {uploadState.success && (
          <div className="upload-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p>Document uploaded successfully!</p>
            <button 
              className="upload-another-button"
              onClick={() => {
                fileInputRef.current?.value && (fileInputRef.current.value = '');
                setDragActive(false);
                uploadState.documentId = null;
                uploadState.success = false;
              }}
            >
              Upload Another Document
            </button>
          </div>
        )}
        
        {uploadState.error && (
          <div className="upload-error">
            <p className="error-text">Error: {uploadState.error}</p>
            <button 
              className="retry-button"
              onClick={() => {
                fileInputRef.current?.value && (fileInputRef.current.value = '');
                setDragActive(false);
                uploadState.error = null;
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
