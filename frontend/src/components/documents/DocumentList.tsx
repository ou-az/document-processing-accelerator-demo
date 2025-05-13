import React, { useEffect, useState } from 'react';
import { Document, DocumentStatus } from '../../types/document';
import { documentService } from '../../services/documentService';
import './DocumentList.css';

interface DocumentListProps {
  refreshTrigger?: number;
}

const DocumentList: React.FC<DocumentListProps> = ({ refreshTrigger }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const data = await documentService.getDocuments();
        setDocuments(data);
        setError(null);
      } catch (err) {
        setError('Failed to load documents. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [refreshTrigger]);

  const getStatusBadgeClass = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.PENDING:
        return 'status-badge pending';
      case DocumentStatus.PROCESSING:
        return 'status-badge processing';
      case DocumentStatus.COMPLETED:
        return 'status-badge completed';
      case DocumentStatus.FAILED:
        return 'status-badge failed';
      default:
        return 'status-badge';
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Handle document deletion with confirmation dialog
  const handleDeleteDocument = async (documentId: string) => {
    // Show confirmation dialog
    const confirmation = window.confirm(`Are you sure you want to delete this document?`);
    if (!confirmation) return;
    
    try {
      setDeleteInProgress(documentId);
      
      // Call the API to delete the document
      const success = await documentService.deleteDocument(documentId);
      
      if (success) {
        // Remove document from local state if API call was successful
        setDocuments(prevDocuments => 
          prevDocuments.filter(doc => doc.id !== documentId)
        );
      } else {
        // Show error message if deletion failed
        alert('Failed to delete document. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('An error occurred while deleting the document.');
    } finally {
      setDeleteInProgress(null);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading documents...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (documents.length === 0) {
    return <div className="empty-container">No documents found. Upload your first document above.</div>;
  }

  return (
    <div className="document-list-container">
      <h2>Your Documents</h2>
      <div className="document-table-container">
        <table className="document-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Upload Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="document-name">{doc.metadata.fileName}</td>
                <td>{formatBytes(doc.metadata.fileSize)}</td>
                <td>{formatDate(doc.metadata.uploadDate)}</td>
                <td>
                  <span className={getStatusBadgeClass(doc.status)}>
                    {doc.status}
                  </span>
                </td>
                <td>
                  <div className="document-actions">
                    <button 
                      className="view-button"
                      disabled={doc.status !== DocumentStatus.COMPLETED}
                      onClick={() => window.alert(`View document ${doc.id}`)}
                    >
                      View
                    </button>
                    <button 
                      className="delete-button"
                      disabled={deleteInProgress === doc.id}
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      {deleteInProgress === doc.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentList;
